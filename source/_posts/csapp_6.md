---
title: CSAPP 6 存储的层次
date: 2021-04-24
tags: CSAPP
categories: Computing
mathjax: true
---

# CSAPP 6 存储的层次

本书之前讨论的模型注重CPU执行程序的过程和方式，而其中内存被当做一个简单的byte array，可以实现O(1)访问。但是，这个内存模型是简化的，实际计算的内存是一个层状模型，每一层都有不同的承载力和访问开销。

## Locality

**Temporal Locality**：一个内存地址如果被引用了一次，那么它很可能在将来还会被引用。**Spatial Locality**：一个地址如果被引用，那么它周围的地址也能被引用。

现代计算机和操作系统都会做上述假设，如果程序可以满足上述假设，那么程序的运行速度就会提升。

因此：
- 反复访问同一个内存地址效率更高
- 多维数组row基更快，因为内存连续
- 多维数组，`a[][][]` 将最后一个index作为变化最快的index
- 循环最好是大量的短代码块

**Problem 6.9**

定义如下结构体，注意结构体在C中其实也是一段连续的内存，循环赋值的时候如果关注效率，应该采用`clear1`的方法。结构体其实相当于多维数组，只不过第二维度是一个field，而不是index。因此 j 应该是变化最快的index，而且不宜把vel和acc放在同一个loop里面，这样写起来方便，但是 Locality 不好。

```c=
#define N 1000

typedef struct {
    int vel[3];
    int acc[3];
} point;

point p[N];

// 1
void clear1(point *p, int n)
{
    int i, j;
    for (i=0; i<n; i++) {
        for (j=0; j<3; j++)
            p[i].vel[j] = 0;
        for (j=0; j<3; j++)
            p[i].acc[j] = 0;
    }
}
```

## 存储的层次

从寄存器到硬盘，再到网络服务器，计算机系统的存储系统是一个层状结构。越往上读写速度越快，但是价格也越高，相应的存储空间也越小。所以上一层的内存通常是作为下一层内存的**缓存（Cache）** 使用。

![](https://i.imgur.com/8BRKwX4.png)

通常k和k+1的缓存关系具有固定的block大小。如果程序想要读取k+1的信息，会搜索k中k+1的缓存block，如果找到（cache hit）读取，如果没找到（cache miss）则会从K+1读取，并放入k层缓存，不过放入缓存的具体方式跟不同的缓存策略有关。

Cache hit 大家都开心，如果出现 Cache miss，我们需要分析原因。一般miss可以分成：
- cold miss
- confilt miss
- capacity miss

既然每一层都是下一层的缓存，那么谁来负责管理每一层之间的数据流动呢？存储的最顶层是寄存器，这部分内存由编译器负责管理；而L1-3缓存则是由硬件负责管理；而主内存，在有虚拟内存的情况下，是有操作系统和硬件共同完成管理的，

正是因为存储的这种层状缓存关系，程序的Locality才对提升性能格外重要：
- Temporal Locality，可以提高cache hit
- Spatial Locality，可以提高一个block空间的利用率


## 内存缓存

如果系统的地址宽度为$m$ bits，则系统可以寻址$M=s^m$，那么缓存一般被划分成 $S=2^s$ 个缓存集（Cache set），每一个缓存集包含 $E$ 调缓存记录，而每一个缓存记录的宽度恰好是系统地址宽度 $m$。每个缓存记录包含：
- 数据块，$B=2^b$ 字节；
- valid bit，1 bit，用来表明该记录是否存有可用信息；
- Tag，$t=m-(b+s)$，这部分是当前内存块地址的一个子集。

由此得出缓存的大小：$C=B*E*S$，我们可以用一个4维元组定义一个缓存：$(S, E, B, m)$。

```
set 0, cache line 0

| valid bit | -- t bits -- | --  b blocks  -- |
   Valid          Tag          B = 2^b bytes
```

那么缓存是如何寻址的呢？假设我们要看缓存是否包含地址A对应的数据。首先我们把地址划分成三个部分：
- tag
- set index
- block offset

```
         m-1                                    0
address: |-- t bits --|-- s bits --|-- b bits --|
              tag       set index   block offset
```

首先，set index 部分指明缓存集（cache set）位置，然后 Tag 部分会指明那个缓存记录包含该地址的内容；最后，通过 block offset 找到读取的缓存的最终位置。


#### Problem 6.10

- $S = C / (B * E)$
- $s = log_2(S)$
- $b = log_2(B)$
- $t = m - (s+b)$

| Cache | m   | C    | B   | E   | S   | t   | s   | b   |
| ----- | --- | ---- | --- | --- | --- | --- | --- | --- |
| 1.    | 32  | 1024 | 4   | 1   | 256 | 22  | 8   | 2   |
| 2.    | 32  | 1024 | 8   | 4   | 32  | 24  | 5   | 3   |
| 3.    | 32  | 1024 | 32  | 32  | 1   | 27  | 0   | 5   |

### 直接映射缓存

直接映射缓存就是 $E=1$ 的缓存，即每一个缓存集只有一条缓存记录。缓存的读取分成三部：
- 选取set
- 匹配line
- 抽取word

跟上上面练习的表格，可以知道 s 的宽度是 5 比特，也就是我们需要抽取读取地址中的5位，换算成无符号整数，作为cache set索引。比如如下示意，我们的地址中 s 的部分是`00001`就会对应cache set索引1。

```
m-1                                        0
|--  t bits -- | 0 0 0 0 1 | --  b bits -- |
```

找到 cache set 的位置后，我们需要找到对应的 cache line，由于选择了E=1，每一个 cache set 都只有一个 cache line，这一步就没什么好选择的了。

最后一步就是抽取数据。
1. 检查 vilid bit 是否是1，
2. 检查 tag 部分（0110）是否与缓存tag部分相等，
3. 继续读取offset的部分（本例子中是二进制100，即十进制4）找到对应的数据。

```
Cache set 的结构

| valid bit | Tag | Block 
    =1 ?     0110   
    
m-1                                        0
|--  t bits -- | 0 0 0 0 1 | --  b bits -- |
|   0 1 1 0    |     i     |     1 0 0     |
```

如果步骤1、2都满足，成为 cache hit，即命中。否则为cache miss，这时系统需要继续访问内存读取数据，然后将数据按照规则写入cache。这时候，如果缓存已经满了，就需要一些evicted策略。对于直接映射缓存，情况比较简单，就是直接用新的数据替换该cache line。

**值得注意的是，如果一个cache line出现cache miss，系统会直接读取所有的block进入缓存，而不是只读取请求的部分。**

**由于缓存较小，同一个cache line会被映射到不同的内存地址，这就可能导致Conflit miss，即一个cache line被返回的清除，或交替出现cache miss**。

**为什么采用中间的bit作为set索引，而不是高位的bit？因为我们希望连续的内存被映射到不同的set区间，增加连续访问的cache hit**

#### Problem 6.11

padding后，75%的访问会命中。

#### Problem 6.13

| Cache | m   | C    | B   | E   | S   | t   | s   | b   |
| ----- | --- | ---- | --- | --- | --- | --- | --- | --- |
| 1.    | 13  | 32   | 4   | 1   | 8   |  8  | 3   | 2   |

```
Tag: 8 bit
index: 3 bits
offset: 2 bits
```

#### Problem 6.14

`0x0E34` -> `0111000110100`

```
Cache block offset (CO)   0x00
Cache set index (CI)      0x05
Cache tag (CT)            0x71
Cache Hit?                Yes
Cache byte return         0x0B
```

#### Problem 6.15

`0x0DD5` -> `110111010101`

```
Cache block offset (CO)   0x01
Cache set index (CI)      0x05
Cache tag (CT)            0x6E
Cache Hit?                No
Cache byte return         -
```



### 写入缓存的问题

上述方法用于读取缓存没有问题，当程序想要向缓存写入数据的时候，系统需要考虑不同的方案。我们有两种情况：Write hit 和 Write miss。

Write hit 的情况下，我们有两种方案：`write-though`和`write-back`。前一种方案会在写入缓存的同事，更新对应的内存空间；后一种方案，只有在该缓存被清除的时候，才会向对应内存写入更新的数值。

Write miss 的情况下，也是两种方案：`write-allocate`和`no-write-allocate`。前一种方案会读取数据到缓存，然后写入缓存；后一种会直接写入内存或下一层缓存。

### i-cache 和 d-cache

缓存不仅会存储数据，也会存储CPU指令。

### 缓存参数对性能影响指标

我们有如下指标评估缓存的性能：
- Miss Rate
- Hit Rate
- Hit time
- Miss penalty


## 如何利用缓存特性写更快的程序？

1. 让公共代码跑的更快
2. 减少内层循环的cache miss
3. 再循环中不断访问局部变量（编译器会优化到寄存器）
4. 把变化最快层放在最内层索引

概念上：
- 关注程序的最内层循环
- 为了最大化空间局部性，stride 1 模式读取对象
- 为了最大化临时局部性，反复使用已经从内存读取的对象


###### tags: `CSAPP`