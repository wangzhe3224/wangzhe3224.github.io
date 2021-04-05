---
title: Go 学习笔记 Memory Access Synchronization
date: 2021-04-05
tags: [Go, Sync]
categories: Coding
---

# Go 学习笔记 Memory Access Synchronization

Go 对并发有良好的支持，主要支持两种模式：CSP 和 MAS。前一种是大家熟知的Go常用模式（`goroutine` + `chan`），后面一种其实就是传统的带锁的并发编程（`sync` 包）。Go 对这两种并发都有良好的支持，同时也提倡在合适的时候混合使用他们，因为这两种并发的应用场景不太一样。

但是总体老说，MAS 不是 Go 并发的首选模式，应该在谨慎考虑后使用，尽量多使用 CSP 构造函数。Go 的基本哲学是：

> 在可能的场景下使用 channel，将 goroutine 视为非常廉价的操作。

## 何时（不）选择 MAS

MAS实际上就是通过共享内存实现通讯，而CSP正好相反，通过通信实现共享内存。那么他们的应用场景是什么呢？

**传递值的所有者**

这种场景通常是把一个函数产生的结果（值），传递给另一个函数作为输入。为了确保并发安全，我们需要确保同一时间只有一个 goroutine拥有这个值。**这种场景应该使用 `chan` 而不是共享内存**，因为通过 channel 可以解耦两个函数，同时确保并发安全。而且，如果使用 buffer channel 还可以实现生产者-消费者模式。

**保护某个结构体内部的状态**

这种场景锁，即MAS，是最好的工具。因为当出现这种需求的时候，应该用锁把细节隐藏起来，这样调用者不需要担心破坏内部状态。换句话说，用锁控制的 critical section 被很好的局部化了。当你发现你想要传递一个锁来实现某些功能的时候，就应该小心，因为这通常意味着你应该使用 channel 而不是 锁。因为这时候，状态不再是内部状态，破坏了封装特性。

**需要协调多个函数的逻辑**

这时候应该使用 `chan`，因为 channel 的组合性更好。Go 通过 select 语句可以很好的支持组合、协作不同的 channle。

## `WaitGroup`

`WaitGroup` 的使用场景：需要等待多个 goroutine 完成，但是不在乎结果，或者有其他的 goroutine 处理结果。如果不符合这个场景，应该考虑使用 `chan` 和 `select` 来实现。

```go
func main() {
	hello := func(wg *sync.WaitGroup, id int) {
		defer wg.Done()
		fmt.Printf("Hello from %v\n", id)
	}

	const numGreeters = 5
	var wg sync.WaitGroup
	wg.Add(numGreeters)
	for i := 0; i < numGreeters; i++ {
		go hello(&wg, i+1)
	}
	// wait
	wg.Wait()
}
```

比如上面的例子，我们启动了5个 goroutine，然后通过 wg 的计数器识别是否所有的 goroutine 已经完成。

## `Mutex` 和 `RWMutex`

`Mutex` 其实就是互斥锁，用来确保内存数据的并发安全。常见的应场景如下：

```go

	var count int // 共享内存
	var lock sync.Mutex
	increment := func() {
		// 这是一个常用模式，用来确保锁被释放
		// 因为即使函数 panic 了，defer 也会被执行
		lock.Lock()
		defer lock.Unlock()
		count++
		fmt.Printf("增加： %d\n", count)
	}
	decreament := func() {
		lock.Lock()
		defer lock.Unlock()
		count--
		fmt.Printf("减小： %d\n", count)
	}

	var arithmetic sync.WaitGroup
	for i := 0; i <= 5; i++ {
		arithmetic.Add(1)
		go func() {
			defer arithmetic.Done()
			increment()
		}()
	}

	for i := 0; i <= 5; i++ {
		arithmetic.Add(1)
		go func() {
			defer arithmetic.Done()
			decreament()
		}()
	}

	arithmetic.Wait()
	fmt.Println("Done")
}
```

程序最终输出：

```
增加： 1
减小： 0
减小： -1
减小： -2
减小： -3
减小： -4
减小： -5
增加： -4
增加： -3
增加： -2
增加： -1
增加： 0
Done
```

如果，我们不用锁来保护共享内存 `count`，可以发现输出结果是错的。

不过，critical section 的存在影响并发性能，因为这部分的代码是不允许并发的。但是如果仔细思考，如果在没有写入的情况下，read是不需要锁的，可以支持任意数量的并发。因此，引入了 `RWMutex` 锁，理论上 RW 锁的效率应该更高，但是我们作如下试验：通过增加 observer 协程的数量来观察两种锁的性能区别。结果却不如所料。

```go
func main() {
	producer := func(wg *sync.WaitGroup, l sync.Locker) {
		defer wg.Done()
		for i := 5; i > 0; i-- {
			l.Lock()
			l.Unlock()
			time.Sleep(100)
		}
	}

	observer := func(wg *sync.WaitGroup, l sync.Locker) {
		defer wg.Done()
		l.Lock()
		defer l.Unlock()
	}

	test := func(count int, mutex, rwMutex sync.Locker) time.Duration {
		var wg sync.WaitGroup
		wg.Add(count + 1)
		begineTime := time.Now()
		go producer(&wg, mutex)
		for i := count; i > 0; i-- {
			go observer(&wg, rwMutex)
		}
		wg.Wait()
		return time.Since(begineTime)
	}

	tw := tabwriter.NewWriter(os.Stdout, 0, 1, 2, ' ', 0)
	defer tw.Flush()

	var m sync.RWMutex
	fmt.Fprintf(tw, "Reader\tRWMutex\tMutex\n")
	for i := 0; i < 25; i++ {
		count := int(math.Pow(2, float64(i)))
		fmt.Fprintf(
			tw,
			"%d\t%v\t%v\n",
			count,
			test(count, &m, m.RLocker()),
			test(count, &m, &m),
		)
	}
}
```

观察程序输出，并没有发现明显的效率提升，猜测 Go 的编译器应该是进行了相关的优化。

```
Reader  RWMutex       Mutex
1       31.407µs      2.889µs
2       9.281µs       28.884µs
4       16.783µs      5.699µs
8       18.108µs      29.188µs
16      17.546µs      21.928µs
32      37.897µs      46.451µs
64      138.729µs     59.443µs
128     84.53µs       84.29µs
256     162.436µs     134.7µs
512     257.119µs     177.244µs
1024    498.188µs     421.574µs
2048    638.593µs     688.569µs
4096    1.282961ms    1.181315ms
8192    2.411899ms    2.194452ms
16384   4.324171ms    4.209515ms
32768   8.863672ms    8.364724ms
65536   17.675036ms   16.549381ms
131072  36.074797ms   32.332008ms
262144  71.848213ms   63.451094ms
524288  146.209094ms  122.38836ms
```

不过结果仍然可以看出，Go 的运行时在家用机上处理5百万个 goroutine 是非常轻松的。


## `Cond`

`Cond` 的应用场景是：当一个任务需要等待另一个任务给他信号才能继续的时候，我们需要 Cond 作为信号。换句话说，我们希望等待某个条件成立后，再继续执行后面的指令。

假设我们现在有一个队列，长度限制为2，我们有10个任务需要入列，我们希望一旦队列允许（长度小于2），就马上放入新的任务等待处理。

```go
func main() {
	c := sync.NewCond(&sync.Mutex{})
	queue := make([]interface{}, 0, 10)
    
	removeFromQueue := func(delay time.Duration) {
		time.Sleep(delay * time.Second)
		c.L.Lock()
		queue = queue[1:]
		fmt.Println("remove from queue")
		c.L.Unlock()
        // 发送信号
		c.Signal()
	}

	for i := 0; i < 10; i++ {
		c.L.Lock()
		for len(queue) == 2 {
            // 如果 queue 慢了就等待，阻塞，直到收到信号
			c.Wait()
		}
		fmt.Println("adding to queue")
		queue = append(queue, struct{}{})
		go removeFromQueue(1)
		c.L.Unlock()
	}
}
```

`Cond` 还有非常有用的函数：`Broadcast`。这个函数会像所有等待条件的 goroutine 发送信号！`signal` 功能可以轻松采用 `chan` 来模拟，但是 `broadcast` 就不那么容易，而且它的效率很高。

## `Once`

`Once` 其实是一个比较常用的抽象，他确保一个函数只会被调用一次，无论有多少个并发的 goroutine 在执行这个函数。

```go
func main() {
	var count int

	increment := func() {
		count++
	}

	var one sync.Once
	var wg sync.WaitGroup
	wg.Add(100)
	for i := 0; i < 100; i++ {
		go func() {
			defer wg.Done()
			one.Do(increment)
		}()
	}

	wg.Wait()
	fmt.Printf("Count is %d\n", count)
}
```

上面这个程序会打印 1，而不是100。

```go
var count int
increment := func() { count++ } 
decrement := func() { count-- }
var once sync.Once 
once.Do(increment) 
once.Do(decrement)
fmt.Printf("Count: %d\n", count)
```

但是 有个地方需要注意 Once，就是 `Once.Do` 不会关心调用的函数是不是一样，他只确保 Do 被调用一次！
## `Pool`

Pool 是一个并发安全的对象池，主要是用来维护一些开销较大且数量有新的资源，比如数据库连接等。

```go
func main() {
	myPool := &sync.Pool{
		New: func() interface{} {
			fmt.Println("Creating new instance.")
			return struct{}{}
		}, // hmm 这是个必要的逗号，但是感觉好多鱼
	}

	inst := myPool.Get()
	myPool.Put(inst)
	myPool.Get()
	// 这段程序只会维护一个 instance，即使反复的 Get，因为我们 Put
}
```

值得注意的是，Pool 维护的对象是不会被垃圾回收的，这也是我们用 Pool 的主要原因。我们希望维持这些对象，而不是被回收。而且在一些需要性能场景，我们还会提前创立很多对象，形成一个 Pool，以便在需要的时候节约时间，提高吞吐量。

举个网络连接的例子，一下的代码是不采用 pool 的：

```go
package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net"
	"sync"
	"testing"
	"time"
)

func connectToService() interface{} {
	time.Sleep(1 * time.Second)
	return struct{}{}
}

func startNetworkDaemon() *sync.WaitGroup {
	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		server, err := net.Listen("tcp", "localhost:8080")
		if err != nil {
			log.Fatalf("cannot listen: %v", err)
		}
		defer server.Close()
		wg.Done()

		for {
			conn, err := server.Accept()
			if err != nil {
				log.Printf("cnanot accept connection: %v", err)
				continue
			}
			connectToService()
			fmt.Fprintln(conn, "")
			conn.Close()
		}
	}()

	return &wg
}

func init() {
	daemonStarted := startNetworkDaemon()
	daemonStarted.Wait()
}

func BenchmarkNetworkRequest(b *testing.B) {
	for i := 0; i < b.N; i++ {
		conn, err := net.Dial("tcp", "localhost:8080")
		if err != nil {
			b.Fatalf("cannot dial host: %v", err)
		}
		if _, err := ioutil.ReadAll(conn); err != nil {
			b.Fatalf("cannot read: %v", err)
		}
		conn.Close()
	}
}
```

运行： `go test -benchtime=10s -bench=.` 得到测试结果：

```
goos: darwin
goarch: amd64
pkg: gopl.io/ch8
BenchmarkNetworkRequest-12            10        1004815055 ns/op
PASS
ok      gopl.io/ch8     11.255s
```

下面我们看一下 Pool 的版本，我们只需要改动两个函数：

```go
func warmServiceConnCache() *sync.Pool {
	p := &sync.Pool{
		New: connectToService,
	}
	for i := 0; i < 10; i++ {
		p.Put(p.New())
	}
	return p
}

func startNetworkDaemon() *sync.WaitGroup {
	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		connPool := warmServiceConnCache()

		server, err := net.Listen("tcp", "localhost:8080")
		if err != nil {
			log.Fatalf("cannot listen: %v", err)
		}
		defer server.Close()

		wg.Done()

		for {
			conn, err := server.Accept()
			if err != nil {
				log.Printf("cannot accept connection: %v", err)
				continue
			}
			svcConn := connPool.Get()
			fmt.Fprintln(conn, "")
			connPool.Put(svcConn)
			conn.Close()
		}
	}()
	return &wg
}
```

结果如下：

```
goos: darwin
goarch: amd64
pkg: gopl.io/ch8
BenchmarkNetworkRequest-12          1822           7720869 ns/op
PASS
ok      gopl.io/ch8     32.769s
```

注意到 ns/op 降低到了 7，000，000 ns， 对比之前的版本是性能提高了约100倍！

但是使用 Pool 也应该注意：

- New 函数调用时线程安全的！
- Get 返回的对象的状态是不完全确定的
- 记得用 Put 返回对象，不然 Pool 就没有意义了！
- 一个 Pool 只有一类对象。。。很专一


## 参考：

- [Concurrency in Go](https://www.oreilly.com/library/view/concurrency-in-go/9781491941294/)


###### tags: `Go` `Sync`