---
title: 重新认识 Python（3）GIL
date: 2021-02-18
tags: [Python, CPython]
categories: Coding
---

# 重新认识Python（3）：GIL，Global Interpreter Lock

之前的两个文章主要简述了Python的内存管理模型和对应的GC模型。今天我们来看看Python的另一个“著名”特征：GIL，全局解释器锁。GIL长久以来被各种内行、外行诟病，可是很多人并不清楚GIL究竟是什么？为什么当初要设计GIL？GIL的优势在哪里？

## Python 是如何工作的？

要理解 GIL 需要知道一些Python解释器的运行原理。Python的解释器其实一个循环，循环里是一系列的cases，逐行读取编译后的Opcode进行计算，每一个线程都有独立的这么一个循环。这里插一嘴，其实Python不是解释型语言，起码不是纯粹的解释型，Python源代码会被编译成Python自己的byte code，就是上面循环中的那些opcode。

```c=
for (;;) {
    assert(stack_pointer >= f->f_valuestack); /* else underflow */
    assert(STACK_LEVEL() <= co->co_stacksize);  /* else overflow */
    assert(!PyErr_Occurred());
    // 这部分省略的代码就是后面GIL的关键。。我们先来看看解释器的循环
    // ....
    /* Extract opcode and argument */

        NEXTOPARG();
    dispatch_opcode:
      switch (opcode) {

        /* BEWARE!
           It is essential that any operation that fails sets either
           x to NULL, err to nonzero, or why to anything but WHY_NOT,
           and that no operation that succeeds does this! */

        TARGET(NOP)
            FAST_DISPATCH();

        TARGET(LOAD_FAST) {
            PyObject *value = GETLOCAL(oparg);
            if (value == NULL) {
                format_exc_check_arg(PyExc_UnboundLocalError,
                                     UNBOUNDLOCAL_ERROR_MSG,
                                     PyTuple_GetItem(co->co_varnames, oparg));
                goto error;
            }
            Py_INCREF(value);
            PUSH(value);
            FAST_DISPATCH();
        }

        PREDICTED(LOAD_CONST);
        TARGET(LOAD_CONST) {
            PyObject *value = GETITEM(consts, oparg);
            Py_INCREF(value);
            PUSH(value);
            FAST_DISPATCH();
        }
        ...
```

主要参考的[源代码](https://github.com/python/cpython/blob/ef5f4ba96e05f61ad3baca502012085f31e99342/Python/ceval.c#L930-L1064)在这里。

当然，为了支持计算Python的runtime还会准备对应的Frame、全局变量等等。

## GIL 是什么？

上面我们提到，每一个线程都有自己独立的执行循环，但是这些执行循环并不是相互独立的，他们必然会共享一些内存，这里起就是经典的并发问题，比如race condition等等。并发模型的实现由很多方法，我们听到最多、看起来也最简单的方法就是基于锁的方法。Python其实就选择这个方法，GIL也就诞生了。

GIL就是一个锁，每一个线程的执行循环，只有拿到GIL，才可以执行，否则就要等待，而一个Python进程只有一个GIL锁，所以它才叫全局锁。GIL可以保证，在同一时间，只有一个线程可以拿到这个锁。

这里我参考了一个小哥的代码，他简单的实现了Python版本的GIL，方便我们理解GIL。

```python=
import threading
from types import SimpleNamespace

DEFAULT_INTERVAL = 0.05

gil_mutex = threading.RLock()
gil_condition = threading.Condition(lock=gil_mutex)
switch_condition = threading.Condition()

# dictionary-like object that supports dot (attribute) syntax
gil = SimpleNamespace(
    drop_request=False,
    locked=True,
    switch_number=0,
    last_holder=None,
    eval_breaker=True
)

def drop_gil(thread_id):
    if not gil.locked:
        raise Exception("GIL is not locked")

    gil_mutex.acquire()

    gil.last_holder = thread_id
    gil.locked = False

    # Signals that the GIL is now available for acquiring to the first awaiting thread
    gil_condition.notify()

    gil_mutex.release()

    # force switching
    # Lock current thread so it will not immediately reacquire the GIL
    # this ensures that another GIL-awaiting thread have a chance to get scheduled

    if gil.drop_request:
        switch_condition.acquire()
        if gil.last_holder == thread_id:
            gil.drop_request = False
            switch_condition.wait()

        switch_condition.release()


def take_gil(thread_id):
    gil_mutex.acquire()

    while gil.locked:
        saved_switchnum = gil.switch_number

        # Release the lock and wait for a signal from a GIL holding thread,
        # set drop_request=True if the wait is timed out

        timed_out = not gil_condition.wait(timeout=DEFAULT_INTERVAL)

        if timed_out and gil.locked and gil.switch_number == saved_switchnum:
            gil.drop_request = True

    # lock for force switching
    switch_condition.acquire()

    # Now we hold the GIL
    gil.locked = True

    if gil.last_holder != thread_id:
        gil.last_holder = thread_id
        gil.switch_number += 1

    # force switching, send signal to drop_gil
    switch_condition.notify()
    switch_condition.release()

    if gil.drop_request:
        gil.drop_request = False

    gil_mutex.release()


def execution_loop(target_function, thread_id):
    # Compile Python function down to bytecode and execute it in the while loop

    bytecode = compile(target_function)

    while True:

        # drop_request indicates that one or more threads are awaiting for the GIL
        if gil.drop_request:
            # release the gil from the current thread
            drop_gil(thread_id)

            # immediately request the GIL for the current thread
            # at this point the thread will be waiting for GIL and suspended until the function return
            take_gil(thread_id)

        # bytecode execution logic, executes one instruction at a time
        instruction = bytecode.next_instruction()
        if instruction is not None:
            execute_opcode(instruction)
        else:
            return
```

看代码我们可以知道：

- Python创建一个新的thread的时候，会首先call `take_gil` 尝试得到 GIL，然后才进入执行循环
- 通过在循环的开始部分检查gil状态，可以确保只有一个线程在执行

目前这个版本的GIL其实也实现一些scheduler的功能，比如：

`gil.drop_request` 为True就表明有其他的线程在等待执行，当前进程就会首先尝试放弃gil，给其他线程机会，然后他会立刻尝试夺回gil，以便自己可以继续运行。聪明的你可能想问，马上尝试夺回，那别的进程怎么办啊？

仔细看 `drop_gil` 函数:

```python=
    if gil.drop_request:
        switch_condition.acquire()
        if gil.last_holder == thread_id:
            gil.drop_request = False
            switch_condition.wait()

        switch_condition.release()
```

这段代码确保如果，OS分配的下一个线程还是自己，该线程就会被迫等待，确保其他进程有机会被系统的线程调度器分配。

CPython的源码在[这里](https://github.com/python/cpython/blob/master/Python/ceval_gil.h)

## 关于GIL的思考

GIL从1992年诞生到现在，其实经历一些变化。在GIL被设计的年代，多核CPU基本不存在，当时的线程也主要是用来做IO类型的工作，所以GIL的设计处理多线程IO效率非常高。

GIL的存在也让Python的单核性能大大增加，其实GIL是Python成功的一个重要原因。后来GIL加入了 `switch_condition`, `switch_number`, `timeout` 等参数，很大程度改善了多核处理下GIL线程schedule的问题。Python3以后的GIL仍然无法实现真正的CPU密集并行的多线程。不过这里说的线程都是OS线程，这不妨碍实现软件线程。

GIL难以被完全移除有很多原因，比如

- 移除GIL，就需要修改Python的GC机制，特别是reference counting
- GIL移除，会降低单核性能。因为移除全局锁，必然要引入粒度更小的锁
- 可以考虑其他的同步机制，比如Software transactional memory，那么就要修改整个C API，基本上所有的C-API库都废了。。。。


## 参考

- https://www.youtube.com/watch?v=7RlqbHCCVyc
- https://www.youtube.com/watch?v=4zeHStBowEk
- https://github.com/python/cpython/blob/master/Python/ceval_gil.h