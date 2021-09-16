---
title: CSAPP 10 系统IO
date: 2021-06-05
tags: CSAPP
categories: Computing
mathjax: true
---

# CSAPP 10 系统IO

Unix系统中的IO，即Input和Output是指从“文件”读入数据到内存和从内存输出数据到“文件”。“文件”是Unix的一个抽象，即一串字节。在概念上所有IO设备都可以抽象成文件，比如网络、硬盘、各种外设等等。这样系统就可以统一接口来操作外设。

Unix系统提供了四个基本的IO API：
- `int open(char *filename, int flags, mode_t mode)`
- `int close(int fd)`
- `ssize_t read(int fd, void *buf, size_t n)`
- `ssize_t write(int fd, void *buf, size_t n)`

其实这四个api的道理非常简单，`open`会返回一个文件标识符，就是打开了一个内存和文件的通道，`read`就是把文件标识符指向的文件中的字节输入到buf指向的内存空间，而`write`刚好相反，把buf指向的内存空间的字节输入到文件中。

## `RIO`库

```c=
/**
 * @file rio.c
 * @version 0.1
 * @date 2021-06-05
 * 
 * @copyright Copyright (c) 2021
 * 
 */

#include "rio.h"
#include <errno.h>
#include <stdio.h>
#include <string.h>

/**
 * @brief Robustly read n bytes (unbufferred)
 * 
 * @param fd 
 * @param usrbuf 
 * @param n 
 * @return ssize_t 
 */
ssize_t rio_readn(int fd, void *usrbuf, size_t n)
{
    size_t nleft = n;
    ssize_t nread;
    char *bufp = usrbuf; // create a new point to manipulate user buffer

    while (nleft > 0)
    {
        if ((nread = read(fd, bufp, nleft)) < 0)
        {
            // something wrong branch
            if (errno == EINTR)
            {
                // errno will get updated by the kernel
                // get interrupted, reset readn to read again later
                nread = 0;
            }
            else
            {
                // if it is other reason failure, return -1 for failure
                return -1;
            }
        }
        else if (nread == 0)
            break; /* EOF */

        nleft -= nread;
        bufp += nread;
    }

    return (n - nleft);
}

/**
 * @brief Robustly write n bytes (unbuffered)
 * 
 * @param fd 
 * @param usrbuf 
 * @param n 
 * @return ssize_t 
 */
ssize_t rio_writen(int fd, void *usrbuf, size_t n)
{
    size_t nleft = n;
    ssize_t nwritten;
    char *bufp = usrbuf;

    while (nleft > 0)
    {
        if ((nwritten = write(fd, bufp, nleft)) <= 0)
        {
            if (errno == EINTR)
                nwritten = 0;
            else
                return -1;
        }

        nleft -= nwritten;
        bufp += nwritten;
    }

    return n-nleft;
}

/**
 * @brief Associate a file descriptor with a read buffer and reset buffer 
 * 
 * @param rp 
 * @param fd 
 */
void rio_readinitb(rio_t *rp, int fd) 
{
    rp->rio_fd = fd;
    rp->rio_cnt = 0;
    rp->rio_bufptr = rp->rio_buf;
}


/**
 * @brief 
 * 
 * @param rp 
 * @param usrbuf 
 * @param n 
 * @return ssize_t , -1 for failed, 0 for EOF, positive bytes of read
 */
static ssize_t rio_read(rio_t *rp, char *usrbuf, size_t n)
{
    int cnt;

    /* if buffer empty, refill buffer with read */
    while (rp->rio_cnt <= 0)
    {
        rp->rio_cnt = read(rp->rio_fd, rp->rio_buf, sizeof(rp->rio_buf));
        if (rp->rio_cnt < 0) {
            /**
             * read failed, handle interrupt case only
             * if interrupted, do nothing go to next loop
             */
            if (errno != EINTR) 
                return -1;
        }
        else if (rp->rio_cnt == 0) // EOF
            return 0;
        else
            rp->rio_bufptr = rp->rio_buf;  // reset buffer pointer
    }

    // copy min(n, rp->rio_cnt) bytes from internal buffer to user buffer
    cnt = n;
    if (rp->rio_cnt < n)
        cnt = rp->rio_cnt;

    memcpy(usrbuf, rp->rio_bufptr, cnt);
    rp->rio_bufptr += cnt;
    rp->rio_cnt -=cnt;
    return cnt;
}

/**
 * @brief 
 * 
 * @param rp 
 * @param usrbuf 
 * @param n 
 * @return ssize_t 
 */
ssize_t rio_readnb(rio_t *rp, void *usrbuf, size_t n)
{
    size_t nleft = n;
    ssize_t nread;
    char *bufp = usrbuf;

    while (nleft > 0)
    {
        // rio_read handle interrupt and other -1 cases
        if ((nread = rio_read(rp, bufp, nleft) < 0))
            return -1;
        else if (nread == 0)
            break; // EOF

        nleft -= nread;
        bufp += nread;
    }
    return (n - nleft);
}


/**
 * @brief read a text line ( buffered )
 * 
 * @param tp 
 * @param usrbuf 
 * @param maxlen 
 * @return ssize_t 
 */
ssize_t rio_readlineb(rio_t *rp, void *usrbuf, size_t maxlen)
{
    int n, rc;
    char c, *bufp = usrbuf;

    for (n = 1; n < maxlen; n++)
    {
        if ((rc = rio_read(rp, &c, 1)) == 1)
        {
            *bufp++ = c;
            if (c == '\n')
            {
                n++;
                break;
            }
        }
        else if (rc == 0)  // EOF
        {
            if (n == 1)
                return 0;  // no data read yet
            else
                break;   // some data read already
        }
        else 
            return -1;  // error
    }
    *bufp = 0;  // append '\0' at the end of char buffer
    return n-1;
}
```

## 文件共享

Unix系统的文件标识符主要由三种数据结构维护：
- Descriptor table（DT）：每个进程有单独的标识符表
- File table（FT）：多个进程共享
- v-node table（VT）：多个进程共享

这三种结构分别包含一个指针：DT -> FT -> VT。

![](https://i.imgur.com/2jUJ9Lx.png)

值得注意的是，fork后的父进程和子进程由于共享文件标识符，所以两个进程打开的文件共享file table entry（FTE），因此两个进程共享该文件的读取位置。而同一个进程通过两个`open`打开同一个文件获得两个标识符，不共享file table entry，因此两个文件标识符的读取和写入是独立的。

## IO重新定向

IO重新定向的秘密在于系统函数：`dup2`。

```c=
#include <unistd.h>
int dup2(int oldfd, int newfd);
```

dup2会把oldfd对应的FTE拷贝到newfd，这样newfd和oldfd都会指向之前的FTE，而newfd如果已经对应了某个FTE，kernel会减少一个引用，如果引用归零，kernel会删除该FTE。