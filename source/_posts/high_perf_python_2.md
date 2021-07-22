---
title: 高性能Python编程（2）Profiling寻找性能瓶颈
date: 2021-07-22
tags: [Python, Profiling]
categories: Coding
---

# 高性能Python编程（2）Profiling寻找性能瓶颈

> - [高性能Python编程（1）：理解Python的“性能”](https://wangzhe3224.github.io/2021/06/24/high_perform_python/)

> 相关源代码：https://github.com/wangzhe3224/high_performance_python
> 更多学习资源：微信搜索   泛程序员   并添加关注，点击资源按钮。
> 更多学习视频：微信视频号  Python知否

![](https://i.imgur.com/sFSXT7N.jpg)


上一篇我们分析了计算机的三个组成部分，以及对应到Python程序的意义，这一篇我们从比较概括的角度介绍高性能编程的第一步：Profiling。（这个词我也不知道该怎么翻译，程序侧写？）

Profiling可以帮助我们发现：程序的那个部分运行缓慢（计算单元）、哪个部分占用大量内存（存储单元）、那个部分占用了网络、硬盘IO（通信单元）等等。所以Profiling是我们提高运行效率的第一步。

**划重点**：
> 1. 当你想要优化你的程序以前，先Profile！换句话说，不profile不优化。
> 2. 无论你怎么Profiling你的代码，确保代码有足够的unit test覆盖，避免一些错误，重构代码也更有信心。

记住这两个原则将会在你的编码生涯中为你节约大量时间。而我们接下来要讨论的就是如何高效Profiling。

首先，讨论最基础的Profiling工具：`%timeit`，`time.time()` 和time装饰器。然后介绍`cProfiler`，这个内置包可以帮助我们查看程序中不同函数占用的时间，帮助发现瓶颈。接下来，`line_profiler` 可以对选中的瓶颈函数进行逐行profile，比如每一个行被调用多少次，每一行花掉时间的百分比等等。最后，我们还需要提一下`memory_profiler`，它可以用来分析我们的内存使用情况，可以解决诸如为什么这个函数使用过多的内存之类的问题。

上面提到的都属于静态Profile，对于一些长期驻留内存的进程，可以通过`py-spy`对进程的CPU和内存使用进行实时动态Profile，这类工具对于在线debug非常有帮助。

有了上面的分析后，我们基本可以确定程序的CPU和内存瓶颈，我们就可以对症下药，提高性能，比如编译、查看ByteCode等等。具体方法我们在后面的文章继续说明。

## 例子：生成Julia集

为了让讨论更加具体，这个系列会用通过一个实际的例子说明：生成Julia集。这个例子属于计算密集型函数，覆盖了Python常见的一些操作，比如循环、判断等。[具体代码](https://github.com/wangzhe3224/high_performance_python/blob/master/src/julia_set.py)在这里。

直接运行的结果为：

![Julia集](https://i.imgur.com/iKTwdN6.png)

这一篇我们首先用纯Python实现Julia集，然后以这个函数为例，讲解如何对Python程序Profiling。

下面就是julia集的核心函数，由纯Python实现。

```python
def calculate_z_serial_purepython(max_iter, zs, cs):
    output = [0] * len(zs)
    for i in range(len(zs)):
        n = 0
        z = zs[i]
        c = cs[i]
        while (abs(z)) < 2 and n < max_iter:
            z = z*z + c
            n += 1
        output[i] = n
    return output
    
    
def calc_pure_python(width: int, max_iter: int):
    """ Create a list of complex coordinates """
    x_step = ( x2 - x1 ) / width
    y_step = ( y2 - y1 ) / width
    x, y = [], []
    ycood = y1 
    while ycood < y2:
        y.append(ycood)
        ycood += y_step
    xcood = x1
    while xcood < x2:
        x.append(xcood)
        xcood += x_step

    zs = []
    cs = []
    for ycoord in y:
        for xcoord in x:
            zs.append(complex(xcoord, ycoord)) 
            cs.append(complex(c_real, c_imag))
    
    print(f"Length of x: {len(x)}")
    print(f"Total elements: {len(zs)}")
    
    # 这里我们进行一个简单的计时，来粗略估计函数的运行时间。
    start_time = time.time()
    output = calculate_z_serial_purepython(max_iter, zs, cs)
    end_time = time.time()
    secs = end_time - start_time
    print(f"{calculate_z_serial_purepython.__name__} took {secs} seconds.")
    print(f"{sum(output) = }")
    return output
```

可以看到，在调用`calculate_z_serial_purepython`后，通过使用`start_time`和`end_time`，可以获得函数运行一次消耗的时间。

在我的电脑上输出如下：

```
Length of x: 1000
Total elements: 1000000
calculate_z_serial_purepython took 5.339544057846069 seconds.
sum(output) = 33219980
```

`calculate_z_serial_purepython` 耗时5.34秒，总计计算了3亿个强度值。（CPython3.9，MacBook Pro 16）

## CPU和内存Profile方法

### `timeit`

最简单的Profile方法是利用`time`和`print`，就像我们上一小节做的一样，但是用起来不是很方便，我们可以写一个装饰器来实现这个功能：

```python=
from functools import wraps


def timefn(fn):
    @wraps(fn)
    def measure_time(*args, **kwargs):
        t1 = time.time()
        result = fn(*args, **kwargs)
        t2 = time.time()
        print(f"@timefn: {fn.__name__} took {t2-t1:.4f} seconds")
        return result

    return measure_time
```

然后我们就可以装饰需要profile的函数，比如：

```python=
@timefn
def calculate_z_serial_purepython(max_iter, zs, cs):
    ...
```

不过这样profile有一个弊端就是我们只能取一个sample，而好的profile通常需要多次运行，观察统计特征，这样才能排除各种干扰因素。我们可以利用timeit库，然后：

```
> python -m timeit -n 5 -r 4 -s "some python code"
> 5 loops, best of 1: 8.45 sec per loop
```

其中，`-n` 表示每次运行循环次数，`-r`表示重复次数，`-s`后面接测试的代码块。

如果用IPython，可以直接用`%timeit`。


## `cProfiler`

输入如下命令进行Profile，并把结果输出到`profile.stats`文件。

```
python -m cProfile -o profile.stats src/julia_set.py
```

然后，可以进入Python的Console读取分析：

```python
import pstats
p = pstats.Stats("profile.stats")
p.sort_stats("cumulative")
p.print_stats(10)
```

输出如下结果：

```
Tue Jul 20 22:37:12 2021    profile.stats

         36682126 function calls (36675327 primitive calls) in 10.651 seconds

   Ordered by: cumulative time
   List reduced from 2611 to 10 due to restriction <10>

   ncalls  tottime  percall  cumtime  percall filename:lineno(function)
    578/1    0.001    0.000   10.652   10.652 {built-in method builtins.exec}
        1    0.032    0.032   10.652   10.652 src/julia_set.py:1(<module>)
        1    0.468    0.468    9.979    9.979 src/julia_set.py:54(calc_pure_python)
        1    7.072    7.072    9.357    9.357 src/julia_set.py:40(calculate_z_serial_purepython)
 34220076    2.285    0.000    2.285    0.000 {built-in method builtins.abs}
```

可以很容易识别瓶颈：`calculate_z_serial_purepython`。不过`cProfiler`的输出结果非常多，不是很容易读。可是使用`snakeviz`对profile的结果文件进行可视化：`snakeviz profile.stats`

![](https://i.imgur.com/rjGz6yO.png)


## `line_profiler`

在识别瓶颈函数后，可以通过`line_profiler`对该函数进行逐行分析，从而进一步了解计算瓶颈。

安装profiler：`pip install line_profiler`

在需要profile 的函数前加入`@profile`装饰器：

```python 
import line_profiler

@profile
def calculate_z_serial_purepython(max_iter, zs, cs):
    ...
```

执行：`kernprof -l -v src/julia_set_kernprof.py`，结果会被保存在`julia_set_kernprof.py.lprof`文件中。

结果：

```
Timer unit: 1e-06 s

Total time: 39.3034 s
File: src/julia_set_kernprof.py
Function: calculate_z_serial_purepython at line 43

Line #      Hits         Time  Per Hit   % Time  Line Contents
==============================================================
    43                                           @profile
    44                                           def calculate_z_serial_purepython(max_iter, zs, cs):
    45         1       4029.0   4029.0      0.0      output = [0] * len(zs)
    46   1000001     327962.0      0.3      0.8      for i in range(len(zs)):
    47   1000000     334117.0      0.3      0.9          n = 0
    48   1000000     372342.0      0.4      0.9          z = zs[i]
    49   1000000     338387.0      0.3      0.9          c = cs[i]
    50  34219980   14987467.0      0.4     38.1          while (abs(z)) < 2 and n < max_iter:
    51  33219980   11923257.0      0.4     30.3              z = z*z + c
    52  33219980   10647361.0      0.3     27.1              n += 1
    53   1000000     368513.0      0.4      0.9          output[i] = n
    54         1          0.0      0.0      0.0      return output
```

大家可以发现核心的部分：

```
    50  34219980   14987467.0      0.4     38.1          while (abs(z)) < 2 and n < max_iter:
    51  33219980   11923257.0      0.4     30.3              z = z*z + c
    52  33219980   10647361.0      0.3     27.1              n += 1
```

即进行基本数学运算的内存循环部分，这部分代码我们可以通过Numba或者Cython直接编译成C然后编译成机器码执行，进行加速。


## `memory_profiler`

下一步就是对程序的内存使用进行profile，可以使用`memory_profiler`，安装：`pip install memory_profiler`。另外建议同时安装：`pip install psutil`，这样可以加速profile的速度。

`mprof run src/julia_set_memory_profiler.py`

在profile结束后，我们可以用`mprof plot`画出内存增长的趋势图，并且标注目标函数：

![](https://i.imgur.com/ubbnTIe.png)

我们发现`calculate_z_serial_purepython`这段时间内存持续增加，这是由于Python不会断创建新的`int`和`float`对象（还记得吗？Python中每一个对象都会占用较大的内存空间，即使是int，因为Python的内存模型就是object，无论是什么对象。）

同样这部分可以通过numba或者cython编译，跳过python解释器执行，降低内存使用。

## `PySpy`

最后，介绍一下如何用`pyspy`对正在运行的Python进程进行实时监测。这种方法可以对进程进行在线debug，工程中非常实用。

安装：`pip install py-spy`

pyspy 主要由两种常用模式：dump和top。dump会为指定的process一个snapshot，然后dump到文件；而top会进行实时采样，或一种类似系统top命名的界面，实时监控进程的内存和CPU使用情况。

也可以通过record获得不同函数的资源图：`sudo py-spy record -o profile.svg -- python src/julia_set.py`

![](https://i.imgur.com/4OO294A.png)


## 总结

本文介绍了4中主要的profile工具，其中2种是CPU相关的，1种是内存相关的，最后的py-spy是针对长寿命进程的采样分析。

![](https://i.imgur.com/ctU3xEJ.jpg)