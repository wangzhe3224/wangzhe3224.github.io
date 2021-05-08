---
title: CSAPP 7 连接
date: 2021-05-08
tags: CSAPP
categories: Computing
mathjax: true
---

# CSAPP 7 连接，Linking

连接是将程序的不同部分（指令和数据）组合成一个二进制文件，该文件可以被读入内存并被CPU执行。连接可以发生在编译时，即程序从源代码转换成机器码的过程中（Static Linking）；也可以发生在装载阶段，即程序被读入内存的阶段（Dynamic Linking）；甚至可以在运行时，即程序已经被读入内存且已经开始执行的时候。

连接器操作的对象被称为目标文件：`Relocatable object file`, `Executable object file`, `Shared object file`。

目标文件的格式是约定俗成的，最常见的是`ELF`, Executable and Linkable Format。

> 在C语言中，`static` 关键字通常用来隐藏变量或者函数。

**Practice Problem 7.1**

```c=
extern int buf[];

int *bufp0 = &buf[0];
int *bufp1;

void swap() 
{
    int temp;

    bufp1 = &buf[1];
    temp = *bufp0;
    *bufp0 = *bufp1;
    *bufp1 = temp;
}
```


| Symbol | .symtab? | Symbol type | Module defined | Section |
| ------ | -------- | ----------- | -------------- | ------- |
| buf    | yes      | extern      | main.o         | .data   |
| bufp0  | yes      | global      | swap.o         | .data   |
| bufp1  | yes      | global      | swap.o         | .bss    |
| swap   | yes      | global      | swap.0         | .text   |
| temp   | no       | -           | -              | -       |

`buf`由于有extern关键字，内存分配实在调用文件中完成的，而`temp`是局部变量，是运行时栈分配。

> 连接器在处理多个静态库文件的时候，即symbol resolve stage，是从左向右扫描进行归档。

连接的步骤：
- Symbole Resolution
- Relocation

程序连接完成后，就可以被系统从硬盘读入内存了，并且系统找到程序的“入口”指令并开始执行。每一个程序开始执行后，都有如下虚拟内存配置：

```
--------------    <- high addres
Kernel Memory
--------------
User Stack
--------------    <- %esp (stack pointer)
|
| ( grow )
|
|
-------------
Share lib
-------------

^
|
|
-------------    <- brk
Runtime Heap
by `malloc`
-------------
R/W segment
(.data, .bss)
-------------
RO segment
(.init, .text)
-------------    <- 0x08048000

-------------    <- 0x0
```

**Practice Problem 7.5**

- 为什么每一个C程序都需要一个main函数？
- 为什么当main函数没有调用return或者exit，程序也会自然结束？

main函数的程序被载入内存后的执行入口。`_exit` 都会被调用，然后把执行权交还给OS。


**Runtime动态连接**

