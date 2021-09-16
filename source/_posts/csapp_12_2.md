---
title: CSAPP 12 并发编程 2
date: 2021-06-20
tags: CSAPP
categories: Computing
mathjax: true
---

# CSAPP 12 并发编程 2

并发可以增加系统的吞吐量，充分利用多核性能，但是并发系统带来的复杂度也需要额外的注意，以免出现不容易debug的bug。

## 同步机制

并发执行的程序访问**栈外**共享内存，往往不是由一个CPU指令完成，而是一系列指令。这时，这一些列指令就形成了一个 critical section 。如果不对这些critical section进行处理，就会出现并发bug。

为了避免并发bug，Edsger Dijkstra 提出了 Semaphores ，即信号量来保护 critical section 的指令。Semaphore本质上是一个全局变量，类型为正整数，有两个对应的函数来操作Semaphore：P和V：
- `P(s)` 如果s不为0，P会将s减一，然后返回让线程继续执行；如果s为0，P会阻塞，当前线程挂起直到s为正，线程继续执行。
- `V(s)` 会将s加一，如果有其他进程等待s为正，V操作会unblock**一个**等待的线程，被释放的线程的P操作会立刻将s减一。

值得注意的是，P和V操作都是不可分的，即PV相关的CPU指令执行不会被中断。另外需要注意的是V操作不能确定哪一个等待的线程会被释放。

Posix定义了如下接口：

```c=
#include <semaphore.h>

int sem_init(sem_t *sem, 0, unsigned int value); 
int sem_wait(sem_t *s); /* P(s) */
int sem_post(sem_t *s); /* V(s) */
```

Semaphore 非常有用，常见的用法有 binary semaphore（BS） 和 counting semaphore （CS）。BS就是我们常说的互斥锁，而CS可以用来控制资源访问。

### 互斥锁

```c=
#include "csapp.h"

void *thread(void *vargp);

volatile long cnt = 0;
sem_t mutex;

int main(int argc, char **argv)
{
    int niters;
    pthread_t tid1, tid2;

    if (argc != 2) 
    {
        printf("usage: %s <niters>\n", argv[0]);
        exit(0);
    }
    niters = atoi(argv[1]);

    Sem_init(&mutex, 0, 1);
    Pthread_create(&tid1, NULL, thread, &niters);
    Pthread_create(&tid2, NULL, thread, &niters);
    Pthread_join(tid1, NULL);
    Pthread_join(tid2, NULL);

    if (cnt != 2 * niters)
        printf("BOOM! cnt=%ld\n", cnt);
    else
        printf("OK! cnt=%ld\n", cnt);
}

/* Thread routine */
void *thread(void *vargp) 
{
    int i, niters = *((int *)vargp);

/* $begin goodcntthread */
    for (i = 0; i < niters; i++) {
	P(&mutex);
	cnt++;
	V(&mutex);
    }
/* $end goodcntthread */
    return NULL;
}
/* $end goodcnt */
```

### 计数信号量

信号量是很多并发数据结构的基础，比如bounded buffer queue就是通过计数信号量实现的一种资源调度数据结构。

H文件

```c=
#ifndef __SBUF_H__
#define __SBUF_H__

#include "csapp.h"

typedef struct
{
    int *buf;
    int n;
    int front;   /* buf[(front+1)%n] is first item */
    int rear;    /* buf[rear%n] is last item */
    sem_t mutex; /* Protect access to buf */
    sem_t slots; /* Counts available slots */
    sem_t items; /* Counts available items */
} sbuf_t;

void sbuf_init(sbuf_t *sp, int n);
void sbuf_deinit(sbuf_t *sp);
void sbuf_insert(sbuf_t *sp, int item);
int subf_remove(sbuf_t *sp);

#endif
```

C文件

```c=
#include "csapp.h"
#include "sbuf.h"

void sbuf_init(sbuf_t *sp, int n)
{
    // Heap allocation dynamic
    sp->buf = Calloc(n, sizeof(int));
    sp->n = n;
    sp->front = sp->rear = 0;
    // Sem will make sure inc/dec or P/V is atomic action.
    Sem_init(&sp->mutex, 0, 1);
    Sem_init(&sp->items, 0, 0);
    Sem_init(&sp->slots, 0, n);
}

void sbuf_deinit(sbuf_t *sp)
{
    Free(sp->buf);
}

void sbuf_insert(sbuf_t *sp, int item)
{
    P(&sp->slots);  // wait for slot, if slots > 0, dec it. else wait
    P(&sp->mutex);  // lock buffer
    sp->buf[(++sp->rear) % (sp->n)] = item;
    V(&sp->mutex);  // release buffer
    V(&sp->items);  // inc item in the buffer
}

int sbuf_remove(sbuf_t *sp)
{
    int item;
    P(&sp->items);  // wait for item
    P(&sp->mutex);  // lock buffer
    item = sp->buf[(++sp->front) % (sp->n)];
    V(&sp->mutex);  // unlock the buffer
    V(&sp->slots);  // update slot
}
```

当然，利用Semaphore还可以实现其他的并发控制方式，比如 reader-writer 模式。下面的例子是一个有限reader的例子：

```c=
#include "csapp.h"

static readcnt = 0;
sem_t mutex, w;

void reader()
{
    while (1)
    {
        P(&mutex);
        readcnt++;
        if (readcnt == 1) 
            /* 只要有一个reader在等待，就尝试获得写入锁 
             * 这时，如果有正在进行的写入线程获得锁，read阻塞
             */
            P(&w);
        V(&mutex);

        /* Critical Section: read */ 

        P(&mutex);
        readcnt--;
        if (readcnt == 0)
            /* 只有没有reader在等待才会释放写入锁 */
            V(&w);
        V(&mutex);
    }
}

void writer()
{
    while(1)
    {
        P(&w);

        V(&w);
    }
}
```

Semaphore是并发控制的基本模块，不过一般我们也不会直接使用他们，而是使用高级一点的API，比如Mutex和Condition，或者go中的chan，不过他们基本都可以通过Semaphore实现。

## 并行

正确的并发程序运行在多核处理器机器上，Kernel会自动将不同的thread调度在不同的CPU核心，从而获得并行能力，提高计算效率。

## 多线程编程的一些问题

### 线程安全

一个函数，如果在多个线程并发调用的情况下仍然可以输出预期的结果，那么这个函数就是**线程安全**函数。我们也可以看看那些函数不是线程安全的：

- 类型1：函数内部修改全局变量
- 类型2：函数具有自己内部状态。比如伪随机数函数
- 类型3：函数返回一个全库变量的指针
- 类型4：函数调用其他非线程安全函数

类型1最简单的方法是给全局变量加锁，保证线程安全，但是锁这类同步操作也会影响函数运行性能。

类型2最简单的解决方案是把内部变量转换成函数输入参数，不过这样的函数需要函数的调用者负责传入正确的状态参数。

类型3有两种主要的处理方法。第一，重写函数让他接受一个存储结果的指针，这样就可以避免不同线程同时修改全局变量。第二，在不重写函数的情况下，可以做一个线程安全的wrapper函数，调用非安全函数的时候，加锁，并复制结果，然后作为wrapper的返回值。

类型4的处理类似类型3。

还有一类函数值得指出，就是Reentrant（可重入）函数，他是线程安全函数的子集。可重入函数内部没有私有状态，也没有同步操作（比如锁），所以他们的运行效率更高。但是这类函数可以接受指针作为输入，如果指针指向了一个共享内存，那么他们在多线程情况下可能会导致问题，但是函数本身却是线程安全的。

### Races

Race，竞争，是指程序的正确依赖于特定的线程执行顺序，而这种顺序并没有在程序编写阶段加以保证。

比如如下程序：

```c=
#include "csapp.h"
#define N 4

void *thread(void *vargp);

int main()
{
    pthread_t tid[N];
    int i;

    for (i = 0; i < N; i++)                       
        Pthread_create(&tid[i], NULL, thread, &i); 
    for (i = 0; i < N; i++)
        Pthread_join(tid[i], NULL);
    exit(0);
}

void *thread(void *vargp)
{
    int myid = *((int *)vargp);
    printf("Hello from thread %d\n", myid);
    return NULL;
}
```

主函数中，12行，启动线程时传入了局部变量i的指针，但是如果线程函数，20行，没有在12行执行后立刻执行，而是等待到了下一次12行执行，20行则会错误的接受其他线程的i值，造成竞争错误。

### Dead lock

Dead lock，死锁，是指在多线程执行情况下，两个或多个进程依赖同一个同步实体（比如信号量）才能继续执行，出现的互相等待导致锁死的现象。

死锁的检测和避免并不容易，但是有一个有用的规则可以避免大部分死锁：每一个对mutex，（s，t），每一个线程持有s和t，以相同的顺序加锁。

TODO: 

## 总结

并发编程的基本抽象其实是逻辑执行顺序，CPU在不同执行context下切换，具体实现方法包括：进程、IO复用和线程。

并发编程的基本同步工具是Semaphore，利用Semaphore可以构造其他并发控制结构，比如bufferd queue、互斥锁等等。