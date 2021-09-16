---
title: CSAPP 9 虚拟内存
date: 2021-06-03
tags: CSAPP
categories: Computing
mathjax: true
---

# CSAPP 9：虚拟内存

虚拟内存的三个重要功能：
- 将物理内存作为一种缓存，缓存硬盘上的一个私有内存地址空间
- 让每一个进程拥有独立的内存地址空间
- 确保进程之间的内存不会互相影响

理解虚拟内存的关键在于意识到：一个数据对象（字节）可以有多个属性（地址）。话句话说，一个内存对象可以有两个地址，一个物理地址，一个虚拟内存地址。

## 虚拟内存：缓存

概念上，虚拟内存是硬盘上一串连续的字节空间。一般会规定 m 个字节为一个分页，分页只有三种状态：
- 未分配
- 缓存
- 未缓存

## Linux中的虚拟内存

Linux Kernel 通常把进程的虚拟内存空间用一系列的 Segment (Area) 表达。Kernel会管理这些segment，进程也只能引用segment指向的内存空间。

![](https://i.imgur.com/ks7WKIw.png)

**demand paging**：只有在需要的时候，硬盘上内容才会被读入物理内存。

**copy-on-write**：共享的可写内容，只有在需要写入的时候，才会只做副本。

Linux初始化虚拟内存空间是通过Memory Mapping进行的，kernel会把硬盘上某个文件的内容与该内存空间联系起来。一旦虚拟内存**分页**初始化结束，kernel会在内存和一个特殊的 swap 文件中进行 paging 操作。

**Practical Problem 9.5**

```c=
#include "csapp.h"

void mapcopy(int fd, int size) 
{
    char *bufp;
    // mmap will ask the kernel to link a VM area with given fd.
    bufp = Mmap(NULL, size, PROT_READ, MAP_PRIVATE, fd, 0);
    // Here we are writing from VM to std 1 
    Write(1, bufp, size);
    return;
}

int main(int argc, char **argv)
{
    struct stat stat;
    int fd;

    if (argc == 1) {
        printf("Use: mapcopy <filename>\n");
        exit(0);
    }

    fd = Open(argv[1], O_RDONLY, 0);
    fstat(fd, &stat);
    mapcopy(fd, stat.st_size);
    exit(0);
}
```

## Memory Allocator

未完待续

## Garbage Collector

未完待续
