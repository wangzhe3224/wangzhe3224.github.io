---
title: 重新认识 Python（4）并发模型
date: 2021-02-18
tags: [Python, Concurrent, Generator, Async]
categories: Coding
---

# 重新认识 Python（4）并发模型

## 并发是什么？

并发一般是指多个计算在时间上无固定先后顺序的执行。并发程序不一定存在并行。举个例子[reference](https://web.mit.edu/6.005/www/fa14/classes/17-concurrency/#message_passing_example): 

![并发实例](https://i.imgur.com/LG0PL9t.png)

上面的例子中我们有三个任务，T1~3，这三个任务就属于并发执行，而且因为有两个CPU，所以存在一定的并行。左图是每一个任务在CPU核心的执行情况，而右图是从任务自身的时间线角度表达任务的执行情况。可以看到任务通常不是连续执行，而是根据调度情况间断执行。

并发编程的一个好处就是可以让数量有限的CPU核心，“看起来”同时执行数量远远大于核心数量的任务，换句话说，增加系统的对请求的响应程度。

并发模型最常见的程序其实就是操作系统，一个普通的操作系统运行在一个8核CPU上，却可以“看起来”同时执行成千上万个任务，这就是并发模型的效果。

如果不谈操作系统，而是其他基于操作系统的应用的例子，比如Web 服务器，需要同时对众多请求作出回应。

## Python怎么搞并发？

Python提供了三种并发的工具：多线程（threading）、多进程（process）和协程（Coroutine）。前两种其实就是利用了操作系统提供的并发模型。

### 线程和进程

CPython的Thread其实就是操作系统的线程，基本没有overhead。

```c=
#if defined(_POSIX_THREADS)
#   define PYTHREAD_NAME "pthread"
#   include "thread_pthread.h"
#elif defined(NT_THREADS)
#   define PYTHREAD_NAME "nt"
#   include "thread_nt.h"
#else
#   error "Require native threads. See https://bugs.python.org/issue31370"
#endif
```

这段代码可见，Python会根据操作系统调用对应系统的线程API，然后把调度工作移交OS。这里需要注意的是，由于GIL的存在，每一个Python解释器进程中，同一时间只能有一个线程执行。这意味着，在这种情况下，利用线程实现的并发模型中，不存在并行。

线程实现的并发模型比较容易理解：

```python=
import threading


def main():
    target = lambda : print('Hello from NEW thread\n')
    my_thread = threading.Thread(target=target)
    my_thread.start()
    print('Hello from MAIN thread\n')
    my_thread.join()


if __name__ == '__main__':

    main()
```

开进程，指定任务，执行就可以了。其余的调度工作完全移交操作系统统一管理。当然，这样做的弊端也很明显：

- 线程创建和切换的开销都比较大，数量有限
- 移交操作系统调度后，程序员基本失去了对任务的控制，属于抢占式

### 协程，Coroutine

为了解决上面的弊端，Python也给出了协程的方案。协程跟线程的最大区别就是：协程是协作式的，线程是抢占式的。具体讲就是一个协程会在预订的位置让出执行权，并且主动的移交给其他协程，而线程则是抢占式的，一个线程会在任意时间被夺去执行权。

协程可以理解成是一般函数的泛化。一般的函数只有一个入口和若干个出口，协程具有多个入口和出口。

在Python中主要涉及到`yield` 和 `yield from` 关键字。

下面举几个简单的例子：

```python=
def hello_world():
    yield "Hello "
    yield "World!"

hw = hello_world()
print(next(hw))
print(next(hw))
try:
    print(next(hw))
except StopIteration:
    print('Finished')

# 输出：
# Hello 
# World!
# Finished
```

`next` 函数会逐一访问到每一个yield点，知道没有其他 yield 为止。而 yield 的功能就是让函数交出执行权，知道下一次被调用，他会从上一个yield点开始执行。严格来讲，上面这个 hello_world 还不是完整的协程，因为 yield 仅仅把执行权交还给调用方，而不是任意其它协程。我们看下一个例子：

```python=
def co1():
    print('World')
    yield 'co1'

c1 = co1()

def co2():
    print('Hello')
    yield from c1

c2 = co2()
next(c2)
# 输出
# Hello
# World
# co1
```

可以看到，协程 co2 把执行权主动交给 co1 而不是交还给调用方。

不过，Python 3.5以后引入了`asnyc/await` 作为协程的原生支持。其实就是是避免写 `yield` 与 生成器混淆，如果你trace down代码的话，所有的 await 最后都会在某处出现 `yield` 关键字。我们举个例子就会发现其实 async/await 就是 yield 的语法糖，表明函数时协程，而不是普通函数。

```python=
class Awaitable:

    def __await__(self):
        yield


def yield_():
    return Awaitable()


async def a1():
    print("Hello ")
    await yield_()
    print("World!")

a = a1()
a.send(None)
a.send(None)

# 输出
# Hello
# World!
```

可以看出，async 定义的函数就是一个协程。

至此，我们已经了解协程的基本原理，下面我们来看一下如何利用协程实现并发。

### 协程并发

假设我们有两个任务需要并发执行，一个向上数，一个向下数。

```python=
from time import sleep
def countdown(n):
    while n > 0:
        print('Down', n)
        sleep(1)
        n -= 1

def countup(stop):
    x = 0
    while x < stop:
        print('Up', x)
        sleep(1)
        x += 1
        
countdown(5)
countup(20)
```

运行上面程序肯定无法实现并发，而是顺序执行。由于loop和sleep的存在程序也会block。那么我们如何实现并发？

首先，我们需要把函数改写成 协程 ，这样这两个任务就可以主动交出执行权。然后需要我们自己写一个 调度器 来实现不同任务的并发调度。最后我们还需要处理一下sleep的block问题。

```python=
from time import sleep

def countdown(n):
    while n > 0:
        print('Down', n)
        sleep(1)
        yield  # 这样，函数就可以在loop的途中交出执行权
        n -= 1


def countup(stop):
    x = 0
    while x < stop:
        print('Up', x)
        sleep(0.2)
        yield  # 这样，函数就可以在loop的途中交出执行权
        x += 1
```

通过加入 yield，这两个任务现在会在每一次loop的时候主动交出控制权。接下来，我们来实现一个简单的调度器：

```python=
from time import sleep
import time
from collections import deque


class Scheduler1:
    def __init__(self):
        self.ready = deque()
        self.current = None  # 当前任务的指针
        self.sequence = 0

    def new_task(self, coro):
        self.ready.append(coro)

    def run(self):
        while self.ready:

            self.current = self.ready.popleft()
            # 执行下一步
            try:
                self.current.send(None)
                if self.current:
                    self.ready.append(self.current)
            except StopIteration:
                pass


def countdown(n):
    while n > 0:
        print('Down', n)
        sleep(1)
        yield
        n -= 1


def countup(stop):
    x = 0
    while x < stop:
        print('Up', x)
        sleep(0.2)
        yield
        x += 1

sched = Scheduler1()
sched.new_task(countdown(5))
sched.new_task(countup(5))
sched.run()

'''
Down 5
Up 0
Down 4
Up 1
Down 3
Up 2
Down 2
Up 3
Down 1
Up 4
'''
```

可以看出，通过简单的调度，我们就实现了两个任务的并发执行。调度器本身的原理非常简单，就是一个循环，不断检查是否有活跃的任务，如果有，就通过 send 执行任务，如果没有异常，就说明任务没有完成，再把任务放回队列。循环。

现在我们还有一个问题，就是sleep的问题，现在sleep还是block的。我们需要在 调度器 中处理这种情况。

```python=
from time import sleep
import time
from collections import deque

class Scheduler2:
    def __init__(self):
        self.ready = deque()
        self.sleeping = []
        self.current = None  # 当前任务的指针
        self.sequence = 0

    def sleep(self, delay):
        deadline = time.time() + delay
        self.sequence += 1  # 这个是为了 heap 排序
        heapq.heappush(self.sleeping, (deadline, self.sequence, self.current))
        self.current = None  
        yield  # 交出控制权限

    def new_task(self, coro):
        self.ready.append(coro)

    def run(self):
        while self.ready or self.sleeping:
            if not self.ready:
                deadline, _, coro = heapq.heappop(self.sleeping)
                delta = deadline - time.time()
                if delta > 0:
                    time.sleep(delta)
                self.ready.append(coro)

            self.current = self.ready.popleft()
            # 执行下一步
            try:
                self.current.send(None)
                if self.current:
                    self.ready.append(self.current)
            except StopIteration:
                pass
                
def countdown(n):
    while n > 0:
        print('Down', n)
        yield from sched.sleep(1)  # 注意这里，协程主动把执行权交给 sleep，就是另一个协程
        n -= 1


def countup(stop):
    x = 0
    while x < stop:
        print('Up', x)
        yield from sched.sleep(0.2)
        x += 1
        
'''
Down 5
Up 0
Down 4
Up 1
Up 2
Up 3
Up 4
Up 5
Down 3
Up 6
Up 7
Up 8
Up 9
Up 10
Down 2
Up 11
Up 12
Up 13
Up 14
Up 15
Down 1
Up 16
Up 17
Up 18
Up 19
'''
```

可以看到，调度器通过一个 sleep 协程实现了非阻塞的睡眠。`yield from` 可以把执行权交给另一个协程，而不是调度器。


其实，如果你用过 `asyncio` 库，就会发现这个库的核心就是一个类似的调度器。
```python=
import asyncio

async def main():
    print('hello')
    await asyncio.sleep(1)
    print('world')

asyncio.run(main())
```

这里面的 `await` 就是 `yield from` 的功能，即把执行权移交另一个协程。而 `async` 的主要目的是规范化协程语法，与一般函数进行区别。当然，Python内部有后来慢慢加入了不同的类型。比如 `async` 定义的协程的类型是： async_generator， 而 yield 定义的类型为： generator。

## Python并发还能怎么搞？

上面提到的都是一些比较常见的方法。当然Python里面还有一些不太常用到的模型。比如

- Actor Model
- CSP
- Multiple Interpreters，https://www.python.org/dev/peps/pep-0554/#id56


## 参考

- https://www.youtube.com/watch?v=Y4Gt3Xjd7G8
