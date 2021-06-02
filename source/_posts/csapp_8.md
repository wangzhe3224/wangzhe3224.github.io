---
title: CSAPP 8 异常控制流
date: 2021-05-21
tags: CSAPP
categories: Computing
mathjax: true
---

# CSAPP 8 异常控制流（ECF）

异常控制流，Exception Control Flow，是操作系统实现IO、进程、虚拟内存、并发等等功能的的重要基础工具。

## 异常

这里提到的异常不是通常意义的异常，而是分成四类：Interrupt, faults, aborts, and trap.

## 进程

异常机制是操作系统提供下一个重要抽象，进程，的基石。

> 进程就是一个正在执行的程序实例

每一个进程都包含了程序运行的全部上下文（context），这个context包含：程序代码、数据、栈、寄存器状态、程序指针、环境变量、打开的文件标识符等等。

### 逻辑控制流

**并发**

两个任务A和B，如果我们说AB是并发执行的，等价于说：A在B开始后，B结束前，开始；或者反过来B在A开始后，A结束前，开始。

*Problem 8.1*

| Process | Start | End |
| ------- | ----- | --- |
| A       | 0     | 2   |
| B       | 1     | 4   |
| C       | 3     | 5   |

```
A: - -
B:   - - -
C:     - - -
```

从上面的图可以看出，AB，BC分别是并发的，而AC则不是。

**User and Kernel Mode**

Linux系统通过CPU上的一个特殊的寄存器来识别那些进程是系统进程，哪些是用户进程。系统进程可以执行一些高权限的指令。

**Contex Switch**

值得注意的是，系统缓存通常跟ECF相关的操作相互冲突。换句话说，ECF相关的活动，比如异常或者切换上下文，都会造成缓存污染。


## 进程控制

API：
- `int getpid(void)`
- `int getppid(void)`
- `pid_t fork(void)`
- `waitpid`
- `execve`

### `fork`

`fork`会产生一个内存内容跟父进程一样的子进程，镜像的内容包括：text, data, bss segments, heap, user stack以及父进程的拥有的所有文件标识符（file discriptors)。

**Practice Problem 8.2**

```c
#include "csapp.h"

int main() {
    int x = 1;
    if (Fork() == 0) {
        printf("printf1: x=%d\n", ++x);
    }
    printf("printf2: x=%d\n", --x);
    exit(0);
}
```

输出：

```
printf2: x=0   # From parent
printf1: x=2   # From child 
printf2: x=1   # From child 
```

**zombie**

当子进程结束时，kernel不会立刻移除该子进程，而是将它的状态改成 `terminated`，等待父进程 reap 它。一旦父进程收割了终止的子进程，kernel会把子进程的退出状态传递给父进程，然后从系统中移除该子进程。暂时还未被移除的子进程就叫做僵尸进程。

如果父进程在收割子进程前以外终结了，kernel会使用`init`进程终结僵尸进程。init 进程的 Pid 为 1，是kernel启动的第一个进程。（这个进程会终结吗？他是干啥的？）

收割子进程是通过 `pid_t waitpid` 系统函数实现的，该函数会挂起调用进程（option=1），直到子进程被收割。这个函数还有一些其它选项，可以调整行为。

### `waitpid`

**Practice Problem**

```c
#include "csapp.h"

int main() {
    if (Fork() == 0) {
        // Only child process goes here.
        printf("a");
    }
    else {
        printf("b");
        // pid = -1 means wait set consists all child processes
        waitpid(-1, NULL, 0);
    }
    printf("c");
    exit(0);
}
```

输出：`acbc`。

**Practice Problem 8.4**

```c 
#include "csapp.h"
#include <sys/wait.h>

int main()
{
    int status;
    pid_t pid; 

    printf("Hello\n");
    pid = Fork();
    printf("%d\n", !pid);  // make it 0 

    if (pid != 0) {
        // only parent process goes here
        if ((pid = waitpid(-1, &status, 0)) > 0) {
            if (WIFEXITED(status) != 0) {
                printf("%d\n", WEXITSTATUS(pid));
            }
        }
    }

    printf("Bye\n");
    exit(2);
}
```

```
            | - parent -> 0 -> 2 -> Bye
"Hell0" ->  |
            | - child  -> 1 -> Bye
```

**Practice Problem 8.5**

```c 
#include "csapp.h"
#include <unistd.h>

unsigned int snooze(unsigned int secs) {
    unsigned int rc = sleep(secs);
    printf("Slept for %u of %u secs.\n", secs-rc, secs);
    return rc;
}

int main()
{
    snooze(5);
    exit(0);
}
```

### `execve`

```c 
#include <unistd.h>

int execve(const char *filename, const char *argv[], const char *envp[]);
// Dose NOT return if OK, else return -1 on error.
```

与 fork 不同（调用一次，返回两次），execve 调用后不返回。在execve将目标文件的程序读入内存，就会为它分配栈，并把执行权限交给该目标程序。

![新的目标程序的内存配置](https://i.imgur.com/oK74LQj.png)

**Practice Problem 8.6**

```
unix> ./myecho arg1 arg2 
Command line arguments:
    argv[ 0]: myecho
    argv[ 1]: arg1
    argv[ 2]: arg2
Environment variables:
    envp[ 0]: PWD=/usr0/droh/ics/code/ecf
    envp[ 1]: TERM=emacs
...
    envp[25]: USER=droh
    envp[26]: SHELL=/usr/local/bin/tcsh
    envp[27]: HOME=/usr0/droh
```

```c 
#include "csapp.h"

int main(int argc, char **argv, char **envp) 
{
    int i;
    printf("Command line arguments: \n");
    
    for (i=0; argv[i] != NULL; i++)
        printf("    argv[%2d]: %s\n", i, argv[i]);

    printf("\n");
    printf("Environment variables: \n");
    for (i=0; envp[i] != NULL; i++)
        printf("    envp[%2d]: %s\n", i, envp[i]);

    exit(0);
}
```

### `fork` + `execve`

= shell ....

`waitpid`可以用于shell执行阻塞任务。


## Signal

Signal是一种另个进程或者kernel中断另一个进程的方式。通常signal是有kernel发送给用户进程的，比如，如果一个进程尝试0除法，内核会发送`SIGFPE (8)`信号给该进程，而该信号的默认行为是终结进程并且dump core。

什么是发送信号？Sending a Signal。Kernel发送signal给某个进程，意味着更新该进程的context中的某些状态。有两种情况Kernel会发送Signal给进程：
- 发现了一些系统事件，比如0除、分页错误、子进程终结等等
- `kill`程序

什么是接受信号？进程收到信号后会进行相应的处理，比如忽略、结束、或者捕捉信号（Signal handling）。

Signal在还没有被接受的情况下，叫做Pending Signal，挂起信号。一个进程，最多只能有一个同类型的挂起信号。

### Send Signal

```c 
#include "csapp.h"

void handler(int sig)
{
    static int beeps = 0;

    printf("BEEP\n");

    if (++beeps < 5) 
        alarm(1);

    else {
        printf("BOOM!\n");
        exit(0);
    }
}

int main()
{
    signal(SIGALRM, handler);
    alarm(1);  // arange kernel to send alarm to this process 

    while (1) {
        // signal hander will return to here, which is the next instruction
        // after the interupt
    }
    printf("Never reach here. Because program exit in the handler...\n");
    exit(0);
}
```

### Receive Signal

进程可以选择修改Signal的默认行为，除了SIGSTOP and SIGKILL。

**Pratical Problem 8.7**

```c 
#include "csapp.h"
#include <unistd.h> 

void handler(int sig) {
    return;
}

unsigned int snooze(unsigned int secs) {
    unsigned int rc = sleep(secs);
    printf("Slept for %u of %u secs.\n", secs-rc, secs);
    return rc;
}

int main(int argc, char **argv)
{
    if (argc != 2) {
        fprintf(stderr, "usage: %s <secs>\n", argv[0]);
        exit(0);
    }

    if (signal(SIGINT, handler) == SIG_ERR)
        // install a hander for SIGINT
        // once catched, program return to the next instruction
        // which is printf in this case
        unix_error("signal error\n");
    (void)snooze(atoi(argv[1]));
    exit(0);
}
```

### Signal Handling Issues

> signals can block, but only 1 signal will be queued, following signal is discarded.

```c 
#include "csapp.h"

void handler2(int sig)
{
    pid_t pid;

    while ((pid=waitpid(-1, NULL, 0)) > 0) 
        printf("Handler reaped child %d\n", pid);
    
    if (errno != ECHILD)
        unix_error("waitpid error");
    Sleep(2);
    return;
}

int main(int argc, char **argv) 
{
    int i, n;
    char buf[MAXBUF];
    pid_t pid;

    if (signal(SIGCHLD, handler2) == SIG_ERR)
        unix_error("signal error.");

    for (i=0; i<3; i++) {
        pid = Fork();
        if (pid == 0) {
            printf("Hello from child %d\n", (int)getpid());
            Sleep(1);
            exit(0);
        }
    }

    while ((n = read(STDIN_FILENO, buf, sizeof(buf))) < 0)
        if ( errno != EINTR )
            unix_error("read error");

    printf("Parent processing input:\n");
    while (1)
        ;

    exit(0);
}
```

应该格外注意signal和他们的handler之间的并发问题，fork会让问题变得更加困难。