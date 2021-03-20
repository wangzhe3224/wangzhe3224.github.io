---
title: 重新认识 Python（6）多进程编程
date: 2021-03-20
tags: [Python, Multiprocessing]
categories: Coding
---

# 重新认识 Python（6）多进程编程

这一期我们谈谈 Python 的多进程。之前在聊到 GIL 的时候，我们知道 Python 的多线程可以实现并发，但是不能实现并行，因为同一时间只能有一个线程获得 GIL 进行计算。因此，Python 的多线程不能有效利用多个CPU核心，不适合做 CPU 密集的活动。而多进程，multiprocessing，刚好解决了这个问题，能够实现并行并发编程，充分利用多个CPU核心。

接下来我们首先分析一下 Python 中的进程基本构成，然后介绍一下常见的多进程编程模型。

## `multiprocessing`

Python 启动进程有三种方式：
- spawn
- fork
- forserver

`spawn`，是最常见的方式。父进程会启动一个新的 Python 解释器，该解释器只会从父进程继承必要的资源来支持运行进程对象的`run`方法。值得注意的是，spwan产生的进程不会复制父进程中不必要的文件标识符或者句柄，这是相对于fork的一个优势。但是代价是spawn产生子进程的速度比较慢。

`fork`，就是OS自身的 fork 系统函数，产生的子进程会完全拷贝父进程的内存，包括父进程打开的资源，因此 fork 一个包含多线程的进程通常会导致问题。

`forkserver`，是一个独立的进程，此后需要产生子进程的时候，父进程需要联系该进程 fork 一个子进程。因为 forkserver 本身是一个单线程进程，所以是线程安全的。而且，与 spawn 类似，子进程只会继承必要的资源。

需要注意的是，在 Unix 系统中通过 `spawn` 和 `forkserver` 启动进程的同时，Python 还会启动一个资源追踪进程负责检控系统内的共享资源（ unlinked named system resources ），比如 named semaphores，SharedMemory 等等。其目的是防止一个进程被以外结束后，其相应的贡献资源造成内存泄漏。

可以通过 `set_start_method` 函数来指定进程的启动方式：

```python
import multiprocessing as mp

def foo(q):
    q.put('hello')

if __name__ == '__main__':
    mp.set_start_method('spawn')
    q = mp.Queue()
    p = mp.Process(target=foo, args=(q,))
    p.start()
    print(q.get())
    p.join()
```

或者可以使用 上下文管理器：

```python
import multiprocessing as mp

def foo(q):
    q.put('hello')

if __name__ == '__main__':
    ctx = mp.get_context('spawn')
    q = ctx.Queue()
    p = ctx.Process(target=foo, args=(q,))
    p.start()
    print(q.get())
    p.join()
```

## Pool

Pool 是最简的多进程模型，简单说就是并行地执行一些列不需要通讯的任务。通常这些任务都是 CPU 密集的，因为 IO 密集的任务多线程模型可能效果更好。

Pool 的使用非常简单，主要提供 4 种 API：

```python
def calculatestar(args):
    return calculate(*args)

def mul(a, b):
    time.sleep(0.5 * random.random())
    return a * b

def plus(a, b):
    time.sleep(0.5 * random.random())
    return a + b


PROCESSES = 8
with multiprocessing.Pool(PROCESSES) as pool:
    TASKS = [(mul, (i, 7)) for i in range(10)] + \
    [(plus, (i, 8)) for i in range(10)]

    results = [pool.apply_async(calculate, t) for t in TASKS]
    imap_it = pool.imap(calculatestar, TASKS)
    imap_unordered_it = pool.imap_unordered(calculatestar, TASKS)

    print('Ordered results using pool.apply_async():')
    for r in results:
    print('\t', r.get())
    print()

    print('Ordered results using pool.imap():')
    for x in imap_it:
    print('\t', x)
    print()

    print('Unordered results using pool.imap_unordered():')
    for x in imap_unordered_it:
    print('\t', x)
    print()

    print('Ordered results using pool.map() --- will block till complete:')
    for x in pool.map(calculatestar, TASKS):
    print('\t', x)
    print()
```

值得一提是，对于这种简单的任务并行计算，Python 提供了一个更加简单的通用的接口：`concurrent.futures`。这个为进程池和线程池提供了一个统一的执行接口。同时也为进程外执行提供了接口，比如可以直接把任务分配给诸如 spark 或者 k8s 这样的计算集群。

## 通讯与同步

除了简单的并行计算，多进程编程还需要实现进程之间的通讯和同步。通讯方式主要有两种：`Queue` 和 `Pipes` 。

*Queue*

```python
from multiprocessing import Process, Queue

def f(q):
    q.put([42, None, 'hello'])

if __name__ == '__main__':
    q = Queue()
    p = Process(target=f, args=(q,))
    p.start()
    print(q.get())    # prints "[42, None, 'hello']"
    p.join()
```

*Pipes*

```python
from multiprocessing import Process, Pipe

def f(conn):
    conn.send([42, None, 'hello'])
    conn.close()

if __name__ == '__main__':
    parent_conn, child_conn = Pipe()
    p = Process(target=f, args=(child_conn,))
    p.start()
    print(parent_conn.recv())   # prints "[42, None, 'hello']"
    p.join()
```

而同步机制与多线程类似，通常是通过共享资源和锁完成的。

```python
from multiprocessing import Process, Lock

def f(l, i):
    l.acquire()
    try:
        print('hello world', i)
    finally:
        l.release()

if __name__ == '__main__':
    lock = Lock()

    for num in range(10):
        Process(target=f, args=(lock, num)).start()
```


**Connection**

通讯还可以通过 Connection 进行 Message passing 完成。比如 Listener 和 Client。Connection 是 pipes 返回的一个对象。

`Connection` 提供了两个 socket 的 wrapper ： `Listener` 和 `Client`，实现进程之间的通讯。比如如下实现一个跨进程的 echo server 。

```python=
from multiprocessing.connection import Listener, Client
import traceback


def echo_client(conn):
    try:
        while True:
            msg = conn.recv()
            conn.send(msg)
    except EOFError:
        print('连接关闭')


def echo_server(addr, auth):
    serv = Listener(addr, authkey=auth)
    while True:
        try:
            client = serv.accept()
            echo_client(client)
        except Exception:
            traceback.print_exc()


if __name__ == '__main__':
    key = b'aaaaaaaa'
    echo_server(('', 25000), auth=key)
    # c = Client(('localhost', 25000), authkey=key)
    # # c.send('hello')
    # # print(c.recv())
```

由于有 socket API，如果进程运行在同一个机器上，还可以使用本地通讯，比如 UNIX domain sockets。实现也很简答，比如把 Listener 替换成本地文件：`s = Listener('/tmp/myconn', authkey=b'peekaboo')`。

## RPC

在上文提到的 message passing 基础上，我们可以构建 RPC 层，就是 remote procedure call，实现跨进程、跨服务器通讯。

首先我们实现一个 RPC 服务器：

```python
import pickle
from multiprocessing.connection import Listener
from threading import Thread


class RPCHandler:

    def __init__(self):
        self._functions = {}

    def register_function(self, func):
        self._functions[func.__name__] = func

    def handle_connection(self, conn):
        try:
            while True:
                func_name, args, kwargs = pickle.loads(conn.recv())
                try:
                    r = self._functions[func_name](*args, **kwargs)
                    conn.send(pickle.dumps(r))
                except Exception as e:
                    conn.send(pickle.dumps(e))

        except EOFError:
            pass

class RPCProxy:

    def __init__(self, conn):
        self._conn = conn

    def __getattr__(self, item):
        # 重写，实现远程调用。比如 proxy.sum(1,2)
        def do_rpc(*args, **kwargs):
            self._conn.send(pickle.dumps((item, args, kwargs)))
            result = pickle.loads(self._conn.recv())
            if isinstance(result, Exception):
                raise result
            return result
        return do_rpc


def rpc_server(handler, addr, authkey):
    sock = Listener(addr, authkey=authkey)
    while True:
        client = sock.accept()
        # 启动一个新的线程处理远程请求
        t = Thread(target=handler.handle_connection, args=(client, ))
        t.daemon = True
        t.start()


# 一些简单的例子
def add(x, y):
    return x + y


def sub(x, y):
    return x - y


handler = RPCHandler()
handler.register_function(add)
handler.register_function(sub)
rpc_server(handler, ('localhost', 25000), authkey=b'1234')
```

然后，我们就可以通过代理，Proxy，实现远程调用了：

```bash
from multiprocessing.connection import Client
c = Client(('localhost', 25000), authkey=b'1234')
proxy = RPCProxy(c)
proxy.add(2,3)
# 5
```

这种编程模式非常强大，因为进程间通讯可以换成任意中间件，比如 ZeroMQ 等等，如果采用其他序列化方式，而不是 pickle，可以轻松实现不同语言的跨进程调用。

## 共享内存

Python 提供了比较丰富的共享内存的方式，比如可以直接使用共享数据类型或者使用管理器。但是共享内存并不是并行通信最推荐的方式。

*Shared Memory*

```python 
from multiprocessing import Process, Value, Array

def f(n, a):
    n.value = 3.1415927
    for i in range(len(a)):
        a[i] = -a[i]

if __name__ == '__main__':
    num = Value('d', 0.0)
    arr = Array('i', range(10))

    p = Process(target=f, args=(num, arr))
    p.start()
    p.join()

    print(num.value)
    print(arr[:])
```

*Manager*

```python
from multiprocessing import Process, Manager

def f(d, l):
    d[1] = '1'
    d['2'] = 2
    d[0.25] = None
    l.reverse()

if __name__ == '__main__':
    with Manager() as manager:
        d = manager.dict()
        l = manager.list(range(10))

        p = Process(target=f, args=(d, l))
        p.start()
        p.join()

        print(d)
        print(l)
```

## 总结

多进程编程的模型跟多线程非常类似，但是一般用于 long run 任务，或者 CPU 密集任务。由于进程的启动、销毁和切换开销都比较大，通常进程数量不会超过CPU核心数量。

进程之间的通讯可以通过共享内存或者 message passing 实现，推荐使用后者。

RPC是强大的范式。