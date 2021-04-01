---
title: Go 学习笔记3 程序的构成
date: 2021-03-30
tags: [Go, Go学习]
categories: Coding
---

# Go 学习笔记3 程序的构成

## 基本规则

Go 采用驼峰命名：`thisVarIsGood`。如果一个 package 中的函数采用大写字母开头，这个函数可以被外界调用，否则隐藏，比如 `fmt.Println`。

Go 的声明语句主要有四种：`var`, `const`, `type`, `func`。

`var`，变量声明：`var name type = expression`。如果省略 expression 的部分，Go 会给变量合法的初始值。`:=` 表达式，是简化的声明。

指针是变量的地址，并不是每一个值都有地址，但是每一个变量都有地址。`new` 函数会返回该类型的指针。

Go 的编译器会根据变量的具体生命周期决定是堆分配还是栈分配，生命周期也会影响垃圾回收的效率，如果一个局部变量被外部变量引用，那么即使函数已经返回，这个局部变量也不会被回收，同时编译器也会对他进行堆分配，而不是栈分配。

## 基本类型

Go 的类型系统相对比较简单（简陋？），主要类型包括四种：基本类型、组合类型、引用类型和接口类型。

基本类型主要包括：
- 整数, int8, int16, int32, int64, 还有无符号版本，uintptr
- 浮点数, float16, float32
- 复数, complex(r, i)
- 布尔, true, false
- 字符串, an immutable sequence of bytes. 可以是任何byte，通常是可读的字符串

## 组合类型

- Array
- Slice
- Map
- Struct

Array 是长度固定、类型固定的连续内存空间。Array 初始化方式比较丰富：

```go
a := [2]int{1, 2}
b := [...]int{1,2,3}
r := [...]int{99: -1}
```

Array 也可以用指针访问（就像 C 一样，`[]` 仅仅是指针的语法糖）：

```go=
func zero(ptr *[32]byte) {
    for i := range ptr {
        ptr[i] = 0
    }
}
```

Slice 是长度可变的、类型固定的连续内存空间。一个 Slice 包含三个部分：头指针、长度、长度极限。Slice 与 Array 不同，是不可比的。但是，可以测试 Slice 是否是 Nil。

Maps 是哈希表，可以nest。

Struct 类似 C 的结构体，是一个多种类型的组合类型。

```go
type Point struct{ X, Y int }
p := Point{1, 2}
```

## 小节

整体感觉 Go 的程序构成与 C 语言非常类似。看起来就像带有 GC 和 并发内置的现代版本的 C 语言。

###### tags: `Go` `Go学习`