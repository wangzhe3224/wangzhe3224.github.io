---
title: 编程101 PyOS 一个Python写的OS 3
date: 2021-03-07
tags: [Python, Concurrent, Operating System]
categories: Coding
---

> PyOS 0.3
> 
# PyOS - 一个Python写的OS（3）

目录：
- [PyOS - 一个Python写的OS（1）](https://zhuanlan.zhihu.com/p/355189750)
- [PyOS - 一个Python写的OS（2）](https://zhuanlan.zhihu.com/p/355297680)

## 实现子函数

在之前实现的OS中，我们的任务存在一个问题，就是不能进行非阻塞子函数调用。为啥呢？看如下例子：

```python
def add(x, y):
    yield a + b
    
def main():
    y = yield add(2, 2)
    print(y)
    yield
    
def run():
    m      = main()       
    sub    = m.send(None)             
    result = sub.send(None)
    m.send(result)
    
run()
```

上面这段函数的调用过程如下图：

![Copyright (C) 2009, David Beazley, http://www.dabeaz.com](https://i.imgur.com/WBtCFuj.png)

问题出在我们的 Task 的结构，如果我们想要进行子函数调用，我们就需要一个 栈。

```python 

class Task(object):
    taskid = 0
    def __init__(self,target):
        Task.taskid += 1
        self.tid     = Task.taskid   # Task ID
        self.target  = target        # Target coroutine
        self.sendval = None          # Value to send
        self.stack   = []            # Call stack

    # 加入 栈 后我们需要更新 task 的运行
    # 之前我们只需要直接通过send 触发 协程，现在我们需要考虑函数栈的值
    def run(self):
        while True:
            try:
                # 执行到下一个 yield
                result = self.target.send(self.sendval)
                # 检查结果
                if isinstance(result, SystemCall): return result
                # 我们关心返回值为协程的调用，意味着发生了子函数调用
                if isinstance(result, types.GeneratorType):
                    # 我们需要把 主函数 进栈，把执行对象换成 子函数
                    self.stack.append(self.target)
                    self.sendval = None
                    self.target  = result
                else:
                    # 如果返回值不是协程，说明子函数已经返回了
                    if not self.stack: return
                    # 这时，我们把子函数的返回值发送给 主函数，并把当前执行对象换成主函数
                    self.sendval = result
                    self.target  = self.stack.pop()
            except StopIteration:
                if not self.stack: raise
                self.sendval = None
                self.target = self.stack.pop()
```

具体解释在注释里。

## 封装一些IO操作

有了子函数后，我们就可以对之前的一些 IO 操作进行封装，隐藏 具体的 yield 信息。

```python
# ------------------------------------------------------------
#                      === Library Functions ===
# ------------------------------------------------------------
def Accept(sock):
    yield ReadWait(sock)
    yield sock.accept()


def Send(sock,buffer):
    while buffer:
        yield WriteWait(sock)
        len = sock.send(buffer)
        buffer = buffer[len:]

def Recv(sock,maxbytes):
    yield ReadWait(sock)
    yield sock.recv(maxbytes)

```

比如上面就是三个Socket相关的函数，现在我们可以用这些系统库重写我们上一次的 Echo Server。

## 重写 Echo Server

这里我们不再需要直接OS call，而是使用一些封装的库函数：

```python 
from coroutine.os.pyos1 import *
from socket import *


def handle_client(client, addr):
    print('Connection from ', addr)
    while True:
        # OS call： read
        # 注意这里不再是OS call， 而是一个OS 的library call
        data = yield Recv(client,65536)
        print('Server receive ', data)
        if not data:
            # FD 已经关闭了
            break
        # Echo
        # 注意这里不再是OS call， 而是一个OS 的library call
        print('Server echo back', data)
        yield Send(client,data)

    client.close()
    print('Client closed.')


def server(port):
    # 这是一个支持并发的 echo server
    print('Server start..')
    sock = socket(AF_INET, SOCK_STREAM)
    sock.setsockopt(SOL_SOCKET,SO_REUSEADDR,1)
    sock.bind(("",port))
    sock.listen(1024)

    while True:
        yield ReadWait(sock)
        client, addr = sock.accept()
        yield NewTask(handle_client(client, addr))


sched = Scheduler()
sched.schedule(Task(server(45000)))
# 启动系统
sched.mainloop()
```


## 写在最后

这个系列就高于段落了，我们的PyOS停留在了0.3，其实还有很多东西可以考虑，比如：

- 任务之间的通讯
- 阻塞任务，比如数据库读取
- 任务和线程结合
- 异常处理

## 最后最后

其实，这个系列主要是想探索Python的协程并发编程，Python 3.5 以后引入了 `async/await` 关键字和一个相关的异步IO库 `asyncio`，这些内容都跟这个系列有些许的联系。

关于Python的并发，如果感兴趣还可以看：

- Stackless Python
- Greenlet
- Eventlet
- Cogen

