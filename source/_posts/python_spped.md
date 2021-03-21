---
title: 让 Python 加速飞
date: 2021-03-21
tag: [Python, Cython, Numba]
categories: [Coding]
---

# 让 Python 加速飞

Python 是一个开发很快的语言，相应的他不是一个运行速度很快的语言。原因呢，主要是动态类型设计，导致类型需要在运行时检查。在一般的应用中，特别是 IO 密集应用里，性能往往构不成问题。

对于 CPU 密集问题，Python 的科学计算生态其实非常好，得益于 CPython 的 C API，numpy, scipy 已经把科学计算性能提升了一个档次，深度学习基本也是python API的天下了。这些库已经把性能瓶颈从 Python 中剥离了。

其实 Python 最致命的性能问题在于循环，一旦代码中出现了大量循环计算，又没有现成的 numpy 函数可以用，性能往往就会成问题。今天我们介绍两个主要的方法，让 Python 的循环飞起来。这两个工具是：`Cython` 和 `Numba`。

## Cython

[Cython](https://cython.org/) 包含两个部分：语言和编译器。Cython 从概念上说是一门新的语言，但是他是 Python 语言的超集，即合法的 Python 代码（大部分）都是合法的 Cython 代码。第二个部分是 `cython` 编译器，这个编译器会把 Cython 代码编译成相应的 C 代码，这些 C 代码会调用 CPython 的 C API。编译后会直接生成 Python 的 extension，并且可以直接被其他纯 Python 代码引入和调用。

> Cython is a programming language that makes writing C extensions for the Python language as easy as Python itself.

原理上，Cython 是通过编译出来的 C 目标文件直接编程 Python 拓展，被Python调用的方式来提升速度。因为编译出来的拓展函数，与 C 语言写的函数性能一致。换句话说， Cython 产生的代码会具备 c 的性能，同时可以与 Python 的 runtime 通过 C API 互动实现兼容。

### 安装 Cython

`pip install cython`

建议安装 0.29 版本。

### 举例

举个求质数的函数作为例子：

```python
def primes_python(nb_primes):
    p = []
    n = 2
    while len(p) < nb_primes:
        # Is n prime?
        for i in p:
            if n % i == 0:
                break

        # If no break occurred in the loop
        else:
            p.append(n)
        n += 1
    return p
```

我们存储文件为：`python_prime.py`。这个函数的主体是一个循环。

我们说过 Cython 是 Python 的超集，cython 编译器可以直接编译上述函数。我们拷贝文件存储成：`cython_python_prime.py`，一会儿我们编译这个文件。

我们也可以通过加入类型声明，进一步提升性能：

```python 
def primes(int nb_primes):
    cdef int n, i, len_p
    cdef int p[1000]
    if nb_primes > 1000:
        nb_primes = 1000

    len_p = 0
    n = 2
    while len_p < nb_primes:
        # is n a prime?
        for i in p[: len_p]:
            if n % i == 0:
                break
        
        else:
            p[len_p] = n 
            len_p += 1
        n += 1
    
    result = [prime for prime in p[:len_p]]
    return resul
```

我们把上述文件存储为：`cython_primer.pyx`。这里 pyx 就是 cython 的拓展名。这时候，我们根目录目前有三个文件：

- `python_prime.py`
- `cython_python_prime.py`
- `cython_primer.pyx`

为了编译 cpython 目标文件，我们还需要创建一个 `setup.py` 文件：

```python
from setuptools import setup
from Cython.Build import cythonize

setup(
    name='Hello world app',
    ext_modules=cythonize(["cython_primer.pyx", "cython_python_prime.py"],
                          annotate=True),
    zip_safe=False,
)
```

好，准备就绪。编译：`python setup.py build_ext --inplace`。编译完成后，根目录会生成一个 `.so` 文件，就是我们 Python 拓展的目标文件。

我们来测试一下三个函数的性能：

```
> python -m timeit -s 'from python_prime import primes' 'primes(1000)'
10 loops, best of 5: 22.9 msec per loop
> python -m timeit -s 'from cython_python_prime import primes' 'primes(1000)'
20 loops, best of 5: 11 msec per loop
> python -m timeit -s 'from cython_primer import primes' 'primes_python(1000)'
200 loops, best of 5: 1.36 msec per loop
```

可以看出，即使直接编译纯 Python 文件，性能也提升近2倍，而使用 Cython 语法后，性能提升约20倍。而且，这个函数比较简单，大部分代码的都在与 CPython 运行时互动，如果是复杂的函数，性能提升更加明显。

编译器还会生成一个函数与Cpython互动的 html 文件用来检查：

![](https://i.imgur.com/n1GILGd.png)

## Numba

Numba 走的是 JIT 的路线，不需要 Cython 哪样提前编译。使用起来非常简单！

```python 
from numba import jit

@jit
def primes_python(nb_primes):
    p = []
    n = 2
    while len(p) < nb_primes:
        # Is n prime?
        for i in p:
            if n % i == 0:
                break

        # If no break occurred in the loop
        else:
            p.append(n)
        n += 1
    return p
```

只需要加一个 `@jit` 的装饰器，性能就达到了 Cython 的水平。

```
❯ python -m timeit -s 'from numba_primer import primes_python' 'primes_python(1000)'
1 loop, best of 5: 1.99 msec per loop
❯ python -m timeit -s 'from numba_primer import primes_python' 'primes_python(1000)'
200 loops, best of 5: 1.45 msec per loop
```

不过可以看到，由于是 JIT，函数需要一些预热，第一次测试性能不如后面的好。

