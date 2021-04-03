---
title: Go 学习笔记2 语法、语义
date: 2021-03-28
tags: [Go, Go学习]
categories: Coding
---

# Go 学习笔记2：语法和语义

这个部分主要总结 Go 涉及的基本语法和语义，即之前提到的前两个角度。

## 整体印象

- 语法简单
- 过程式语言 + 函数一等公民
- 通过结构体 + 接口实现抽象
- 协程并发
- GC，value-oriented language
- FFI支持很好

Go 的语法比较简单，涉及到的关键字大约只有27个，对比 Python 大概有33个，而 Rust 则超过40个，Java 保留了约52个关键字，而 C++ 则保留了超过90个关键字。

Go 语法比较简洁，看起来像是加了大括号的 Python，比如 `for` 语句；继承了 C 的很多表达方式，比如指针、结构体等（但是去掉了分号，简直不能太舒服）。

从编程范式的角度看，属于过程式语言，但是支持高阶函数，支持闭包、多值函数等等，大大增加了语言的灵活性。没有复杂的“面向对象”支持，比如继承，语言的抽象是通过结构体和接口实现的。

Go的运行时有两个主要的任务，一个是GC，另一个就是携程调度。通常 Go 可以支持超过10万协程的调度工作。

协程原生支持，即 `goroutine`。协程的通讯是通过 `channel` 完成的，由于 channel 是一个阻塞的、有类型的数据管道，大大提高了通讯的可靠性（不过这个部分将来可能需要花更多精力去了解）。

最后就是 Go 是 GC 语言，由于 Go 语言本身运行时比较简单，所以GC也应该不像Java那么复杂，性能方面已经将延迟降低到1ms以下。（这个部分也可以详细了解一下）。

## 关键字

关键词分成四类：声明、数据结构、控制流、函数控制和构造函数。

**声明** 6 个

`const`, `var`, `func`, `type`, `import`, `package`

**数据结构** 4 个

`chan`, `interface`, `map`, `struct`

**控制流** 13 个

`break`, `case`, `continue`, `default`, `if`, `else`, `fallthrough`, `for`, `goto`, `range`, `return`, `select`, `switch`

**函数控制** 2 个

`defer`, `go`

**构造函数** 2 个

`make`, `new`


## 语法、语义

一个简单的 Go 程序看起来如下，乍一看像 C + Python（带类型注释）。

```go 
package main

import "fmt"

const (
	// Create a huge number by shifting a 1 bit left 100 places.
	// In other words, the binary number that is 1 followed by 100 zeroes.
	Big = 1 << 100
	// Shift it right again 99 places, so we end up with 1<<1, or 2.
	Small = Big >> 99
)

func needInt(x int) int { return x*10 + 1 }
func needFloat(x float64) float64 {
	return x * 0.1
}

func main() {
	fmt.Println(needInt(Small))
	fmt.Println(needFloat(Small))
	fmt.Println(needFloat(Big))
}
```

- struct 和 interface
- 数据结构
- 高阶函数
- 控制语句
- 指针
- goroutines
- error处理


### struct 和 interface

结构体也基本上维持了 C 的语法和语义，只不过所有的类型都变成了后缀，而不是前缀，比较现代，Python 的类型注释也是后缀的。访问方式也是通过 `.` 运算符。还有一个不一样的地方是，`.` 运算符不仅可以用在结构体本身，也可以直接用在结构体的指针上。

Go 不支持“面向对象”，是通过接口实现抽象的。Go 的接口实现是隐式的，不是显式的。

关于这个部分需要专门的展开。

```go 
package main

import "fmt"

type Vertex struct {
    X int
    Y int
}

// method
func (v Vertex) Abs() float64 {
	return math.Sqrt(v.X*v.X + v.Y*v.Y)
}

// interface
type Abser interface {
	Abs() float64
}

func main() {
	v := Vertex{1, 2}
	p := &v
	p.X = 1e9  // 注意这里， p 是 Vertex 的指针
	fmt.Println(v)
    fmt.Println(v.Abs())
}
```


### 数据结构

主要的数据结构有：
- Array，`[n]T`，固定长度
- Slice，`[]T`，即长度可变的 Array
- Map, `map[T1]T2`

```go 
package main

import "fmt"

func main() {
	var a [2]string
	a[0] = "Hello"
	a[1] = "World"
	fmt.Println(a[0], a[1])
	fmt.Println(a)
    // array
	primes := [6]int{2, 3, 5, 7, 11, 13}
	fmt.Println(primes)

    // slice
    q := []int{2, 3, 5, 7, 11, 13}
	fmt.Println(q)
    
    s := []struct {
		i int
		b bool
	}{
		{2, true},
		{3, false},
		{5, true},
		{7, true},
		{11, false},
		{13, true},
	}
	fmt.Println(s)
    
    // make 函数可以构造数据结构的本身
    b := make([]int, 0, 5)
    
    // Map
    m = make(map[string]Vertex)
	m["Bell Labs"] = Vertex{
		40.68433, -74.39967,
	}
	fmt.Println(m["Bell Labs"])
}
```

关于这个部分需要专门的展开。


### 高阶函数

Go 里面函数是一等公民，可以作为值来传递。

```go 
package main

import (
	"fmt"
	"math"
)

func compute(fn func(float64, float64) float64) float64 {
	return fn(3, 4)
}

func adder() func(int) int {
    // 闭包
	sum := 0
	return func(x int) int {
		sum += x
		return sum
	}
}

func main() {
	hypot := func(x, y float64) float64 {
		return math.Sqrt(x*x + y*y)
	}
	fmt.Println(hypot(5, 12))

	fmt.Println(compute(hypot))
	fmt.Println(compute(math.Pow))
}
```

关于这个部分需要专门的展开。


### 控制语句

循环的语法其实跟Python很像。

```go 
package main

import "fmt"

var pow = []int{1, 2, 4, 8, 16, 32, 64, 128}

func main() {
	for i, v := range pow {
		fmt.Printf("2**%d = %d\n", i, v)
	}
}
```

### 指针

指针这块 Go 基本继承了 C 的语法和语义，采用 `*` 和 `&` 。

```go 
package main

import "fmt"

func main() {
	i, j := 42, 2701

	p := &i         // point to i
	fmt.Println(*p) // read i through the pointer
	*p = 21         // set i through the pointer
	fmt.Println(i)  // see the new value of i

	p = &j         // point to j
	*p = *p / 37   // divide j through the pointer
	fmt.Println(j) // see the new value of j
}
```


### goroutines

协程是 Go 实现并发的手段，需要配合 channel 进行通讯。这里需要以后展开。

```go 
package main

import "fmt"

func sum(s []int, c chan int) {
	sum := 0
	for _, v := range s {
		sum += v
	}
	c <- sum // send sum to c
}

func main() {
	s := []int{7, 2, 8, -9, 4, 0}

	c := make(chan int)
	go sum(s[:len(s)/2], c)
	go sum(s[len(s)/2:], c)
	x, y := <-c, <-c // receive from c

	fmt.Println(x, y, x+y)
}
```

### Error处理

Go 的异常处理比较独特，需要进一步展开。

```go 
package main

import (
	"fmt"
	"time"
)

type MyError struct {
	When time.Time
	What string
}

func (e *MyError) Error() string {
	return fmt.Sprintf("at %v, %s",
		e.When, e.What)
}

func run() error {
	return &MyError{
		time.Now(),
		"it didn't work",
	}
}

func main() {
	if err := run(); err != nil {
		fmt.Println(err)
	}
}
```



## 总结

本篇快速的浏览了一些 Go 的基本语法和语义。

## 参考

- https://medium.com/wesionary-team/know-about-25-keywords-in-go-eca109855d4d
- https://blog.golang.org/ismmkeynote
- https://tour.golang.org/list

###### tags: `Go` `Go学习`