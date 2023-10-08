---
title: Numpy array 怎么存最好？
date: 2023-10-08
categories: Data Engineering
tags: [numpy, parquet, pickle, lance]
---

谈到存储我们有几个维度来看：

- 存储速度
- 读取速度
- 空间占用
- 检索性能
- 可读性

目前可选的方案：

- pickle
- parquet
- npy，npz
- hdf5
- lance

当然我们还有很多其他的方案，比如 csv，json，等等，甚至可以存到 SQL或者mongo等数据库里面。

pickle 是最直接的方案，而且读写性能不错，只不过磁盘占用稍微大一些。parquet 和 lance 都是列数据格式，压缩性能较好，且具有一定的检索能力，但是因为numpy是一维数据，需要手工增加一层转换。hdf5 同理。

个人觉得，最简单且各方面性能都不错的方案是 npy 和 npz。

![20231008115118](https://raw.githubusercontent.com/wangzhe3224/pic_repo/master/images/20231008115118.png)

## 参考

- [best way to preserve numpy arrays on disk](https://stackoverflow.com/questions/9619199/best-way-to-preserve-numpy-arrays-on-disk#:~:text=Npy%20and%20binary%20files%20are,binary%20is%20better%20than%20npy.)
- [NPY format](https://numpy.org/devdocs/reference/generated/numpy.lib.format.html)
