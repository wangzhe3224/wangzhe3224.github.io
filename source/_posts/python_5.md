---
title: 重新认识 Python（5）再谈并发
date: 2021-03-11
tags: [Python, Concurrent, Async]
categories: Coding
---

# 重新认识 Python（5）：再谈并发

之前写了一个关于[Python并发模型](https://zhuanlan.zhihu.com/p/354982602)的小文，主要讨论利用协程实现并发的一些基本方法和规则，文章的重点是 coroutine 的使用。这两天琢磨了一下为什么 Python 要提出基于协程的并发模型，以及跟线程、进程实现的并发有什么区别和联系？最后，我还想简单讨论一下这三种并发模型是否协调在一起工作。

## 进程、线程、协程并发的特点

首先明确明确一点，Python一般的协程库，比如 `asyncio` ，不存在任何并行，即一个时间只有一个任务（协程或者普通函数）在运行。而线程和进程在多核CPU的情况下通常是存在并行的，不过由于Python的GIL，Python的线程不存在并行计算，即使运行在多核CPU上。

我们再来看这三个模型的特点。

**进程**：在 Python 的世界里，如果想实现并行计算，进程应该是唯一的选择了，通常进程池数量不会超过CPU的核心数量，以免频繁的进行切换。所以，采用进程实现并发，可以实现并行计算，但是并发任务的数量非常有限。

**线程**：Python 的线程直接调用OS提供的线程，并没有特别的处理。所以，线程的调度是由OS主要负责的，属于抢占式。线程的开销比进程更低，所以一般一个应用有上百线程问题不大。但是线程的两个主要问题：抢占，程序基本不能控制OS会给那个线程执行权；race condition，当有并行的时候，由于共享内存，需要锁来控制共享内存。关于线程调度，其实Python的运行时有自己的调度，但是CPython的调度也是依赖于OS的，Python 只能告诉OS这个现在需要被抢占了，如果有还有其他等待的线程，它会让OS来分配下一个执行的线程。

**协程**：协程并发最主要的特点是合作式调度，不是抢占式。程序主动控制执行权的交接，而不是OS控制。这样就给调度器提供了非常强的定制性，可以根据具体需求进行调度。另外，协程基本上全部运行于一个OS线程内部，切换开销非常小，创建、销毁协程的开销也非常小。所以协程特别适合数量庞大、寿命较短的任务。通常一个线程可以轻松处理超过1万个协程，所以对于高并发场景，协程并发非常合适。

但是协程并发也有一些局限性：对于 CPU 计算密集或者一些阻塞的任务会让整个调度器卡在这个任务，直到计算结束。真正的解决方案只能是借助其他线程或者进程。还有一个问题就是生态的问题，Python的很多库其实对协程并发没有支持，容易出现处理不良的阻塞任务。这就导致了在采用协程编写并发系统时候，需要造轮子。

下面这个表格大致总结一下三个模型的特征：

| 模型 | 内存       | CPU              | 开销 |  数量   |
| ---- | ---------- | ---------------- | ---- | --- |
| 进程 | 不共享内存 | 多核并行         | 大   |  ~ 10  |
| 线程 | 共享内存   | Python不支持并行 | 中   |  ~ 100  |
| 协程 | 共享内存   | 一般无并行       | 小   |  ~ 1000+  |

对于具体的内存和CPU开销，总结如下：

| 模型 | 内存  | CPU |
| ---- | -----   | ---------- |
| 进程 |   -    |    -        |
| 线程 |  ~ 8MB  |   -        |
| 协程 | < 0.8kb | ~ 100 ns   |

我没统计全，如果有知道的朋友请留言，我会补上。谢谢

## 为什么加入协程

从上面的讨论也可以看出，协程无论实在内存和CPU的开销都有明显的优势，在一个OS进程中可以轻松孵化超过1万个协程进行并发计算，用完后这些协程可以被轻松回收，基本上不需要协程池。而进程和线程的并发，基本都会建立一个数量有限的线程或者进程池，能够并发的任务数量始终有限。协程的另一个好处在于，由于是单线程，本身不存在竞争。综合上面这些因素，协程并发很适合高并发 IO 开发。对于 CPU 密集的任务，或者需要 Blocking 的任务，线程或者进程仍然是首选。当然如果可以融合三种模型在同一个套API下就更好了。

对于 Python，由于GIL的存在，处理高并发最好的选择应该是协程，而不是线程。因为线程本来的优势在于有一定的并行能力，但是GIL剥夺了这个优势。

本质上协程并发就是把调度工作从OS中抽离，由应用端实现，增加了效率和可定制性。但是，协程的复杂度在于调度器的编写，以及执行权的移交等等。

## 如何融合三种并发基本工具?

从 Python 的角度说，并发模型目前主要由两个阵营：`concurrent.future` 和 `asyncio`，前者主要针对线程和进程并发，后者针对协程并发。当然新的协程语法 `async/await` 是 3.5 以后才加入，协程并发慢慢进入更多开发者的视野。对于协程并发，`curio` 这个库也很值得关注，它提供了一套不同于 `asyncio` 的API，但是基本原理都是提供了一个调度器来实现并发功能的封装。

本质上，进程、线程、协程都是实现并发的基本工具，并发编程的核心在于**通讯**方式。通讯模式通常分成三种：

- 队列, `A ----> 队列 ----> B`
- Actor，`A <---- ?`
- Pub/Sub，`A <---> 网关 <---> B`

只要我们搞清楚这几种模型，就有希望提供一个融合三种工具的并发编程API。下面我们用线程举例说明每一个模型，原因是比较简单，因为我们不需要操心调度的事情。然后我们可以探索一下用协程来实现，不过我们需要自己造点轮子，比如异步队列、调度器等等。

### 队列通讯

`A ----> 队列 ----> B`

原理非常简单，A B 两个线程通过队列进行沟通，A 向队列写入，B 从队列读取。最基本的操作如下：

```python 
from queue import Queue
from threading import Thread


def A(out_q):
    for i in range(10):
        # 放入数据
        out_q.put(i)
        print('放入数据', i)


def B(in_q):
    while True:
        try:
            d = in_q.get(timeout=5)
            print('读取数据', d)
        except:
            print('队列超时，退出')


if __name__ == '__main__':

    q = Queue()
    t1 = Thread(target=A, args=(q,))
    t2 = Thread(target=B, args=(q,))
    t1.start()
    t2.start()
```

Python中的 `Queue` 是线程安全的，而且可以保证数据的顺序，因此是很好的沟通工具。需要注意的是，这里 get 和 put 都是阻塞函数。

当然，除了通过 get 和 put 通讯，还有一些基本的信号工具，比如 `Event` 。比如如下：

```python  
from queue import Queue
from threading import Thread, Event

# A thread that produces data
def A(out_q):
    while True:
        ...
        evt = Event()
        out_q.put(('data', evt))
        ...
        # 等待B的信号
        evt.wait()


def B(in_q):
    while True:
        data, evt = in_q.get()
        ...
        # 给A信号
        evt.set()
```

值得注意的是，队列通讯传递的是数据的reference，因此数据是可变且共享的，实际使用应该注意，避免改写数据。

### Actor通讯

`A <---- ?`

上面看到队列通讯的特点是*共享内存*加*阻塞*。A 和 B 是事实上通过队列偶合在一起。而 Actor通讯中，A 不再与队列耦合，而是从外部接收消息，然后进行计算。当然他也可以给其他 Actor发送消息。类似于一种点对点的通讯，根据内部实现的不同，发送和接受信息可以是阻塞的，也可以是非阻塞的。

下面举个例子说明[参考](https://www.oreilly.com/library/view/python-cookbook-3rd/9781449357337/)：

```python 
from queue import Queue
from threading import Thread, Event


class ActorExit(Exception):
    pass


class Actor:

    def __init__(self):
        self._mailbox = Queue()
        self._terminated = None  # type: Event

    def send(self, msg):
        # 发送信息给 Actor
        self._mailbox.put(msg)

    def recv(self):
        # Actor 读取信息
        msg = self._mailbox.get()
        if msg is ActorExit:
            raise ActorExit('Actor exited.')
        return msg

    def close(self):
        self.send(ActorExit)

    def start(self):
        self._terminated = Event()
        t = Thread(target=self._bootstrap)
        t.daemon = True
        t.start()

    def join(self):
        # 阻塞等待完成
        self._terminated.wait()

    def _bootstrap(self):
        try:
            self.run()
        except ActorExit:
            pass
        finally:
            self._terminated.set()

    def run(self):
        # 这个函数包含了 Actor 的处理逻辑
        while True:
            msg = self.recv()
            print("Processing ", msg)


class PrintActor(Actor):
    def run(self):
        while True:
            msg = self.recv()
            print('Got:', msg)
            

if __name__ == '__main__':
    p = PrintActor()
    p.start()
    p.send('Hello')
    p.send('World')
    p.close()
    p.join()
    
# Got: Hello
# Got: World
```

上述实现是通过队列完成的， send 和 recv 都是阻塞的。其实，这个Actor的行为跟协程已经很像了，比如我们可以用携程重新实现上面：

```python
def print_actor():
    while True:
        try:
            msg = yield   # 等待接收信息
            print("Got:", msg)
        except GeneratorExit:
            print("Actor terminated")


if __name__ == '__main__':
    p = print_actor()
    next(p)  # 开始，函数执行到yield部分
    p.send("Hello")
    p.send("World")
    p.close()
```

效果是完全一样的，只不过前一个是通过线程和队列完成，后面的是通过协程，背后的调度的机制不同，但是通讯方式都是点对点的通讯。

Actor 是一个独立个体，他不与其他 Actor 共享内存，通讯接口只有一个 send 函数。这种模式给出了统一不同并发组件（线程、进程、协程）的可能性，即 Actor 的实现可以是上述任意一种，用来因对不同的任务类型。比如 CPU 密集的任务可以通过 Process Actor 完成，而 IO 密集任务则可以通过 Coroutine Actor 处理。

### Pub/Sub

`A <---> 网关 <---> B`

最后这个模式综合了前两种，把 队列 换成了网关，就是一个交换信息的地方，而 A 和 B 都是 Actor。网关的好处在于，Actor 之间不会产生直接的联系，因此各项业务逻辑被很好的分离开来。而且网关还具有一些额外的功能，比如广播，把同一个消息发送给多个 Actor。各种复杂的路由逻辑可以被封装在 网关 里进行处理，而其他 Actor 就实现了并发。

## 写在最后

实现高并发需要三个基本组件：调度器、任务、通讯。而任务的实现可以有不同的方法，比如线程、进程或者协程。通讯通常是通过队列或者网关，而调度器需要另外实现，负责只能依赖操作系统的线程调度。在很多高并发的场景下并不理想。

## 参考

- https://stackoverflow.com/questions/55761652/what-is-the-overhead-of-an-asyncio-task
- https://effectivepython.com/2015/03/10/consider-coroutines-to-run-many-functions-concurrently
- https://www.oreilly.com/library/view/python-cookbook-3rd/9781449357337/
