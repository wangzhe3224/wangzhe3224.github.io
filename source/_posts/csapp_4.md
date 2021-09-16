---
title: CSAPP 4 处理器架构
date: 2021-04-16
tags: CSAPP
categories: Computing
---

# CSAPP 4 处理器架构

CPU Pipeline 的基本原理，通过将任务拆解成不同的阶段，并行执行多个任务，增加 throughput，相应的会提高延迟。不过这样可以提高CPU的时钟频率，降低延迟。

这是比指令集更低一个的一个层次，每一个指令集指令都被分解成多个不同的阶段，由对应的硬件分别执行。分解后，为并行提供了可能。

```
A B C
  A B C
    A B C
```

Pipeline 的复杂度在于错误处理、每个阶段的延迟等等。