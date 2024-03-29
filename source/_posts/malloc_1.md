---
title: 关于动态内存分配
tag: Memory Allocation
categories: 底层
date: 2021-08-29
---

# 关于动态内存分配

动态内存分配通常是指堆内存（Heap，不是数据结构背景下的堆结构）的动态分配和收回。
动态内存分配与程序的性能和内存使用情况息息相关。对于性能主要涉及两个方面：
分配和释放内存的性能，即吞吐；内存的局部性（与缓存相关），即缓存友好。
对于内存的利用率，主要是关于内存碎片的优化。

## Mental Model (心智模型)

> A mental model is an explanation of someone's thought process 
> about how something works in the real world.
> -- wiki

在现代操作系统中，每一个进程都具有自己的独立*虚拟内存空间*。虚拟内存是一个抽象：
它隐藏了硬件存储系统的复杂度。存储系统包括：内存、硬盘、网络上其他计算机的存储系统。
进程对存储系统的操作就建立在这个抽象上：每个进程（同一个机器或者不同机器）看到的
内存地址空间都是一样的！

### 虚拟内存

在进一步讨论之前，我们还需要了解另外一个
概念：内存映射（Memory Mapping）。Linux类系统在初始化虚拟内存空间时，会将这部分
内存与硬盘上的一个对象联系起来。内存映射有两种：

- *一般文件*
- *匿名文件*

*一般文件*：一个正常文件中的内容分页（page）被映射到（虚拟）内存地址上。但是，直到CPU
主动请求某个页的时候，文件中的内从才会被拷贝进入内存。

*匿名文件*：系统把一部分内存映射到一个匿名文件中，并且用0填充该内存空间，这些页也被称为
demand-zero page。

无论是哪种情况，虚拟内存也被初始化后，他就会与一个交换文件（swap file）连接，并与他不断
交换数据。(每一个进程都有一个交换文件吗？)

![内存心智模型](https://i.imgur.com/vRpgBpw.jpg)

### 堆内存动态分配

动态内存分配就是负责管理堆内存空间的，而在内存中申请空间的就是通过内存映射（Demand-zero）。

*为什么需要动态内存分配*？因为程序与在运行过程中不可避免要动态的产生和销毁对象，但是我们不能
无限分配内存，而不去回收不再需要的对象，否则内存最终会溢出。

内存分配器主要有两种风格：

- 显式，即应用程序主动申请和释放内存。比如C++中的`new`和`delete`，或者C中的`malloc`和`free`。
- 隐式，也成为垃圾回收（GC），即应用程序不主动释放，有分配器自动释放。比如Java、Python、Ocaml都有自己的GC系统

**显式分配器**

显式分配器主要有两个API：alloc和free。alloc返回一个指针指向申请到的空间，
free回收某个指针指向的空间。显式分配器需要满足如下设计需求：

- 处理任意组合的alloc和free序列
- 快速的分配或者释放内存
- 只使用堆内存
- 满足特定的对齐标准
- 不能改变已经分配的内存内容

好的分配器需要：

- 高吞吐
- 高利用率

我们会在后面讨论具体的实现，但是分配器的新式模型如下：

在堆内存中构建一系列块（节点、Block等等名字），这些块包含两部分内容：元信息（Meta Data）和数据，这些
块有一些写代数据（就是包含了应用程序来的数据），另外一些则是空的，仅仅包含元信息。这些块通过元信息进行
连接，从而实现分配和释放。比如，这些块可以是一个链表，也可以是其他更加复杂的数据结构，比如分段链表等等。
从概念上，不同的数据结构实现，就会有不同的效率，需要根据具体情况选择。

![](https://i.imgur.com/lem9r6i.jpg)


**隐式分配器**



## 实现方式

## 参考

- [Dynamic Storage Allocation: A Survey and Critical Review](https://users.cs.northwestern.edu/~pdinda/icsclass/doc/dsa.pdf)
- [jemalloc](https://people.freebsd.org/~jasone/jemalloc/bsdcan2006/jemalloc.pdf)
- [mimalloc](https://www.microsoft.com/en-us/research/uploads/prod/2019/06/mimalloc-tr-v1.pdf)