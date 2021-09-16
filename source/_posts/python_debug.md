---
title: Python多线程、进程debug技巧
date: 2021-06-16
tags: [Python, Debug]
categories: Coding
---

# Python多线程、进程debug技巧

- 使用 `py-spy`
- 利用 `/proc/{pid}/` 中的信息


比如查看进程环境变量: `cat /proc/{pid}/environ`

查看实时进程内部线程的CPU和内存状态：`py-spy --nonblocking -p {pid}`

查看线程dump：`py-spy dump --nonbloacking -p {pid}`
