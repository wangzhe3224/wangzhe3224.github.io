---
title: CSAPP 3 程序的机器层面表达
date: 2021-04-15
tags: CSAPP
categories: Computing
---

# CSAPP 3 程序的机器层面表达

这一章主要从汇编程序和机器码的角度看程序。包括`call stack`, `local variable`, 以及一些基本的数据结构，比如`array`, `structure`, `union` 等等。

> Fun fact: 64位寻址空间是`2**48` 而不是 `2**64`。为什么？

IA32机器码与C语言代码不同，可以接触到一些CPU 的计算状态：
- 程序指针，PC
- 寄存器文件，regiester file
- 条件寄存器，
- 浮点数寄存器

机器码层面，类型已经不能存在了，一切都是内存上的字节。

指令集中操作包括：
- 访问内存地址
- 计算
- 控制
- Procedures

## Procedures

寄存器的使用规则一般是依靠规定，比如`eax`, `edx`,`ecx` 是调用者（caller）保留使用的。`ebx` `esi` `edi` 是被调用函数（callee）保留使用的。换句话说，callee必须在执行其他操作前，将 `eax`, `edx`,`ecx` 进栈保存，然后再返回以前，恢复这三个寄存器的值。

## Array Allocation

我们需要两个寄存器来进行 Arrary 的读取，一个用来存储Array的地址，另一个用来存储index，例如 `(%edx,%ecx,4)` 就是一个`char *D[5]`数列的读取命令，edx存储D的位置，ecx存储需要访问的index，而4就是`char *`的长度（32位内存地址）。

## Structure 和 Union

一般栈内存分配都是 4 byte 为单位的。Structure就是每个格子长度大小不一致的Array，也是一块连续的内存空间。而union则会划分一块类型不确定的内存空间，可以存储任意类型（长度允许的情况下）。

Union会容易导致bug，但是可以有效的节约内存。比如如下二叉树节点：

```c=
struct NODE_S {
    // 4+4+8 = 16 bytes memory
    struct NODE_S *left;
    struct NODE_S *right;
    double data;
};

union NODE_U {
    // max(8, 4+4) = 8 bytes
    struct {
        union NODE_U *left;
        union NODE_U *right;
    } inernel;
    double data;
};

typedef enum { N_LEAF, N_INTERNAL } nodetype_t;

struct NODE_T {
    // 12 bytes
    nodetype_t type;
    union {
        struct {
            struct NODE_T *left;
            struct NODE_T *right;
        } internal;
        double data;
    } info
};
```

## Problems
### Problem 3.1

值包括三种：register, memory, immediate.

- `%eax`: 0x100，register
- `0x104`: 0xAB, memory
- `$0x108`: 0x108, Immediate
- `(%eax)`: 0xFF，Memory，Address 0x100
- `4(%eax)`: 0xAB，偏移量 4 byte, Address 0x104
- `9(%eax,%edx)`: 0x11, EAX + 9 + EDX
- `260(%ecx,%edx)`: 0xAB, ECX + 260 + EDX，260是十进制的
- `0xFC(,%ecx,4)`: 0xFF, 0xFC + ECX * 4, 0x4 + 0xFC = 0x100
- `(%eax,%edx,4)`: 0x11, address of 0x10C

### Problem 3.2

![寄存器分布](https://i.imgur.com/yJpWTI9.png)

1 word = 2 byte = 16 bits，所以一个32位寄存器包含4个byte或者2个word或者32bit。

一个16进制的单位，包含4个bit。所以16进制经常是两个两个写在一起，代表一个byte的宽度。

```
movl %eax, (%esp)       将 EAX 寄存器的内容移动到 ESP 指向的内存空间
movw (%eax), %dx        将 EAX 寄存器指向的内存空间内容移动到 DX 寄存器，
movb $0xFF, %bl         bl 是特殊寄存器，可以分别单独访问低位的两个byte空间
movb (%esp,%edx,4)     
pushl $0xFF
movw %dx, (%eax)        dx 是高位的两个byte，即 1 word
popl %edi
```

例子：栈操作

```asm
subl $4, %esp
movl %ebp, (%esp)       一般采用 pushl ebp 到 栈顶（指向的内存空间）

movl (%esp),%eax
addl $4,%esp            pop %exa
```

### Problem 3.3

```
movb $0xF, (%bl)        bl 只有 8 bit，不能作为 32 bit 内存地址
movl %ax, (%esp)        ax 是高位 2 byte，应该是 movw, movl 需要 4 byte
movw (%eax), (%esp)     不能直接做内存 对 内存 的移动。 （为啥？）
movb %ah,%sh            sh不存在
movl %eax,$0x123        目标不能是 immediate
movl %eax,%dx           dx 长度不够
movb %si, 8(%ebp)       si 长度不够
```

### Problem 3.4

```c=
stc_t v;
dest_t *p;

// 写出下面语句的汇编程序
*p = (dest_t) v;
// 指针 p 的寄存器是 %edx
// v 的寄存器可以根据数据宽度选择 %eax
```

| src_t | dest_t   | 指令              |
| ----- | -------- | ----------------- |
| int   | int      | movl %eax,(%edx)  |
| char  | int      | movsbl %al,(%edx) |
| char  | unsigned | movsbl %al,(%edx) |


### Problen 3.5

```c=
void decode1(int *xp, int *yp, int *zp)
{
    int x = *xp;  // %ebx
    int y = *yp; // %ebi
    int z = *zp;// %eax
    
    *yp = x;
    *zp = y;
    *xp = z;
}
```

### Problem 3.6

```
leal 6(%eax),%edx         6+x
leal (%eax,%ecx),%edx     x+y
leal (%eax,%ecx,4), %edx  x+4y
leal 7(%eax,%eax,8), %edx 7+8x
leal 0xA(,%ecx,4), %edx   10+4y
leal 9(%eax,%ecx,2), %edx 9+x+2y
```

### Problem 3.7

```
addl  %ecx,(%eax)           0x100    0x100
subl  %edx,4(%eax)          0x104    0xAB - 0x3=0xA8
imull $16,(%eax,%edx,4)     0x10C    16 * 0x11=0x110
incl  8(%eax)               0x108    0x14
decl  %ecx                  %ecx     0x0
subl  %edx,%eax             %eax     0xFD
```

### Problem 3.30

```
  call next
next:
  popl %eax
```

`%eax` 的值应该是栈顶刚被推出的值，而`call`会首先将返回地址压进栈顶，所以`%eax`应该是函数的返回值地址。但是这不是一个Procedure call，也没有对应的`ret`指令。这是一个IA32指令集的trick，用来获取 PC 的地址。


### Problem 3.32

`*p` 是第3个参数，`d` 是第二个参数，

`short c, char d, int *p, int x`

### Problen 3.43

```
在第七行：
        80 04 86 43          返回值地址
%ebp -> bf ff fc 94          存储%ebp，push %ebp -> mov %esp,%ebp
        00 00 00 03          存储%edi
        00 00 00 02          存储%exi
        00 00 00 01          %ebx
                             buff[4-7]
                             buff[0-3]
SP   ->
```


###### tags: `CSAPP`