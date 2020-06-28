---
title: Python无成本加速技巧
tags: [Python]
categories: Coding
date: 2020-06-14
---

Python是个很精巧的语言，但是常见的Cython解释器生成的代码相对来说还是比较慢的，这里主要是跟动态语言的一些特性有关系。但是，我会介绍一下非常常见的手段，可以通过简单的变化提升代码速度：无成本的加速技巧。

# :palm_tree: Python到底慢在哪里？

其实，巨大部分的场景我们觉得Python慢是在循环的时候。那么**在循环里，我们可以注意如下**：

## 1、避免使用 `.` 操作

比如如下操作：

```python=
import math

class Demo:
    def something():
        pass

size = 10000
demo = Demo()
for x in range(size):
    for y in range(size):
        z = math.sqrt(x) + math.sqrt(y)  # 这里的 . 操作很慢
        demo.something()   # 这里的 . 操作很慢
```

`.` 会访问类的内部字典找到合适的方法或者属性，这些操作放在循环中就会拖慢速度。所以，应该尽量把这个操作从循环中去除。比如：

```python=
from math import sqrt   # <==== 

class Demo:
    def something():
        pass

size = 10000
demo = Demo()
sth = demo.something()
for x in range(size):
    for y in range(size):
        z = sqrt(x) + sqrt(y)  # <----
        sth()   # <----
```

## 2、避免循环临时变量

比如使用 `a, b = b, a` 来交换变量，而不是使用临时变量

## 3、字符串使用`join` 而不是 +

比如 `'_'.join(["a", "b"])`而不是 `"a"+"_"+"b"`。

使用join()拼接字符串时，会首先计算出需要申请的总的内存空间，然后一次性地申请所需内存，并将每个字符串元素复制到该内存中去。

## 4、使用隐式循环

比如 `sum(range(10)` 速度比for 循环更快。但是for循环比while循环更快！

## 5、大杀器：`numba.jit`

比如同样的代码，下面的循环一个在1s内完成，而普通版本需要4s。

```python=
import numba

@numba.jit
def computeSum(size: float) -> int:
    sum = 0
    for i in range(size):
        sum += i
    return sum

def main():
    size = 10000
    for _ in range(size):
        sum = computeSum(size)

main()
```

## 结论

总之，最低成本加速的方法就是尽量减少循环中的无意义操作，或者进行jit编译（其实也是减少Head的重量）。

