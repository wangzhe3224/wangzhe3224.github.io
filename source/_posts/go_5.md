---
title: Go 学习笔记5 并发编程
date: 2021-04-02
tags: [Go, Go学习]
categories: Coding
---

# Go 学习笔记5 并发编程

Go 的一个主要的特征是对多核并发的支持，特别是 CSP（Communicating Sequential Processes） 模型。Go 主要支持两类并发模型：CSP 和 共享内存。

## CSP 模型

Go 的 CSP 模型主要是通过 goroutine 和 channel 两个基本模块完成的。

### Goroutine （协程）

goroutine 本质上属于协程，即可以多次中断和重启的函数。而当go执行进入main函数的时候，都会启动一个 goroutine，即 main goroutine。值得注意的是，一旦主协程结束，Go 会结束其他一切协程。后文中协程和goroutine取相同的意思。

```go=
package main

import (
	"fmt"
	"time"
)

func main() {
    // spinner 会跟 fib 函数“同时”进行
	go spinner(100 * time.Millisecond)
	const n = 45
	fibN := fib(n)
	fmt.Printf("\rFib(%d) = %d\n", n, fibN)
}

func spinner(delay time.Duration) {
	for {
		for _, r := range `-\|/` {
			fmt.Printf("\r%c", r)
			time.Sleep(delay)
		}
	}
}

func fib(x int) int {
	if x < 2 {
		return x
	}
	return fib(x-1) + fib(x-2)
}
```

上面是一个简单的例子，一个普通函数在调用时加入 go 关键字后，runtime会启动一个新的协程运行该函数。Goroutine 是可以nested的，即可以在goroutine内部启动其他的协程。

### Chan
Goroutine 实现了任务的并发执行，而任务之间的沟通是通过 `channel` 完成的。一个 goroutine 可以通过 channel 发送信息给其他 goroutine 或者接受信息。我们可以通过`make(chan [T])` 来获得一个类型为 T 的 chan 的指针。 chan 类型支持两个通讯操作：`ch <- x` 和 `<-ch`，分别代表发送和接受。支持一个 close 函数来关闭Chan。Chan还有自己的承载能力（capacity）。

#### 无缓冲 Chan

Chan 的通讯操作都是阻塞的，无缓冲管道也叫做同步管道。因为这种管道可以保证信息的读取和发送顺序。

Chan 可以用来连接多个 goroutine 形成一个 pipeline。这种模式形成了有趣的编程模式。

```go=
package main

import "fmt"

func main() {
	naturals := make(chan int)
	squares := make(chan int)

	go func() {
		for x := 0; x < 10; x++ {
			naturals <- x
		}
		// without this, dead lock , guess why?
		close(naturals)
	}()

	go func() {
		for {
			x, ok := <-naturals
			if !ok {
				break
			}
			squares <- x * x
		}
		close(squares)
	}()

	for x := range squares {
		fmt.Println(x)
	}
}
```

#### 单向 Chan

上面提到的 Chan 是双向，我们也可以指定单向 Chan。上面的管道程序可以重写：

```go=
package main

import "fmt"

func counter(out chan<- int) {
	for x := 0; x < 100; x++ {
		out <- x
	}
	close(out)
}

func squarer(out chan<- int, in <-chan int) {
	for v := range in {
		out <- v * v
	}
	close(out)
}

func printer(in <-chan int) {
	for v := range in {
		fmt.Println(v)
	}
}

func main() {
	naturals := make(chan int)
	squares := make(chan int)

	go counter(naturals)
	go squarer(squares, naturals)
	printer(squares)
}
```

#### 缓冲 Chan

缓冲 Chan 某种程度解除了同步性。

Chan 与 Go 的调度器有紧密的联系，应该谨慎使用，特别是应该确保他们有接收端和发送端。如果一个 goroutine 永远无法从 chan 获得信息，或造成 goroutine 泄漏，即使 GC 也无法回收他们。

选择缓冲 Chan 的 capacity 也很重要，如果缓冲值不够，会造成 deadlock。
### 例子

我们举个例子，我们有10个计算任务，但是每个任务的执行时间随机，我们希望并发执行，并且搜集结果。

首先，我们通过一个缓冲 Chan 存储计算结果并且确定何时全部任务完成。然后，我们把任务包裹进入 goroutine进行执行。

```go=
func task() (int, error) {
	n := rand.Intn(5)
	fmt.Printf("Executing task, need %d second\n", n)
	time.Sleep(time.Duration(n) * time.Second)
	fmt.Println("Done.")
	return n, nil
}

type result struct {
	number int
	err    error
}

func main() {
	rand.Seed(time.Now().UnixNano())
	var tasksNum int = 10
	var finalRes []result
	ch := make(chan result, tasksNum)
	for i := 0; i < tasksNum; i++ {
		go func() {
			var res result
			res.number, res.err = task()
			ch <- res
		}()
	}

	for i := 0; i < tasksNum; i++ {
		res := <-ch
		finalRes = append(finalRes, res)
	}

	fmt.Println(finalRes)
}
```

## 共享内存模型

讨论了半天并发，究竟什么是并发？假设我们有两个任务，A 和 B，什么叫 AB 的并发执行？其实，并发这个概念是针对事件，event，的发生顺序定义的。当我们可以确定的知道两个事件的发生顺序，那么这两个事件就是顺序的，反之就是并发的。

共享内存模型有一个常见且严重的问题：race condition，RC。RC是指一个内存区域（变量）被两个或以上线程/协程/进程并发访问且其中至少一个是写入操作的状态。根据定义，我们有三种方式避免RC：

- 不要写入内存
- 不要并发访问内存，比如通过使用 Chan
- 并发访问内存，但是一次只允许一个线程访问，mutual exclusion

第三种其实就是锁。Go 可以使用 buffer 为 1 的 Chan 模拟，或者直接使用 `sync.Mutex`。

使用锁或者 Chan 也会影响到内存的同步。现代的 CPU 一般都有内存缓存，CPU核心不会直接把内容写入内存，而是先写入缓存，然后再特定的时间Commit到内存上。这个过程commit的顺序不一定与写入的顺序的同步的。

常用的模式就是：在可能地方，把变量控制在同一个协程内部，对于其他变量采用锁控制访问。

Go 提供了 `-face` flag 来帮助检测 RC。

## Goroutine 和 线程 的异同

最大的区别在于 call stack 的大小。线程根据系统不同，通常分配一个固定大小的 call stack ，通常是 2MB。而 Goroutine 的 call stack 大小是可变的，初始值只有 2KB，而通常可以增大到 1GB。

第二个区别在于调度。线程由系统负责调度，每个几百ms，会通过触发中断将CPU的执行权交还给 kernel，而 kernel 需要一些列的操作完成线程切换：保存用户线程状态，读取下一个线程的状态，更新调度器数据结构。而 Go 的运行时则不是完全抢占式调度，它会根据 goroutine 执行的指令进行灵活调度，比如一个 goroutine 调用 sleep，Go 会中断他执行另一个协程，而在苏醒的时候唤醒之前的进程。而且切换过程不涉及 kernel 的一系列转换。

###### tags: `Go` `Go学习`