---
title: CSAPP 12 并发编程 1
date: 2021-06-15
tags: CSAPP
categories: Computing
mathjax: true
---

# CSAPP 12 并发编程 (1)

一般来说，应用级别的并发主要由三种方式实现：
- 进程
- I/O多路复用
- 线程

## 进程

进程是构建并发程序最简单和直接的方式，主要是通过fork, exec, waitpid等系统函数联合实现，而进程间是通过socket两端的文件标识符进行通讯。

以经典的服务器-客户端模式为例，首先服务器端启动主进程（p1），unix系统默认会开放三个文件标识符，即fd0，fd1，fd2，分别对应标准输入、输出、和异常。为了接受其他进程的连接，p1开放一个新的socket标识符，listenfd。由于文件标识符通常是按照顺序取最小的一个可用数字，因此一般系统会分配标识符3给listenfd，但是这个并不重要，我们只需要知道listenfd即可。

在客户端进程中，通过socket连接服务端端口，获得一个客户端的文件标识符，clientfd，这个socket的另一端的是服务器端的一个新的、由accept返回的标识符，connfd，需要注意的是connfd与listenfd是不同的标识符。在服务端，主进程会通过fork得到一个新的子进程来负责与client通讯，而connfd本来是属于主进程，在fork的过程中被子进程获得，而主进程则关闭其对应的connfd，子进程关闭无用的listenfd（从主进程拷贝获得）。至此，客户端与服务端的连接由子进程完成，而主进程已经准备好下一个连接，如下图所示：

![](https://i.imgur.com/RwdRovf.png)

![](https://i.imgur.com/GXjP3yy.png)

![](https://i.imgur.com/OHpPbxU.png)

需要注意的是，子进程结束后会变成僵尸进程，需要由主进程进行清理（reap），否则就会造成内存泄漏。回收工作是通过SIGCHLD信号量的处理函数完成的：

```c=
void sigchld_handler(int sig)
{
    while (waitpid(-1, 0, WNOHANG) > 0)
        // 清理所有目前看到的僵尸进程
        ;
    return;
}
```

进程并发的优势很明显，即主进程和子进程不共享虚拟内存地址空间，可以有效的避免意外的内存问题。但是，另一方面，进程间共享数据变得困难，需要额外的跨进程通讯机制，这个过程开销较大。

## IO复用

IO复用是进行并发的另一种方法，基本原理是通过select函数实现。select函数会阻塞程序，直到它监控的一系列标识符中的一个或者多个处于可用状态。

`int select(int n, fd_set *fdset, NULL, NULL, NULL);`

其中`fd_set`就是监控的文件标识符集合，Unix还提供了四个宏对集合进行控制：
- FD_ZERO，初始化flag为0
- FD_CLR，清空某一个标识符
- FD_SET，激活某一个标识符
- FD_ISSET，查看某一个标识符是否激活

我们可以通过select在同一个进程中实现一个并发echo服务器。

```c=
#include "csapp.h"

/* define a pool of connected descriptors */
typedef struct {
    int maxfd;  // largest fd in set
    fd_set read_set;  // all active descriptors
    fd_set ready_set;  // subset of descriptors that ready to be read
    int nready;  // number of ready descriptors from select
    int maxi;    // highwater index into client array
    int clientfd[FD_SETSIZE];     // set of active descriptors, default 1024
    rio_t clientrio[FD_SETSIZE];  // set of active read buffers
} pool;

void init_pool(int listenfd, pool *p);
void add_client(int connfd, pool *p);
void check_clients(pool *p);

int byte_cnt = 0;  // counts total bytes received by server

int main(int argc, char **argv)
{
    int listenfd, connfd;
    socklen_t clientlen;
    struct sockaddr_storage clientaddr;
    static pool pool;  // private variable

    if (argc != 2) {
        fprintf(stderr, "usage: %s <port>\n", argv[0]);
        exit(0);
    }

    listenfd = Open_listenfd(argv[1]);
    init_pool(listenfd, &pool);

    // server loop
    while (1)
    {
        // why get ready set and read_set
        // here is a re-initialization copy
        pool.ready_set = pool.read_set;
        pool.nready = Select(pool.maxfd+1, &pool.ready_set, NULL, NULL, NULL);

        if (FD_ISSET(listenfd, &pool.ready_set)) 
        {
            clientlen = sizeof(struct sockaddr_storage);
            connfd = Accept(listenfd, (SA *)&clientaddr, &clientlen);
            add_client(connfd, &pool);  // add client into pool to be handled
        }

        check_clients(&pool);
    }
}


void init_pool(int listenfd, pool *p)
{
    int i;
    // initialized to -1 
    p->maxi = -1;
    for (i=0; i<FD_SETSIZE; i++)
        p->clientfd[i] = -1;

    // initially, listenfd is the only fd of select read set
    p->maxfd = listenfd;
    FD_ZERO(&p->read_set);
    FD_SET(listenfd, &p->read_set);
}

void add_client(int connfd, pool *p)
{
    int i;
    p->nready--; // ? we didn't initialize this ...
    for (i = 0; i < FD_SETSIZE; i++)
    {
        if (p->clientfd[i] < 0)
        {
            // assign fd and its buffer
            p->clientfd[i] = connfd;
            Rio_readinitb(&p->clientrio[i], connfd);

            // Turn on fd
            FD_SET(connfd, &p->read_set);

            // update pool status
            if (connfd > p->maxfd)
                p->maxfd = connfd;
            if (i > p->maxi)
                p->maxi = i;
            break;  // find an available slot
        }
    } 

    if (i == FD_SETSIZE)
        app_error("add_client error: Too many clients. Run out of descriptor");
}


void check_clients(pool *p)
{
    int i, connfd, n;
    char buf[MAXLINE];
    rio_t rio;

    for (i=0; (i <= p->maxi) && (p->nready > 0); i++) {
        connfd = p->clientfd[i];
        rio = p->clientrio[i];

        if ((connfd > 0) && (FD_ISSET(connfd, &p->ready_set))) {
            p->nready--;
            if ((n=Rio_readlineb(&rio, buf, MAXLINE)) != 0) {
                byte_cnt += n;
                printf("Server received %d (%d total) bytes on fd %d\n",
                       n, byte_cnt, connfd);
                Rio_writen(connfd, buf, n);  // echo back the received info..
            }
            else
            {
                // EOF detected, remove fd from pool
                Close(connfd);
                FD_CLR(connfd, &p->read_set);
                p->clientfd[i] = -1; // do we need clear related io buffer?
            }
        }
    }

    // report pool
    printf("Pool:\n    maxfd: %d\n    nready: %d\n    maxi: %d\n",
           p->maxfd, p->nready, p->maxi);
}
```

IO复用可以用作事件驱动编程模式，更好的控制不同的逻辑控制流，同时没有切换进程的开销。缺点也比较明显，首先，代码量更大，其次没有任何并行，即使CPU有多核，颇有一些Python AsyncIO 的感觉。。。

## 线程

线程（Thread）的执行模式跟进程很像，每一个进程启动的时候，都会启动一个线程，即主线程。主线程可以设置其他线程，他们可以并发执行。线程与IO复用不同之处在于，线程的调度是Kernel自动完成的，不需要用户程序进行干预；线程与进程也不同，主线程和其他线程没有从属关系，这些线程也共享虚拟内存地址空间，包括code, data, heap, shared library以及文件！这让共享信息变得简单和高效。

一个简单的线程例子：

```c=
#include "csapp.h"

void *thread(void *vargp);

int main()
{
    pthread_t tid;
    Pthread_create(&tid, NULL, thread, NULL);
    Pthread_join(tid, NULL);
    exit(0);
}


void *thread(void *vargp)
{
    printf("Hello thread!\n");
    return NULL;
}
```

当然，现在我们可以尝试采用线程实现并发的echo服务器了。

```c=
#include "csapp.h"

void echo(int connfd);
void *thread(void *vargp);

int main(int argc, char **argv)
{
    int listenfd, *connfdp;  // note: a pointer here..
    socklen_t clientlen;
    struct sockaddr_storage clientaddr;
    pthread_t tid;

    if (argc != 2){
        fprintf(stderr, "usage: %s <port>\n", argv[0]);
        exit(0);
    }

    listenfd = Open_listenfd(argv[1]);

    while (1) {
        clientlen = sizeof(struct sockaddr_storage);
        connfdp = Malloc(sizeof(int));
        *connfdp = Accept(listenfd, (SA *)&clientaddr, &clientlen);
        Pthread_create(&tid, NULL, thread, connfdp);
        // why just use connfd and &connfd?
    }
}

void *thread(void *vargp)
{
    int connfd = *((int *)vargp);
    Pthread_detach(pthread_self()); // let kernel to reap this thread
    Free(vargp); // free memory
    echo(connfd);
    Close(connfd);
    return NULL;
}


void echo(int connfd) 
{
    int n; 
    char buf[MAXLINE]; 
    rio_t rio;

    Rio_readinitb(&rio, connfd);
    while((n = Rio_readlineb(&rio, buf, MAXLINE)) != 0) {
	printf("server received %d bytes\n", n);
	Rio_writen(connfd, buf, n);
    }
}
```

这段程序有一些很有意思的地方：

首先22-23行，我们使用了一个指针，而不是直接传递fd数值。这是为了避免race condition造成的bug。因为在多线程执行过程中，我们不确定22行和31行那个先执行，如果在第一个连接以后，对应的31行还没执行之前，另一个连接发生了，就会导致连个线程操作同一个fd。因此，我们通过指针和动态内存分配避免这个问题。

另一个值得注意的地方是，在thread的执行函数中，我们需要自己释放内存，因为vargp是指针传入，对应的内存空间是堆分配的（是吗？）而不是栈分配，因此需要手动回收，否则就会出现内存泄漏。


## 多线程变量共享

共享变量是一个很方便，但是容易出问题的技术。要弄清一个变量是不是被共享，需要回答如下几个问题：
- 线程的内存模型是什么样的？
- 在上述模型中，变量实例是如何被映射到内存的？
- 有多少线程引用了这个变量实例？

我们说一个变量是共享变量意味着：这个变量的内存实例被多个线程引用。

（什么是变量的实例？）

```c=
#include "csapp.h"
#define N 2
void *thread(void *vargp);

char **ptr;  /* Global variable */ //line:conc:sharing:ptrdec

int main()
{
    int i;
    pthread_t tid;
    char *msgs[N] = {
        "Hello from foo",
        "Hello from bar"
    };

    ptr = msgs;
    for (i=0; i<N; i++)
    {
        Pthread_create(&tid, NULL, thread, (void *)i);
    }

    Pthread_exit(NULL);
}

void *thread(void *vargp)
{
    int myid = (int)vargp;
    static int cnt = 0;  // static make a static memory allocation in 1 adress.
    printf("[%d]: %s (cnt=%d)]\n", myid, ptr[myid], ++cnt);
    return NULL;
}
```

输出：

```
❯ ./share                                                
[0]: Hello from foo (cnt=1)]
[1]: Hello from bar (cnt=2)]
```
注意到其中 cnt 被不同的线程共享。更有意思的是，主线程的ptr也被共享了。下面我们深入看看线程的内存模型，以便可以理解上述现象。

### 线程的内存模型

由于线程是在进程的context运行的，每个线程共享进程的一部分内存，包括：read-only text (code), data, heap, shared libraries code，files。另一方面，线程具有独立的：id, stack, stack point, program counter, condition code, register values。

如此我们就可以理解上面为什么不同线程可以访问ptr了，因为全局变量位于内存的data部分，可以被线程共享。

逐一分析下列变量的引用情况：


| Variable Instance | Ref. main | Ref. t0 | Ref. t1 |
| ----------------- | --------- | ------- | ------- |
| myid.p1           | N         | N       | Y       |
| myid.p0           | N         | Y       | N       |
| msgs.m            | Y         | Y       | Y       |
| i.m               | Y         | N       | N       |
| cnt               | __Y__ (NP!)   | Y       | Y       |
| ptr               | Y         | Y       | Y       |
