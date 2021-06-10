---
title: CSAPP 11 网络编程
date: 2021-06-06
tags: CSAPP
categories: Computing
mathjax: true
---

# CSAPP 11 网络编程

网络编程基于之前看到的一些基本概念和抽象：进程、信号、内存映射、内存动态分配。

几乎所有的网络应用程序都基于服务器-客户端模式，即几个或者多个服务度进程和一个或者多个客户端进程，这些进程可以在同一个机器上，也可以分布在其他被网络连接的机器上。

计算机网络包含众多不同类型的机器，这些机器和设备是通过一些列“协议”进行交流的，每一个协议都包含两个基本部分：命名规则和传输规则。

**TCP/IP协议**

IP协议提供了基本的命名规则和传输规则，但是IP传输过程中会出现破损的包或者重复的包（packet），被称为`datagram`，而TCP协议则是建立在IP协议的基础上，提供可靠的双向通讯。UDP协议也是IP协议基础上的一个支持进程和进程通讯的协议。

在程序员的视角中，Internet可以认为是一个集合了多个主机的网络，这个网络具有如下属性：
- 主机地址都是32位IP地址（IPv6协议是128位地址）
- IP地址可以被映射成域名（domain names）
- 不同主机的进程可以通过Connection通讯

**socket**

Socket是Connection的一端，每一个socket都有一个地址和一个端口。不过通常客户端的端口是有kernel自动指定的，而服务端口则是通常是程序指定的。一般unix类机器可以在`/etc/services`目录下找到各种服务。

所以一个Connection可以被一对独特的socket（地址和端口）识别出来。

## Sockets Interface

在系统内核的角度，socket是一个Connection的一端，而在程序的角度，socket是一个文件标识符（IO的File）。

- `int socket(int domain, int type, int protocal)`
- `int connect(int sockfd, struct sockaddr *serv_addr, int addlen)`
- `int bind(int sockfd, struct sockaddr *my_addr, int addrlen)`
- `int listen(int sockfd, int backlog)`
- `int accept(int listenfd, struct sockaddr *addr, int *addrlen)`

## Web Servers

**CGI,Common Gateway Interface**

TODO: TINY server!

## 总结

Socket是网络通讯的核心抽象，而socket在用户程序看来就是一个文件标识符。