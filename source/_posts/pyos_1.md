---
title: 编程101 PyOS 一个Python写的OS
date: 2021-03-06
tags: [Python, Concurrent, Operating System]
categories: Coding
---

# PyOS - 一个Python写的OS（1）

> 引用自David Beazley的视频PPT

PyOS 这个系列，我们进一步利用协程的特性，一步一步的构建一个多任务操作系统。系列的最后，我们会在我们自己写的PyOS上实现一个 Web Client/Server。

当然，这不是真正的操作系统，而是一个操作系统上的操作系统。。哈哈。完成这个系列可以对并发编程、协程、操作系统多任务管理、IO有更深刻的认识。当然，你还会收货成就感。

对协程不太了解的同学请看：https://zhuanlan.zhihu.com/p/354982602

## 操作系统

需要指出的是，当CPU（假设只有一个核心）运行你的代码时，OS自己的代码就不可能被执行。那么，操作系统是如何拿回控制权的呢？通常，操作系统有两种方式拿回CPU的控制权：Interrupt和Traps。Interrupt通常是IO或者计时器发出的，而Trap是其他软件生成的给CPU的信号。当CPU收到这两种信号后，会挺会手上的活，移交执行权给OS代码。当应用程序调用OS提供的底层函数时，通常会产生Trap，从而把执行权交还OS。

所以，某种程度上说，OS的一个重要的组成部分就是多任务切换和管理，充分利用有限的CPU资源。

![OS多任务](https://i.imgur.com/pYNOZgW.png)

## 用 协程 构建OS

如果你还记得上一次我们讲到的`yield`关键字，你会发现他就是一个Trap，一个协程会在 yield的时候交出执行权！利用这点，我们就可以用 协程 构建一个多任务操作系统！不需要线程、进程。

首先，既然是多任务系统，我们首先要抽象一个Task对象出来，代表任务。

```python=
class Task(object):
    taskid = 0

    def __init__(self,target):
        # class variable
        Task.taskid += 1

        # object
        self.tid     = Task.taskid   # Task ID
        self.target  = target        # Target coroutine
        self.sendval = None          # Value to send

    # Run a task until it hits the next yield statement
    def run(self):
        return self.target.send(self.sendval)

# A simple generator/coroutine function
def foo():
    print ( "Part 1" )
    yield
    print ( "Part 2" )
    yield

t1 = Task(foo())
print ( "Running foo()" )
t1.run()
print ( "Resuming foo()" )
t1.run()
```

上面的例子中，`foo` 是一个 协程，然后被放入Task中，foo 会在 yield 的地方把执行权交还系统。接下来，我们需要实现一个 调度器，对任务进行管理。

```python=
class Task(object):
    taskid = 0

    def __init__(self,target):
        # class variable
        Task.taskid += 1

        # object
        self.tid     = Task.taskid   # Task ID
        self.target  = target        # Target coroutine
        self.sendval = None          # Value to send

    # Run a task until it hits the next yield statement
    def run(self):
        return self.target.send(self.sendval)

# ------------------------------------------------------------
#                      === Scheduler ===
# ------------------------------------------------------------
from queue import Queue


class Scheduler(object):
    def __init__(self):
        # ready 就是 任务 队列
        self.ready   = Queue()
        # taskmap 是一个字典，用来记录任务ID 和 任务实例
        self.taskmap = {}

    def new(self, target):
        # 向系统增加新的任务，并返回生成的任务ID
        newtask = Task(target)
        self.taskmap[newtask.tid] = newtask
        self.schedule(newtask)
        return newtask.tid

    def schedule(self, task):
        # 将任务放入执行队列等待执行
        self.ready.put(task)

    def mainloop(self):
        while self.taskmap:
           # 系统的主循环，不断轮训任务队列，并执行直到任务的下一个yield（ trap ）
            task = self.ready.get()
            result = task.run()
            self.schedule(task)


if __name__ == '__main__':

    # Two tasks
    def foo():
        while True:
            print ( "I'm foo" )
            yield


    def bar():
        while True:
            print ( "I'm bar" )
            yield
            
    # Run them
    sched = Scheduler()
    sched.new(foo())
    sched.new(bar())
    sched.mainloop()
```

上面的例子中，foo bar程序会在调度器的控制下交替执行，直到永远。。对应的代码即见注释。简单来说，就是系统会不断轮训任务队列，并执行任务，直到任务的下一个 yield，系统进入新的循环。

现在有一个问题，就是我们的 任务其实是协程，Python的协程在执行接触后，会抛出`StopIteration` 异常，我们的系统主循环就会crash。所以，我们需要一个优雅的结束任务的方式。

```python=
class Scheduler(object):
    def __init__(self):
        # ready 就是 任务 队列
        self.ready   = Queue()
        # taskmap 是一个字典，用来记录任务ID 和 任务实例
        self.taskmap = {}

    def new(self, target):
        # 向系统增加新的任务，并返回生成的任务ID
        newtask = Task(target)
        self.taskmap[newtask.tid] = newtask
        self.schedule(newtask)
        return newtask.tid

    def exit(self, task):
        # 优雅的结束任务！
        print('Task %d terminated' % task.taskid)
        del self.taskmap[task.taskid]

    def schedule(self, task):
        # 将任务放入执行队列等待执行
        self.ready.put(task)

    def mainloop(self):
        while self.taskmap:
            # 系统的主循环，不断轮训任务队列，并执行直到任务的下一个yield（ trap ）
            task = self.ready.get()
            try:
                result = task.run()
            except StopIteration:
                self.exit(task)
                continue

            self.schedule(task)


if __name__ == '__main__':
    def foo():
        for i in range(10):
            print("I'm foo")
            yield

    def bar():
        for i in range(5):
            print("I'm bar")
            yield

    sched = Scheduler()
    sched.new(foo())
    sched.new(bar())
    sched.mainloop()
```

## OS call

是不是很有成就感？我们的多任务OS已经基本可以运行了！其实，这里的 Scheduler 就是我们的OS，而Task就是跑在系统中的一个个进程。现在，我们给我们的OS提供一些基本的 System Call。因为在现实的OS中，应用程序需要 system call 来操作系统资源。为了请求系统资源，任务会用到带值的 yield 。

```python=
class SystemCall(object):
    def handle(self):
        pass
```

首先，我们 写一个 system call 的基类作为其他 OS call 的接口。然后，我们需要修改OS 的循环来处理 OS call。

```python=
# 注意这里仅给出了 mainloop 部分。
    def mainloop(self):
        while self.taskmap:
            # 系统的主循环，不断轮训任务队列，并执行直到任务的下一个yield（ trap ）
            task = self.ready.get()
            try:
                result = task.run()
                if isinstance(result, SystemCall):
                    result.task  = task
                    result.sched = self
                    result.handle()
                    continue
                    
            except StopIteration:
                self.exit(task)
                continue

            self.schedule(task)
```

ok，框架搭好了，我们来实现第一个 OS call： GetTid，向系统请求任务ID。

```python=
# Return a task's ID number
class GetTid(SystemCall):
    def handle(self):
        self.task.sendval = self.task.tid
        self.sched.schedule(self.task)
        
if __name__ == '__main__':

    def foo():
        mytid = yield GetTid()
        for i in xrange(5):
            print "I'm foo", mytid
            yield

    def bar():
        mytid = yield GetTid()
        for i in xrange(10):
            print "I'm bar", mytid
            yield

    sched = Scheduler()
    sched.new(foo())
    sched.new(bar())
    sched.mainloop()
# 输出：
'''
I'm foo 1
I'm bar 2
I'm foo 1
I'm bar 2
I'm foo 1
I'm bar 2
I'm foo 1
I'm bar 2
I'm foo 1
I'm bar 2
I'm foo 1
Task 2 terminated
I'm foo 1
I'm foo 1
I'm foo 1
I'm foo 1
Task 1 terminated
'''
```

恭喜你！PyOS 0.1 已经实现了！

接下来我们会增加更多的 OS call，然后我们会进入 I/O 相关的任务，最后，我们会在PyOS上跑一个web server。