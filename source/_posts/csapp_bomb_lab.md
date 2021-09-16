---
title: Bomb Lab
date: 2021-08-08
tags: CSAPP
categories: Computing
mathjax: true
---

# Bomb Lab 解析

Bomb Lab 实际就是通过反汇编和GDB对一个二进制文件行进分析，寻找每一个阶段需要输入的特定字符串。主要考察对汇编代码、栈帧、寄存器的熟悉程度以及使用GDB的能力。

## 环境设置

推荐大家使用docker构建一个环境方便省时：

```bash=
image = "zwang/csapp"
path="/xxx/xxx"  # 这里修改成你自己的lab目录

if ! docker container rm csapp_env; then
    echo "remove old container."
else
    echo "no old container exist. Create a new one"
fi

docker container run -it -v ${path}:/projects -p 8080:8080 --name=csapp_env --net host wangzhe3224/csapp /bin/bash
```

上面的命名会直接从远程docker仓库pull一个我设置好的环境，并且进入那个docker的bash。环境中已经装好了：vim, gdb, cgdb 等一些列方便调试的软件和必要的 c 语言相关库。

## GDB小抄

```
- info r, 展示寄存器内容
```

- [CS107 x86-64 Reference Sheet](https://web.stanford.edu/class/cs107/resources/x86-64-reference.pdf)
- [x64 Cheat Sheet](https://cs.brown.edu/courses/cs033/docs/guides/x64_cheatsheet.pdf)
- [GDB 参考](http://csapp.cs.cmu.edu/3e/docs/gdbnotes-x86-64.pdf)

## Phase 1

首先观察源代码入口 `bomb.c`:

```c=
input = read_line();             /* Get input                   */
phase_1(input);                  /* Run the phase               */
phase_defused();                 /* Drat!  They figured it out!
* Let me know how they did it. */
printf("Phase 1 defused. How about the next one?\n");
```

每一个阶段都是上面的模式，读取输入的字符串，传入每一个阶段的函数体，在函数体中检测输入的字符串是否与程序预设相同，如果相同则进入下一阶段。另外，lab还推荐写一个文本文件作为每一步的结果，这样方便测试，该文件每一行就是每一阶段的答案。本文假设该文件名为`psol.txt`。

首先，为了更完成的看到反汇编代码，我们做`objdump -d bomb > bomb.as` 获得二进制炸弹的汇编代码方便查阅。当然，本文使用 cgdb 作为调试工具，可以相对方便的在调试过程看到机器码，也可以不必一直参考汇编代码文件。

```text
# 进入debug模式
cgdb bomb

# 在phase_1处设置断点
b phase_1
r < psol.txt
```

得到如下phase_1的汇编：

```text
 1│ Dump of assembler code for function phase_1:
 2├──> 0x0000000000400ee0 <+0>:     sub    $0x8,%rsp
 3│    0x0000000000400ee4 <+4>:     mov    $0x402400,%esi
 4│    0x0000000000400ee9 <+9>:     callq  0x401338 <strings_not_equal>
 5│    0x0000000000400eee <+14>:    test   %eax,%eax
 6│    0x0000000000400ef0 <+16>:    je     0x400ef7 <phase_1+23>
 7│    0x0000000000400ef2 <+18>:    callq  0x40143a <explode_bomb>
 8│    0x0000000000400ef7 <+23>:    add    $0x8,%rsp
 9│    0x0000000000400efb <+27>:    retq
10│ End of assembler dump.
```

我们逐一分析：

- 申请8字节的栈空间
- 把0x402400放入%esi，我们知道esi会存放接下来函数调用的第二个参数，第一个参数在%edi
- 然后调用strings_not_equal函数

分析到这里已经比较清楚，我们只需要看一下`0x402400`这个内存地址放了什么东西，我们输入的字符串，应该就是要跟这个东西比较的，因为这是strings_not_equal的第二个参数。

```text
(gdb) x/s 0x402400
0x402400:       "Border relations with Canada have never been better."
```

因此，我们只需要把 `Border relations with Canada have never been better.` 写入 psol.txt 的第一行，作为我们炸弹阶段一的答案。

如果不担心炸弹会爆炸，我们可以试一试：`./bomb < psol.txt`。

## 参考

- https://zhuanlan.zhihu.com/p/60237228
- https://zhuanlan.zhihu.com/p/31269514
- https://zhuanlan.zhihu.com/p/57977157
