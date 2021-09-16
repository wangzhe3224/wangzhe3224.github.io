---
title: CSAPP 5 程序的优化
date: 2021-04-16
tags: CSAPP
categories: Computing
---

# CSAPP 5 程序的优化

优化方式：
- 程序层面
    - loop unrolling
    - 减少内存renference
    - 减少函数调用
    - 分支优化
- 内存优化
    - 读写循环优化


现代CPU都有独立的功能组件进行内存的读取和写入，这些组件通常都有自己的缓存。比如Intel i7处理器的读取单元可以缓存48个读取指令，他们通常可以在一个cycle内完成一个操作。