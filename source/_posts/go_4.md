---
title: Go 学习笔记4 抽象方法
date: 2021-03-30
tags: [Go, Go学习]
categories: Coding
---

# Go 学习笔记4 抽象模式

Go 的抽象方法主要通过函数、方法和接口三种方式。

## 函数，Function

Go 中函数是一等公民，可以被传递、返回，具有类型，是组织程序的基本元素。

```
func name(params-list) (returns-list) {
    body
}
```

returns-list 是可选的，但是如果写明，则函数内部构造局部变量，并且会被返回。

```go
funcsub(x,yint)(zint) {z=x-y;return}  // 注意这里需要 return 关键字，但是不需要 z
```

Go 的函数参数没有默认值，参数的名字也不重要。（ hmm 会不会很不方便？）函数全部是 call by value，即复制传入参数。

Go 递归函数的深度可以非常深，call stack 可以达到几个G大小。

Go 的函数支持多值返回。（很方便，而且返回值和状态是常用模式）

Go 的函数没有异常捕捉机制，而是显式采用 error 处理，如果真的出现异常，程序会直接 panic 终止，以避免进一步的问题。（ 有意思，不知道工程特性如何。好处是可以尽早的发现bug地点 ）

Go 支持参数可变函数。

`defer` 很特别，可以延迟调用函数，有点类似 Python 的上下文管理。但是可能有更多的使用场景。

`panic` 以后，defer 的函数仍然会执行！

panic 之后一般程序就会放弃执行，但是可以通过 recover 恢复执行。

## 组合和封装
### 绑定类型和函数

Go 的面向对象功能主要是通过 Method 实现封装和组合。我们可以为结构体类型指定相应的方法。所以在 Go 中并不强制绑定类型和方法：

```go 
p := Point{1, 2}
q := Point{4, 6}
fmt.Println(Distance(p, q)) // "5", function call
fmt.Println(p.Distance(q))  // "5", method call
```

按照如下语法定义方法：

```go 
type Point struct {
    X, Y float64
}
type Path []Point

// 这里直接传入Path的拷贝，（path Path）叫做 receiver argument
func (path Path) Distance() float64 {
...
}

// 也可以通过传入指针避免拷贝
func (path *Path) Distance() float64 {
...
}
```

应该注意的是，如果一个对象的方法是指针传入，那么按照传统，所有的其他方法都应该是指针传入，即使某些方法并不需要指针。

### 组合类型

组合类型主要是通过重复使用struct。

```go=
// 可一个 unnamed strcut 使用 method
var cache = struct {
    sync.Mutex
    mapping map[string]string
} {
    mapping: make(map[string]string)
}

func loopup(key string) string {
    cache.Lock()
    v := cache.mapping[key]
    cache.Unlock()
    return v
}
```

### 封装

Go 通过首字母大小写区分是否 export 该变量或者函数。大写首字母会被export，小写则被封装。
## 接口, Interface

Go 的接口与其他语言类型，但是是隐式满足的，即一个类型不需要实现全部接口。（这是一个好主意么？）

接口类型与之前提到的concrete类型不用，一个实类型会明确数据结构以及该类型支持的具体函数（方法）。换句话说，当我们看到一个实类型，我们明确的知道这个类型可以做什么。而 Interface 类型属于抽象类型，他们仅仅确定该类型应该支持的操作函数的签名，但是不知道他具体会做什么。

```go=
type Reader interface {
    Read(p []byte) (n int, err error)
}
type Closer interface {
    Close() error
}
// 我们还可以组合 interface
type ReadWriter interface {
    Reader
    Writer
}
```

为了让函数接受任意类型，我们可以传入 `interface{}` 类型。编译器会负责检查结构是否满足。

```go=
 var any interface{}
 any = true
 any = 12.34
 any = "hello"
 any = map[string]int{"one": 1}
 any = new(bytes.Buffer)
```

Go 的 interface 可以有两种不同的使用范式：subtype polymorphism 和 ad hoc polymorphism。

后续专门讨论。