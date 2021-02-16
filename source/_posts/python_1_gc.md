---
title: 重新认识 Python（1）GC，垃圾回收
date: 2021-02-16
tags: [Python, GC]
categories: Coding
---

# 重新认识 Python（1）：GC，垃圾回收

Python是目前受众最为广泛的计算机语言之一，涉足的领域包罗万象：Web，机器学习，数据处理，爬虫等等。使用Python的人群也非常多样， 从专业的程序员到数据科学家。这种现状也导致了一个现象：大家对Python存在很多道听途说来的误解。比如，Python是解释型语言（其实python 还真不是，Python是编译型的，只不过他通过解释器执行编译后的代码，其实跟Java一样的，只不过java用虚拟机执行、解释代码），Python非常慢（讲快慢不讲场景都是耍流氓），GIL是垃圾设计（很多人其实不清楚GIL到底是什么？其设计初衷是什么？）， Python的GC很垃圾等等。这些误解通常是因为 Python过于火热，以至于内行、外行都可以随意评论一番，一些误解也就慢慢蔓延开来。我写这个系列的目的就是帮助大家重新认识Python，把 Python当成一个计算机语言，而不是一个工具来认识它。这样不仅会增加对语言本身的理解，也可以提高编写Python代码的质量。

今天我们先来聊一聊Python的GC。(CPython)

## Python的内存管理

说GC之前，我们先来看看Python的内存管理。与许多其他语言不同，由于Python中的所有值都是一个对象，object，所以Python程序运行的时候会产生数量众多但是体积很小的对象。因此，Python通常不会把已经申请的内存交还给操作系统，他会为每一个小于512byte的对象分配一个专门的allocator并且不会释放这些内存，方便以后继续使用。Python的很多内存直到进程结束才会释放给系统。

即使我们运行一个简单的包含第三方库的程序，进程中可能存在上百万个对象，但是他们的体积通常都非常小。正是因为这种对象管理模式，才能支持了Python的很多运行时的动态特性，也正是因为这些特征，Python才变得的如此灵活（当然，灵活的代价是牺牲一些性能）。

知道了Python的内存管理特性，我们就可以进一步理解Python的GC设计了。你会发现，很多设计就是为了支持这种内存管理模式而出现的。

## GC算法

Python的设计其实非常的和谐，一切皆对象。就连一个int也不例外，比如你可以打印整数1的对象id：

```python
print(id(1))
# 4419605632
```

上面我们提到一个简单的Python进程中可能存在成千上万的大大小小的对象，为他们分配内存通常很简单，但是回收这些内存就需要更多的心思了，因为一旦回收了还在使用的对象的内存就会导致程序崩溃。

Python的 GC 其实包含两个部分：Reference Counting 和 Generational cyclic GC。引用计数高效，但是却存在一个致命的问题：无法检测循环引用。所以必须使用额外的垃圾回收机制，Cpython选择了generational GC。

值得注意的是，引用计数算法是不可以认为干预的，完全由Python的运行时控制，而generational GC可以通过`gc module`认为控制。

### 引用计数

引用计数其实是解决GC超多对象垃圾回收简单且高效的方法！引用计数的原理很简单，python的运行时会追踪每一个object的reference counter，当reference counter 归零的时候，这个对象的内存就会被回收。

Python中所有的变量其实都是一个引用或者说指针，指向对应的对象。比如赋值语句会增加对象的引用，而一个对象可以拥有来自多个变量的引用。

Python中有三种方式可以增加引用：
- 赋值
- 传参
- 把对象放入容器，比如list

当一个对象的引用归零，如果它包含对其他对象的引用，其他对象的引用也会减少，如果其他对象的引用也因此归零，那么这个对象也会被回收。值得注意的是，被全局变量引用的对象，不会被回收。可以通过 `global()` 函数查看全局变量。

对于局部变量，即定义在函数内部的变量，当Python的解释器退出函数时，会移除这些变量对对象的引用，但不会删除对象。所以，**Python只有在退出函数或者对一个变量重新赋值的时候，才可能会进行垃圾回收（引用计数GC）！**，换句话说，如果你有一个超长的函数，内部超多产生了超多对象，Python是无法进行GC的，所以，应该尽量写精简的函数。

举个例子：

```python
import sys
foo = []
# 2 references, 1 from the foo var and 1 from getrefcount
print(sys.getrefcount(foo))

def bar(a):
    # 4 references
    # from the foo var, function argument, getrefcount and Python's function stack
    print(sys.getrefcount(a))

bar(foo)
# 2 references, the function scope is destroyed
print(sys.getrefcount(foo))
```

随便说一下，Python （cpython）无法轻易移除 GIL 的一个主要原因也是因为引用计数GC，因为多线程会搞乱引用计数。

### Generational GC， GGC

那么Python为什么还有第二套GC算法呢？这主要是因为引用计数无法处理循环引用或者自引用的情况。这两种情况都会让对象的引用数量至少维持在1，进而无法被GC。

```python
import gc

# We use ctypes moule  to access our unreachable objects by memory address.
class PyObject(ctypes.Structure):
    _fields_ = [("refcnt", ctypes.c_long)]


gc.disable()  # Disable generational gc

lst = []
lst.append(lst)

# Store address of the list
lst_address = id(lst)

# Destroy the lst reference
del lst

object_1 = {}
object_2 = {}
object_1['obj2'] = object_2
object_2['obj1'] = object_1

obj_address = id(object_1)

# Destroy references
del object_1, object_2

# Uncomment if you want to manually run garbage collection process 
# gc.collect()

# Check the reference count
print(PyObject.from_address(obj_address).refcnt)
print(PyObject.from_address(lst_address).refcnt)
```

上面的例子中， `del` 会移除变量对对象的引用，执行del以后，这个对象已经无法被系统的其他部分引用，但是，由于存在自引用，该对象无法被回收。为了解决这个问题，Python在1.5以后引入了GGC，专门处理这种情况。值得注意的是，循环引用只会出现在容器变量中，比如list，dict，自定义对象等等，因此GGC不会追踪不可变对象（除了Tuple）。

GGC不是实时进行的，而是周期性的触发。GGC会将所有的容器类型对象分成3代。新建立的对象首先进入第一代，如果它没有被第一次GC回收，这个对象会进入第二代，一次类推。而GGC会优先回收第一代的内存，假设新建的对象会更快的结束自己的生命。通过这种机制，提高GC性能，缩短系统暂停的时间。

那么GGC的触发机制是什么呢？我们提到GC会把对象分为三代，每一代都有自己的计数器和一个阈值。计数器存储自上一次GC以后，新分配的对象数量，减去回收的数量。每次系统分配新的内存时，会检查计数器是否超过阈值，如果是会出发GC。

如果检查时，超过2代达到阈值，GGC会选择更加古老的一代进行回收。因为老一代的对象是从新的一代过度进来的。但是，第三代的内存回收会做特别处理[3]，为了减少性能损失。

默认的设置是700，10，10。可以通过 `gc.get_threshold`查看每一代的阈值。

## 如何利用GC？

了解GC的原理是为了更好的利用GC。比如对于GGC，我们可以根据情况停止gc，以提高性能。

我们可以通过利用 `weakref` 来引用一些临时且不重要的对象，比如cache，这样GC可以任意回收他们。

## 参考

- https://docs.python.org/3.6/c-api/intro.html#objects-types-and-reference-counts
- https://rushter.com/blog/python-garbage-collector/
- https://github.com/python/cpython/blob/051295a8c57cc649fa5eaa43526143984a147411/Modules/gcmodule.c#L94
