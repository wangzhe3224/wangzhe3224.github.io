---
title: Computer System
date: 2020-09-20
tags: [Operating System]
categories: Reading
---

# Computer System: A Programmer's Perspectives

[![hackmd-github-sync-badge](https://hackmd.io/fzzDuqP9TO2f8MOsqmOxUQ/badge)](https://hackmd.io/fzzDuqP9TO2f8MOsqmOxUQ)


一个读书笔记。

## 总结

这本书首先自底向上介绍现代计算机的基本工作原理，论述了计算软件和硬件如何协调工作。在此基础上，介绍了一个程序是如何从源代码，被编译，然后被执行的。然后，详细展开说明一个应用程序在硬件和操作系统层面是如何被执行的。 最后，介绍了多个程序之间是如何互动，比如IO、网络、以及并发。

## 感受

这本书的角度很独特，作者从一个开发应用程序的程序员角度切入，而不是从操作系统开发人员的角度切入。刚开始读这本书的时候，原本的目的是学习操作系统，但是却意外发现这本书的角度其实非常适合非操作系统开发程序员阅读。因为他深入浅出的解释了很多幕后的事情，读后感觉对整个计算机工作原理有了更加深入的理解，同时也有助于写出更加高效的程序。

## 概览

> Information is Bits + Context

源代码的编译过程：

![源代码编译](https://i.imgur.com/RBffpof.png)

编译过程主要包含：预处理，编译，汇编，连接等四个过程。预处理主要是扩充源代码的语法糖，比如宏，导入等等；编译器输出汇编版本的程序；汇编器会形成二进制的目标文件；最终，连接器会把各个目标文件组合在一起形成最终的可执行二进制文件。整个过程就是一个把高级语言翻译成二进制指令的过程。

计算机只能执行二进制指令，这些指令通常涉及：读入、存储、计算和跳转。当我们执行一个程序的时候，就是执行编译产生的二进制文件的时候，所有指令和数据会被读入内存，然后CPU通过读取指令和数据完成计算。

![](https://i.imgur.com/ggjMHJJ.png)

操作系统的主要功能就是提供一个硬件和一般引用程序之间的抽象，为每一个应用程序提供一个进程，也就是一个相对独立的CPU和内存环境。

![](https://i.imgur.com/79exfiM.png)

计算机的各个部分通过总线连接：

![](https://i.imgur.com/b9gUgiO.png)

## 程序的结构

### 信息的表达与操作
 
word size: 寻址极限，指针的范围。因为1 byte = 8 bit. 所以在64位寻址系统中，一个指针类型由8 byte表达，即64bits。

fix point fraction and floating point fraction。 这里有个不错的参考：
https://ryanstutorials.net/binary-tutorial/binary-floating-point.php

#### 整数

bit wise 运算。

#### 浮点数
转化小数到二进制的小数的一种方法：不断给小数部分乘2，取结果整数部分（1或者0）作为该位置的bit，持续进行。

一些“奇怪”的问题，浮点数的代数性质并不能跟真正的小数一致，比如

- (3.14+1e10) - 1e10 = 0
- (1e20*1e10)*1e-20 = 无穷，1e20*(1e20*1e-20) = 1e20

为了避免这些，尽量考虑计算过程中的数值的极值范围，合理处理上面的极端情况。减少两个数量级相差很多的量进行计算， 通常先进行规范化处理后进行计算。

### 代码的机器层面表达

源代码经过编译，会形成汇编文件，这个文件其实就是通过简单的指令按顺序排列。只不过在这个阶段，指令使用人类可以理解的单词表达，比如`pushl`等等。汇编文件经过汇编，就形成了二进制文件，也就是把汇编指令一一对应的翻译成二进制（一般采用16进制表达），如下图所示：

![](https://i.imgur.com/LkwkUrY.png)


### 提高速度的一些小技巧

1. 减少循环
2. 循环中减少函数调用
3. 使用局部变量

## 程序的执行

### 异常处理

这里的异常处理指的是硬件或者操作系统层面的异常，不是高级语言中的异常处理。

在硬件层面，异常主要分成四种：
- Interrupt，异步，通常由IO造成
- Trap,同步，一般是操作系统内核制造
- Fault，同步，可恢复的错误产生
- Abort，同步，不可恢复的错误产生

其中，只有Interrupt是异步的，因为它是由CPU外部的设备产生的，而其他异常都是CPU执行指令的结果。

### 进程，Processes

异常处理是系统实现进程抽象的基本方法，每一个运行在操作系统上的程序都有自己的进程，进程中包含了程序的代码、数据、盏、寄存器状态等等。进程提供了两个基本的抽象：
- 独立的逻辑控制流程
- 独立的私有内存空间

有了这个两个抽象，每一个程序就好像独占整个电脑一样。每一个进程都至少有一个进程ID，PID，如果是子进程，还会有对应的子进程pid。从程序员的角度看，一个进程有三种状态：running, stopped, terminated。

`fork`可以用来创建进程或者子进程。`execve` 可以用来执行一段程序。程序与进程是不同的，程序通常只是一段代码加数据，而进程则是一系列的计算资源、内存、IO等等。通常一个程序需要在进程中运行。

### 虚拟内存

虚拟内存，Virtual Memory，是另一个非常重要的抽象。VM主要有三个功能：
- 物理内存成为虚拟内存地址的高速缓存
- 实现了每一个进程独立的虚拟内存空间
- 确保不同进程的内存空间不发生冲突

Memory management unit, MMU, is the hardware that translate virtual addresses to physical addresses. 

虚拟内存的基本思想就是区分数据本身和数据属性，比如地址并不是数据本身，而是数据的一个属性，因此，同一个数据可以具有不同的地址属性。因此，每一个字节（Byte）的内存空间都有一个物理地址和一个虚拟地址。

> 任何计算机问题都可以通过增加重新定向解决，Mapping。

### 垃圾回收

![](https://i.imgur.com/PPKEmBj.png)


## 程序的互动

### 系统IO

Input/Output，IO，指的是内存和其他外设之间的数据传输过程。Input，从外部设备拷贝数据进入内存；Output，从内存传输数据进入外部设备。外部设备可以是硬盘、终端、网络等等。

系统内核，Kernel，提供了基本的IO操作。在Unix类系统中，所有的I/O设备，例如网络、硬盘、终端等，都用文件表达，所有的输入、输出都已读写对应的文件完成。文件，就是一些列的字节。

注意到，这里出现了另一个重新定向，Mapping：I/O设备到文件。通过文件映射，统一了各类外设的操作方法。跟虚拟内存异曲同工。

![](https://i.imgur.com/vPBnwkw.png)


### 网络IO

Socket Interface.

![](https://i.imgur.com/QcA0tVp.png)


### 并发

这里是应用层面的并发。操作系统提供了三种并发方法：
- Process,进程
- I/O multiplexing
- Thread，线程

线程实现可以看成是Process和Multiplexing的结合，多个线程在同一个进程中，因此共享内存，但是程序执行的schedule是由系统内核完成的。

