---
title: 用Python重建Go并发模型 1
date: 2021-04-04
tags: [Go, Python, Concurrency]
categories: Coding
---

# 用Python重建Go并发模型 1

> 主要译自[Go Concurrency from the Ground Up](http://www.doxsey.net/blog/go-concurrency-from-the-ground-up)

通过实现 Go 的并发模型增加对并发的理解和使用。

本文一共四个部分，部分1 针对前两个，后面两个在部分2：
- [设计](#设计)：介绍 Go 的并发模型基本API
- [实现1](#实现1：非抢占调度)：实现一个非抢占、单线程的 goroutine 调度器
- 实现2：带缓冲的 Channel
- 实现3：Async/Await 范式实现

## 设计

我们的设计主要包含三个主要部分：调度器、channel和select操作。有了这几个东西，我们就可以重建 go 的并发模型。

### 调度方式

考虑如下简单程序：

```go 
// main.go
package main

func main() {
	go a()
	go b()
	select {} // prevent the program from terminating, ignore for now
}
func a() {
	go aa()
	go ab()
}
func aa() { println("aa") }
func ab() { println("ab") }

func b() {
	go ba()
	go bb()
}
func ba() { println("ba") }
func bb() { println("bb") }
```

运行 `go run main.go` 会输出：

```
❯ go run main.go
bb
ba
ab
aa
fatal error: all goroutines are asleep - deadlock!

goroutine 1 [select (no cases)]:
main.main()
        mani.go:6 +0x52
exit status 2
```

程序首先启动两个 goroutine，`a` 和 `b`，然后他们分别会启动两个给子的子协程。这里需要注意，goroutine 本身是没有父子关系的（对吗？）。程序的执行情况如下所示：

![并行执行](https://i.imgur.com/TKxKBUK.png)

每一个 goroutine 会占据一个线程，实现了并行并发。但是执行顺序也是随机的，我们看到 `bb` 比 `ab` 更先被打印了。

但是，我们也观察到程序出现了 fatal error，因为 select 是阻塞操作，为了让方便观察结果，但是由于 runtime 已经没有任何活跃的 goroutine 了，程序就会报错。（当然，main goroutine 仍然是活跃的）。

当然，我们也可以通过同步操作，让所有 goroutine 在一个线程中执行。

![顺序执行](https://i.imgur.com/YbRfzzW.png)

这两种调度方式都可以，但是为了简化我们后面的实现，我们选择后者，即单线程并发。

### Channel

Go 通过 Chan 实现并发通讯。考虑如下程序：

```go 
import "time"


func main() {
	ch := make(chan int)
	go a(ch)
	go b(ch)
	select {} // prevent the program from terminating, ignore for now
}
func a(ch chan int) {
	println("a before")
	ch <- 5
    time.Sleep(1 * time.Second)
	println("a after")
}
func b(ch chan int) {
	println("b before")
	println(<-ch)
	println("b after")
}
```

通过 `ch` 对象，我们可以确保 "b after" 一定会在 "a before" 以后执行。这就是所谓的同步，而两个 goroutine 就是在 `ch` 发生连接。

程序输出：

```
❯ go run main.go
b before
a before
5
b after
a after
```

### Select

Go  的 `select` 语句可以用来等待多个 Chan，然后处理第一个被释放的 Chan。

看如下程序：

```go 
func main() {
	ch1, ch2 := make(chan int), make(chan int)
	go a(ch2)
	select {
	case value := <-ch1:
		println("1:", value)
	case value := <-ch2:
		println("2:", value)
	}
}
func a(ch chan int) {
	ch <- 5
}
```

select 会同时等待 ch1 和 ch2，由于 a 会向 ch2 传递值，select 选择第二个branch，打印 `2：`。


## 实现1：非抢占调度

我们首先来看下 Go 的并发 API：

|          | Python                               | Go                            |
| -------- | ------------------------------------ | ----------------------------- |
| `go`     | `go(lambda: print("in py routine"))` | `go println("in py routine")` |
| `make`   | `ch = make()`                        | `ch := make(chan int)`        |
| `len`    | `len(ch)`                            | `len(ch)`                     |
| `cap`    | `cap(ch)`                            | `cap(ch)`                     |
| `send`   | `send(ch, 5, lambda: print("sent"))` | `ch <- 5`                     |
| `recv`   | `recv(ch, lambda value, ok: pass)`   | `value, ok := <- ch`          |
| `close`  | `close(ch)`                          | `close(ch)`                   |
| `select` | `select([(), ()])`                   | `select {case ..}`            |
| `run`    | `run()`                              | 在主函数自动执行                 |

我们看到 Python 版本的 API 中 send 和 recv 函数都有带有一个回调函数，这些是为了在阻塞之后可以继续执行回调函数。这种方式比较容易实现调度，但是看起来有点不舒服，在最后一个部分，我们会采用 python 的 `async` 和 `await` 语法去掉回调函数。

API 有了，我们还需要实现一些数据结构，比如 Channel。Channel 的本质其实就是阻塞队列。我们采用如下实现：

```python 
class Channel:

    def __init__(self):
        self.closed = False
        # 这里是两个队列用来存放发送和接受的信息
        self.waiting_to_send = WaitingQueue()
        self.waiting_to_recv = WaitingQueue()


class WaitingQueue(list):
    total = 0

    def enqueue(self, x):
        WaitingQueue.total += 1
        self.append(x)

    def dequeue(self, x=None):
        if x is None:
            x = self.pop(0)
            WaitingQueue.total -= 1
        else:
            idx = self.index(x)
            if idx is not None:
                self.pop(idx)
                WaitingQueue.total -= 1
        
        return x
```

接下来我们实现调度相关的函数：

```python
execution_queue = []

def go(callback):
    if callable:
        execution_queue.appendc(callback)
        
def run():
    WaitingQueue.total = 0

    while execution_queue:
        # 进入执行循环
        f = execution_queue.pop(0)
        f()
    
    if WaitingQueue.total > 0:
        # 如果执行队列已经空了，但是还有在等待的任务，就会形成 deadlock
        raise RuntimeError("fatal error: all goroutines are asleep - deadlock")
```

**Channel Methods**

相关的解释直接放在代码注释，目的就是模拟 Go 对 API 的各种 spec。

```python 
def make():
    return Channel()

def len(chan):
    # unbuffered channel 长度永远是0
    return 0

def cap(chan):
    return 0

def send(chan, value, callback):
    """ Go's Spec: 
    Communication blocks until the send can proceed.
    A send on an unbuffered channel can proceed if a receiver is ready.
    [...] A send on a closed channel proceeds by causing a run-time panic. 
    A send on a nil channel blocks forever.
    """
    # Nil chan 直接返回
    if chan is None:
        WaitingQueue.total += 1
        return 
    
    # chan 关闭，panic
    if chan.closed:
        raise RuntimeError("panic: send on closed channel")
    
    # 有接受请求，处理
    if chan.waiting_to_recv:
        receiver = chan.waiting_to_recv.dequeue()
        go(callback)
        go(lambda: receiver(value, True))
        return 

    # 无接收请求，入队，阻塞
    chan.waiting_to_send.enqueue((value, callback))

def recv(channel, callback):
    """ Go's Spec:
    The expression blocks until a value is available. 
    Receiving from a nil channel blocks forever.
    A receive operation on a closed channel can always proceed immediately, 
     yielding the element type's zero value after any previously sent values have been received.
    """
    # "Receiving from a nil channel blocks forever."
    if channel is None:
        WaitingQueue.total += 1
        return

    # "if anything is currently blocked on sending for this channel, receive it"
    if channel.waiting_to_send:
        value, sender = channel.waiting_to_send.dequeue()
        go(lambda: callback(value, True))
        go(sender)
        return

    # "A receive operation on a closed channel can always proceed immediately,
    # yielding the element type's zero value after any previously sent values have been received."
    if channel.closed:
        go(lambda: callback(None, False))
        return

    channel.waiting_to_recv.enqueue(callback)

def close(channel):
    # if the channel is already closed, we panic
    if channel.closed:
        raise Exception("close of closed channel")

    channel.closed = True

    # complete any senders
    while channel.waiting_to_send:
        value, callback = channel.waiting_to_send.dequeue()
        send(channel, value, callback)

    # complete any receivers
    while channel.waiting_to_recv:
        callback = channel.waiting_to_recv.dequeue()
        recv(channel, callback)
```

`select` API 实现相对复杂，我们的目的是如下使用场景：

```python 
select(
  [
    (recv, ch1, lambda v1, ok: print("received!", v1, ok)),
    (send, ch2, v2, lambda: print("sent!")),
    (default, lambda: print("default!"))
  ],
  lambda: print("after select")
)
```

对应的 Go 程序为：

```go 
select {
case v1, ok := <-ch1:
  println("received!", v1, ok)
case ch2 <- v2:
  println("sent!")
default:
  println("default!")
}
println("after select")
```

根据 Spec，select的行为如下：

- 如果有一个或以上 case 可以执行，随机选择一个执行
- 如果没有 case 可以执行，执行 default
- 如果内有 case 可以执行，也没有 default，

```python 
from random import randint
import builtins

# used to indicate the default case in a select
default = object()

def select(cases, callback=None):
    def is_ready(case):
        if case[0] == send:
            return case[1].closed or case[1].waiting_to_recv
        elif case[0] == recv:
            return case[1].closed or case[1].waiting_to_send
        elif case[0] == default:
            return False

    # first see if any of the cases are ready to proceed
    ready = [case for case in cases if is_ready(case)]
    if ready:
        # pick a random one
        case = ready[randint(0, builtins.len(ready)-1)]
        if case[0] == send:
            send(case[1], case[2], case[3])
        elif case[0] == recv:
            recv(case[1], case[2])
        go(callback)
        return

    # next see if there's a default case
    defaults = [case for case in cases if case[0] == default]
    if defaults:
        defaults[0]()
        go(callback)
        return

    # finally we will enqueue each case into the waiting queues
    # we also update each callback so it will cleanup all the
    # other cases so only one is fired

    wrapped = []

    def cleanup():
        for case in wrapped:
            if case[0] == send:
                case[1].waiting_to_send.dequeue((case[2], case[3]))
            elif case[0] == recv:
                case[1].waiting_to_recv.dequeue(case[2])
        go(callback)

    # overwrite all the callbacks and enqueue into the waiting queues
    for case in cases:
        if case[0] == send:
            new_case = (case[0], case[1], case[2],
                        lambda: (cleanup(), case[3]()))
            case[1].waiting_to_send.enqueue((new_case[2], new_case[3]))
            wrapped.append(new_case)
        elif case[0] == recv:
            new_case = (case[0], case[1],
                        lambda value, ok: (cleanup(), case[2](value, ok)))
            case[1].waiting_to_recv.enqueue(new_case[2])
            wrapped.append(new_case)
```

## 一个例子 Concurrent Merge Sort

一下是一个 go 版本的并发排序：

```go 
func merge(l, r []int) []int {
	m := make([]int, 0, len(l)+len(r))
	for len(l) > 0 || len(r) > 0 {
		switch {
		case len(l) == 0:
			m = append(m, r[0])
			r = r[1:]
		case len(r) == 0:
			m = append(m, l[0])
			l = l[1:]
		case l[0] <= r[0]:
			m = append(m, l[0])
			l = l[1:]
		case l[0] > r[0]:
			m = append(m, r[0])
			r = r[1:]
		}
	}
	return m
}

func ConcurrentMergSort(xs []int) []int {
	switch len(xs) {
	case 0:
		return nil
	case 1, 2:
		return merge(xs[:1], xs[1:])
	default:
		lc, rc := make(chan []int), make(chan []int)

		go func() {
			lc <- ConcurrentMergSort(xs[:len(xs)/2])
		}()
		go func() {
			rc <- ConcurrentMergSort(xs[len(xs)/2:])
		}()

		return merge(<-lc, <-rc)
	}
}

func main() {
	a := []int{3, 2, 1, 3, 4, 5}
	b := ConcurrentMergSort(a)
	fmt.Println(b)
}
```

用对应的Python API 实现为：

```python 
def merge(l, r):
    m = []
    while len(l) > 0 or len(r) > 0:
        if len(l) == 0:
            m.append(r[0])
            r = r[1:]
        elif len(r) == 0:
            m.append(l[0])
            l = l[1:]
        elif l[0] <= r[0]:
            m.append(l[0])
            l = l[1:]
        else:
            m.append(r[0])
            r = r[1:]
    return m
    
def concurrent_merge_sort(xs, callback):
    if len(xs) <= 1:
        callback(xs)
    else:
        lc, rc = make(), make()
        go(lambda: concurrent_merge_sort(xs[:len(xs)//2], lambda l:
                                         send(lc, l, lambda: None)))
        go(lambda: concurrent_merge_sort(xs[len(xs)//2:], lambda r:
                                         send(rc, r, lambda: None)))
        recv(lc, lambda l, ok:
             recv(rc, lambda r, ok:
                  callback(merge(l, r))))

# example usage:
def test_concurrent_merge_sort():
    def callback(result):
        assert result == [1, 2, 3, 4, 5]
    concurrent_merge_sort([2, 3, 1, 5, 4], callback)
    run()
```


###### tags: `Go` `Python`