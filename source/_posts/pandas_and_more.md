---
title: 大数据时代的“Pandas” - Dask|Ray|Modin|Vaex|Polars|...
categories: Data Engineering
tags: [Pandas, Dask]
date: 2022-03-19
---

## 从 Pandas 说起

Pandas 在 Python 的数据工程领域可谓是半壁江山，Pandas 的作者 Wes Mckinney 于 2008 年开始构建 Pandas，至今已经走过了十几个年头。然而，Wes 在 2017 年的一篇博客中写道：

> 我开始构建 Pandas 的时候并不是很了解软件工程，甚至不太会使用 Python 的科学计算生态。我当时的代码丑陋且缓慢，也是一边学一边写。2011年，我引入了 `BlockManager` 和 `Numpy` 作为 Pandas 的内部内存管理和数据结构。
> 。。。
> 然而这个决定也是 Pandas 如今无法自如处理超大数据的罪魁祸首。毕竟在 2011 年我们几乎不去思考处理超过100 GB 甚至 1TB 的数据。
>
> **如今，我的经验是：如果你想用 Pandas 分析一个 1GB 的数据，那么你至少需要 5 - 10 GB 的内存才可以。**，然而，今天我们碰到更多地情况恰恰相反，分析的数据比内存大 5-10 倍。
> https://wesmckinney.com/blog/apache-arrow-pandas-internals/

### Pandas 的“十一大”问题

1. 内部数据结构距离硬件太过遥远
2. 没有内存映射
3. 数据库和文件读写性能差
4. 丢失值处理支持差
5. 内存管理不透明，过于复杂
6. Category 数据类型支持差
7. 复杂的分组运算性能差
8. 数据Append性能差
9. 数据类型依赖于numpy，不完整
10. 只有Eager evaluation，没有询问计划（query plan）
11. 慢，大数据集多核性能很差

今天我们来列举目前针对这些问题一些可能的解决方案：Dask、Ray、Modin、Vaex、Polars。当然，我们还会提到一个项目就是：Apache Arrow。

## Dask

![Dask](https://i.imgur.com/7Jq7KQJ.png)

Dask 本质上是两个部分：动态计算调度 + 一些数据结构。调度器主要负责在多核心或者多个计算机之间组织并行计算，而数据结构则提供了一些熟悉的API，比如类Pandas 的 Dask DataFrame、类 Numpy 的 Dask Array 等等。Dask 把人们已经熟的 Pandas、numpy 的 API 拓展到多核以及计算集群上进行计算。

当然，Dask 本身完全是由 Python 写成的，在单个计算任务方面并没有比 Pandas 有本质的提升，甚至 Dask 还是用到了一些 Pandas 的功能。我以为，Dask 真正的核心其实是他的调度器，理论上他的调度器可以执行任意Python函数、采用任意Python数据结构，只不过 Dask 为了使用数据科学的场景，自带了一些常见的 API，比如 DataFrame 或者 ndarray，这些数据结构可以更好的拓展到计算集群。

目前，Dask 已经将调度器部分独立成了新的项目：[A distributed task scheduler for Dask](https://github.com/dask/distributed)

```python 
# Arrays
import dask.array as da
x = da.random.uniform(low=0, high=10, size=(10000, 10000),  # normal numpy code
                      chunks=(1000, 1000))  # break into chunks of size 1000x1000

y = x + x.T - x.mean(axis=0)  # Use normal syntax for high level algorithms

# DataFrames
import dask.dataframe as dd
df = dd.read_csv('2018-*-*.csv', parse_dates='timestamp',  # normal Pandas code
                 blocksize=64000000)  # break text into 64MB chunks

s = df.groupby('name').balance.mean()  # Use normal syntax for high level algorithms

# Bags / lists
import dask.bag as db
b = db.read_text('*.json').map(json.loads)
total = (b.filter(lambda d: d['name'] == 'Alice')
          .map(lambda d: d['balance'])
          .sum())
```

## Ray 

![Ray](https://i.imgur.com/9r3AzwF.png)

Ray 是一个来自伯克利 RISE 实验室的开源产品，主要针对机器学习领域的分布式计算框架，其底层调度器与 Dask 类似，但是提供了完全不同的上层API和工具，Ray主要的提供了：Turn，分布式调参工具；RLlib，强化学习；Train，分布式深度学习；Dataset，分布式数据读取和计算。

Ray 在某种程度上不算是 Pandas 的替代品，而是大数据分布式机器学习的框架。

## Modin

![Modin](https://i.imgur.com/I10D1CN.png)

Modin 的目的非常明确：取代 Pandas。Modin 拥有几乎和 Pandas 一致的API，但是有用原生多核计算和处理超过内存数据集的能力。绝大部分场景下，完全相同的代码，Modin 比 Pandas 要快出数倍，但是编码成本几乎与Pandas一致。

![](https://i.imgur.com/H7mUZjh.png)

与 Dask 和 Ray 不同，Modin 的主要目的是提升单机（多核）处理大于内存数据集的能力，而不是采用集群计算。但是，Modin 拥有更换执行引擎的选项，也就是说，Modin 可以通过采用 Ray 或者 Dask 作为引擎轻松实现集群计算。

![](https://i.imgur.com/x4cRIZu.png)

从编码角度说，Modin 采用了纯 Python 编码，因此单核能力提升并不会较 Pandas 有太多优势，他的优势主要在于超大数据、分布式计算和友好的 pandas API。话句话说，Mondin 是分布式 Pandas。

## Vaex

![Vaex](https://i.imgur.com/7gYhST2.png)

Vaex 的主要目的也是提升单机处理大数据的能力和速度，在这一点与 Modin 类型，但是 Vaex 并没有想要完全兼容 Pandas 的API，而是倾向探索数据和数据可视化。虽然 Vaex 的 API 看起来跟 Pandas 很像。事实上，Vaex 这个名字的由来正是：Visualization and eXploration。

Vaex 采用了内存映射、0拷贝、惰性计算等技术提高性能，可以实现单机每秒处理超过10亿行数据；同时 Vaex 还有非常棒的开箱数据可视化能力。

从编码的角度，Vaex 核心采用了 Python 和 C++ 混合编程，在一定程度提升了单核计算性能。

## Apache Arrow

![Apache Arrow](https://i.imgur.com/Zd4laBa.png)

Arrow 实际上并不是一个库，而是一个规范。官方文档的定义是：Arrow 是一个内存内分析平台。它包含了一系列大数据处理和数据传输的技术。它规定了一个标准化的、语言无关的列内存格式（Columnar memory format），该格式适合于现代硬件进行高性能分析运算。当然，只有规范不能形成生态，Arrow社区维护了很多不同语言的实现，比如`C++`,`Python`,`Java`, `Rust`, `Go`等等。这些实现都遵循了`Arrow`的内存模型，并且主要包含如下主题：

- 0拷贝和基于RPC的数据传输
- 多种文件格式的读写
- 内存分析和查询处理

其实`Arrow`的创始人之一正是`pandas`的作者 Wes，他在[这篇博客](https://wesmckinney.com/blog/apache-arrow-pandas-internals/)中阐述了`pandas`的问题，并解释了为什么`arrow`是解决这些问题的第一步。

虽然`arrow`不是`pandas`直接的替代品，但是其他库提供了一个坚实的数据结构基础，这里我给大家介绍一个正在开发的库：Polars。

## Polars

![Polars](https://i.imgur.com/tbILHHT.png)

前文我们介绍了`Dask`和`Ray`，他们提供的主要功能是大数据的集群计算，实际上没有专注解决单机问题；`Modin`和`Vaex`，主要是提供单机处理大数据的能力，但是没有在单核计算上做过多努力。换句话说，实际上他们的每一个单核计算任务还是依赖`Python`库，比如`numpy`和`pandas`。也就是说，在某种程度上，他们并没有解决`pandas`的问题，而是把问题拆解放在了集群解决。

`polars`则利用`arrow`的生态，直接解决`pandas`的痛点，采用`Rust`编写核心代码，试下如下特性：

- 惰性、非惰性求值
- 原生多核计算
- SIMD
- 查询优化
- 类 pandas API

在 [h2oai](https://h2oai.github.io/db-benchmark/) 提供的 Benchmark 中`Polars`几乎占据了所有测试项目的首位：

![](https://i.imgur.com/QrQa9gb.png)

![](https://i.imgur.com/JwARa86.png)

当然，`polars`与之前介绍的项目并不冲突，特别是`Dask`和`Ray`，因为单机性能的提升对集群来说也是非常有益。而且`arrow`近些年已经成为了数据科学的标准数据格式，这种优势让数据的内存通讯、网络通讯成本大大降低，降低了序列化、反序列化的成本。

## 参考

- [大数据时代Pandas的替代品](https://docs.google.com/presentation/d/10XHc4LQ5K6WXAS24vp6jE7KkjouVZnQEuKbNwUVqmq4/edit#slide=id.g11a7293d561_0_77)
- [Wes Mckinney的博客](https://wesmckinney.com/blog/apache-arrow-pandas-internals/)
- [Jake Vanderplas的博客](http://jakevdp.github.io/blog/2014/05/09/why-python-is-slow/)
- [Apache Arrow](https://arrow.apache.org/docs/) 