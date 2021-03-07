---
title: 编程101 PyOS 一个Python写的OS 2
date: 2021-03-06
tags: [Python, Concurrent, Operating System]
categories: Coding
---

# PyOS - 一个Python写的OS（2）

[上文](https://zhuanlan.zhihu.com/p/355189750)我们的PyOS已经可以处理多任务了，而且加入了第一个 OS call：`GetTid` 来获取任务ID。今天，我们继续开发我们的OS，增加更多的 OS call。

## 更多 OS call

我们需要增加两个基本的系统函数：`NewTask` 和 `KillTask` 让操作系统进行基本的任务管理。

```python=
class SystemCall(object):
    task: Task
    sched: Scheduler
    
    def handle(self):
        ...

# Create a new task
class NewTask(SystemCall):
    def __init__(self,target):
        self.target = target

    def handle(self):
        tid = self.sched.new(self.target)
        self.task.sendval = tid
        self.sched.schedule(self.task)


# Kill a task
class KillTask(SystemCall):
    def __init__(self,tid):
        self.tid = tid

    def handle(self):
        task = self.sched.taskmap.get(self.tid,None)
        if task:
            task.target.close()
            self.task.sendval = True
        else:
            self.task.sendval = False
        self.sched.schedule(self.task)
```

这样，我们就有了基本的任务管理功能，尝试下面的程序：

```python=
if __name__ == '__main__':
    def foo():
        pid = yield GetTid()
        for i in range(10):
            print("I'm foo", pid)
            yield

    def main():
        child = yield NewTask(foo())
        for i in range(5):
            yield

        yield KillTask(child)
        print('Main task done.')

    sched = Scheduler()
    sched.new(main())
    sched.mainloop()
# 输出：
'''
I'm foo 2
I'm foo 2
I'm foo 2
I'm foo 2
I'm foo 2
Task 2 terminated
Main task done.
Task 1 terminated
'''
```

可以看到，我们在主进程里面启动了一个子任务，并且实现了并发和任务结束。

## 实现 WaitTask

WaitTask 这个功能相对复杂一点，我们想实现一个费阻塞的等待功能。这个需要修改一下我们的 调度器。实现原理不复杂，当一个任务A请求等待另一个任务B退出后再继续执行的时候，调度器首先检查B任务是否存在，如果B不存在，立即返回。如果B存在，我们把A放入B的等待退出队列中，然后交出执行权。然后，在调度器的 `exit` 函数中增加一个检查，当一个任务结束时会将等待它退出的任务重新放入执行队列。完整程序如下：

```python=
# ------------------------------------------------------------
#                      === Scheduler ===
# ------------------------------------------------------------
from queue import Queue


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


class Scheduler(object):
    def __init__(self):
        # ready 就是 任务 队列
        self.ready   = Queue()
        # taskmap 是一个字典，用来记录任务ID 和 任务实例
        self.taskmap = {}
        # 用来记录等待退出的任务
        self.exit_waiting = {}

    def new(self, target):
        # 向系统增加新的任务，并返回生成的任务ID
        newtask = Task(target)
        self.taskmap[newtask.tid] = newtask
        self.schedule(newtask)
        return newtask.tid

    def exit(self, task):
        print('Task %d terminated' % task.tid)
        del self.taskmap[task.tid]
        # 通知其他等待退出的任务，这个任务结束了，可以恢复执行了
        for task in self.exit_waiting.pop(task.tid,[]):
            self.schedule(task)

    def waitforexit(self, task, waittid):
        if waittid in self.taskmap:
            self.exit_waiting.setdefault(waittid, []).append(task)
            return True
        else:
            return False

    def schedule(self, task):
        # 将任务放入执行队列等待执行
        self.ready.put(task)

    def mainloop(self):
        while self.taskmap:
            # 系统的主循环，不断轮训任务队列，并执行直到任务的下一个yield（ trap ）
            task = self.ready.get()
            try:
                result = task.run()
                if isinstance(result, SystemCall):
                    # task 和 sched 都是调用OS call 的任务的信息
                    result.task  = task
                    result.sched = self
                    result.handle()
                    continue

            except StopIteration:
                self.exit(task)
                continue

            self.schedule(task)


# ------------------------------------------------------------
#                   === System Calls ===
# ------------------------------------------------------------
class SystemCall(object):
    task: Task
    sched: Scheduler

    def handle(self):
        pass


# Return a task's ID number
class GetTid(SystemCall):
    def handle(self):
        self.task.sendval = self.task.tid
        self.sched.schedule(self.task)


# Create a new task
class NewTask(SystemCall):
    def __init__(self,target):
        self.target = target

    def handle(self):
        tid = self.sched.new(self.target)
        self.task.sendval = tid
        self.sched.schedule(self.task)


# Kill a task
class KillTask(SystemCall):
    def __init__(self,tid):
        self.tid = tid

    def handle(self):
        task = self.sched.taskmap.get(self.tid,None)
        if task:
            task.target.close()
            self.task.sendval = True
        else:
            self.task.sendval = False
        self.sched.schedule(self.task)


# Wait for a task to exit
class WaitTask(SystemCall):
    def __init__(self, tid):
        self.tid = tid

    def handle(self):
        result = self.sched.waitforexit(self.task, self.tid)
        self.task.sendval = result
        # If waiting for a non-existent task,
        # return immediately without waiting
        if not result:
            self.sched.schedule(self.task)


if __name__ == '__main__':
    def foo():
        pid = yield GetTid()
        for i in range(10):
            print("I'm foo", pid)
            yield

    def main():
        child = yield NewTask(foo())
        print('Waiting for child task exit')
        yield WaitTask(child)
        print('Child task terminated.')

    sched = Scheduler()
    sched.new(main())
    sched.mainloop()
    
# 输出：
'''
Waiting for child task exit
I'm foo 2
I'm foo 2
I'm foo 2
I'm foo 2
I'm foo 2
I'm foo 2
I'm foo 2
I'm foo 2
I'm foo 2
I'm foo 2
Task 2 terminated
Child task terminated.
Task 1 terminated
'''
```

目前我们的OS可以：
- 并发运行多任务
- 启动、终结任务
- 基本的任务管理，比如等待

## 实现 非阻塞IO

由于我们的PyOS运行在真正的OS上，OS的IO操作会挂起整个Python解释器，我们需要实现一个费阻塞IO的功能。为了实现这个功能，需要用到Python的 `select` 模块。完整代码如下，注释会解释新增的部分。

```python=
# ------------------------------------------------------------
#                      === Scheduler ===
# ------------------------------------------------------------
from queue import Queue
import select


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


class Scheduler(object):
    def __init__(self):
        # ready 就是 任务 队列
        self.ready   = Queue()
        # taskmap 是一个字典，用来记录任务ID 和 任务实例
        self.taskmap = {}
        # 用来记录等待退出的任务
        self.exit_waiting = {}
        # IO 队列
        self.read_waiting = {}
        self.write_waiting = {}

    def new(self, target):
        # 向系统增加新的任务，并返回生成的任务ID
        newtask = Task(target)
        self.taskmap[newtask.tid] = newtask
        self.schedule(newtask)
        return newtask.tid

    def exit(self, task):
        print('Task %d terminated' % task.tid)
        del self.taskmap[task.tid]
        # 通知其他等待退出的任务，这个任务结束了，可以恢复执行了
        for task in self.exit_waiting.pop(task.tid,[]):
            self.schedule(task)

    def waitforexit(self, task, waittid):
        if waittid in self.taskmap:
            self.exit_waiting.setdefault(waittid, []).append(task)
            return True
        else:
            return False

    # IO 功能
    def waitforread(self,task,fd):
        self.read_waiting[fd] = task

    def waitforwrite(self,task,fd):
        self.write_waiting[fd] = task

    def iopoll(self, timeout):
        # io poll 返回当前可用的文件标识符，然后把等待它的任务，重新放入执行队列，等待执行
        if self.read_waiting or self.write_waiting:
            r, w, e = select.select(self.read_waiting,
                                    self.write_waiting,[],timeout)
            for fd in r:
                self.schedule(self.read_waiting.pop(fd))
            for fd in w:
                self.schedule(self.write_waiting.pop(fd))

    def iotask(self):
        # IO 任务队列循环
        while True:
            if self.ready.empty():
                self.iopoll(None)
            else:
                self.iopoll(0)
            yield

    def schedule(self, task):
        # 将任务放入执行队列等待执行
        self.ready.put(task)

    def mainloop(self):
        # 这里加入一个 IO 自己的 任务循环
        self.new(self.iotask())
        while self.taskmap:
            # 系统的主循环，不断轮训任务队列，并执行直到任务的下一个yield（ trap ）
            task = self.ready.get()
            try:
                result = task.run()
                if isinstance(result, SystemCall):
                    # task 和 sched 都是调用OS call 的任务的信息
                    result.task  = task
                    result.sched = self
                    result.handle()
                    continue

            except StopIteration:
                self.exit(task)
                continue

            self.schedule(task)


# ------------------------------------------------------------
#                   === System Calls ===
# ------------------------------------------------------------
class SystemCall(object):
    task: Task
    sched: Scheduler

    def handle(self):
        pass


# Return a task's ID number
class GetTid(SystemCall):
    def handle(self):
        self.task.sendval = self.task.tid
        self.sched.schedule(self.task)


# Create a new task
class NewTask(SystemCall):
    def __init__(self,target):
        self.target = target

    def handle(self):
        tid = self.sched.new(self.target)
        self.task.sendval = tid
        self.sched.schedule(self.task)


# Kill a task
class KillTask(SystemCall):
    def __init__(self,tid):
        self.tid = tid

    def handle(self):
        task = self.sched.taskmap.get(self.tid,None)
        if task:
            task.target.close()
            self.task.sendval = True
        else:
            self.task.sendval = False
        self.sched.schedule(self.task)


# Wait for a task to exit
class WaitTask(SystemCall):
    def __init__(self, tid):
        self.tid = tid

    def handle(self):
        result = self.sched.waitforexit(self.task, self.tid)
        self.task.sendval = result
        # If waiting for a non-existent task,
        # return immediately without waiting
        if not result:
            self.sched.schedule(self.task)


# Wait for reading
class ReadWait(SystemCall):
    def __init__(self,f):
        # 这里的 f 就是 fd
        self.f = f

    def handle(self):
        fd = self.f.fileno()
        self.sched.waitforread(self.task,fd)


# Wait for writing
class WriteWait(SystemCall):
    def __init__(self,f):
        # 这里的 f 就是 fd
        self.f = f

    def handle(self):
        fd = self.f.fileno()
        self.sched.waitforwrite(self.task,fd)
```


## 我们的第一个应用程序！

现在我们的PyOS已经可以支持IO了，让我们来写第一个应用程序：Echo Server！这是一个支持并发的server！

```python=
from socket import *


def handle_client(client, addr):
    print('Connection from ', addr)
    while True:
        # OS call： read
        yield ReadWait(client)
        data = client.recv(65536)
        print('Server receive ', data)
        if not data:
            # FD 已经关闭了
            break

        # Echo
        yield WriteWait(client)
        print('Server echo back', data)
        client.send(data)

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

运行上述程序后，会看到 `Server start..`。这是后你可以打开 terminal，输入：`telnet localhost 45000` 来建立连接。然后你就可以看到 server echo 你输入的信息了。是不是很有成就感！！

## 后续

目前PyOS还有一个比较致命的问题：任务不能 yield 到另一个任务，只能把执行权交还给操作系统，而不能交给其他任务。。下一篇我们看如何解决这个问题。
