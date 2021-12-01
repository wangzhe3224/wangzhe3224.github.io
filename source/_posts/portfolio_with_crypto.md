---
title: 为什么你的投资组合需要Crypto？
date: 2021-12-01
tags: [Crypto, 投资组合]
categories: Investing
---

> 本文送你一个 Sharpe Ratio 2.0 的简单投资组合 + 源代码

- 量化分析
- 基本面分析

## 量化分析

先给我们的讨论定个调调。假设我们的benchmark是一个按月再平衡的投资组合: SPY + TLT + GLD。就是一个股票、债券、黄金的组合。每月按照波动率取逆确定权重，即波动率调整。具体可以看我之前的文章(<https://zhuanlan.zhihu.com/p/249909117>)。

**总而言之，无他：低相关 + 正期望 = 成功的投资组合**

可以看到，我们的基准是 sharpe 1 年化 8% 的策略，这个策略只有三个ETF，每个月rebalance一次。

![SPY + TLT + GLD](https://raw.githubusercontent.com/wangzhe3224/pic_repo/master/images/20211130224840.png)

以下是一些投资组合的统计指标：

```text
Stats for classic from 2014-09-15 00:00:00 - 2021-11-29 00:00:00
Annual risk-free rate considered: 0.00%
Summary:
Total Return      Sharpe  CAGR    Max Drawdown
--------------  --------  ------  --------------
82.83%              1.06  8.73%   -13.77%

Annualized Returns:
mtd    3m     6m     ytd    1y     3y      5y      10y    incep.
-----  -----  -----  -----  -----  ------  ------  -----  --------
0.85%  0.72%  4.66%  4.63%  6.85%  15.27%  10.93%  -      8.73%

Drawdowns:
max      avg       # days
-------  ------  --------
-13.77%  -1.28%     27.75
```

接下来，我们加入BTC，其他不变。可以发现，加入BTC可以轻松将sharpe 提高到1.7！如果我们继续加入ETH，sharpe将超过2.0。

![加入Crypto的投资组合对比](https://raw.githubusercontent.com/wangzhe3224/pic_repo/master/images/20211130225507.png)

```text
Stat                 spy,tlt,btc-usd    spy,tlt,btc-usd,gld    spy,tlt,gld    spy,tlt,btc,eth
-------------------  -----------------  ---------------------  -------------  -----------------
Start                2015-08-06         2015-08-06             2015-08-06     2015-08-06
End                  2021-11-26         2021-11-26             2021-11-26     2021-11-26
Risk-free rate       0.00%              0.00%                  0.00%          0.00%

Total Return         237.23%            172.09%                78.72%         542.72%
Daily Sharpe         1.79               1.70                   1.15           2.12
Daily Sortino        2.79               2.72                   1.84           3.47
CAGR                 21.25%             17.20%                 9.64%          34.31%
Max Drawdown         -19.85%            -16.34%                -13.77%        -23.92%
Calmar Ratio         1.07               1.05                   0.70           1.43

MTD                  -0.37%             -0.02%                 0.70%          -0.85%
3m                   3.66%              2.47%                  1.60%          5.10%
6m                   11.75%             5.99%                  4.54%          13.43%
YTD                  15.77%             8.83%                  4.47%          29.00%
1Y                   24.29%             15.99%                 6.98%          40.47%
3Y (ann.)            28.42%             23.85%                 15.46%         41.19%
5Y (ann.)            22.68%             18.13%                 10.93%         33.77%
10Y (ann.)           -                  -                      -              -
Since Incep. (ann.)  21.25%             17.20%                 9.64%          34.31%
```

我们得承认Crypto再过去的今年确实是牛市。但是通过相关性可以发现，Crypto与股票市场和债券市场相关性较低。这也是为什么加入Crypto可以轻松提高收益风险回报率。

![各个策略的相关性](https://raw.githubusercontent.com/wangzhe3224/pic_repo/master/images/20211130225620.png)

从相关性可以看出，加入crypto的投资组合回报率与我们的基准投资组合的相关性只有0.56，这是我们希望看到的，这也是sharpe提高的因素之一。

如果我们观察这些标底资产的相关性：

![20211130225843](https://raw.githubusercontent.com/wangzhe3224/pic_repo/master/images/20211130225843.png)

可以crypto和其他资产比如股票、债券、黄金的相关性都非常低，而它具有正期望（背后的原因下一节讲），这是加入投资组合最好的特性，而 2.0 的 sharpe ratio 也证明了这个事实。

## 基本面分析

我们再来看看Crypto的基本面。我们得承认Crypto市场目前有泡沫，但是时至今日没有人可以忽略Crypto这个市场了，或者还在叫嚷这Crypto是骗局。

今天我们从一下几个点看看Crypto的“基本面”，其实也不算基本面，就是一些帮助我看Crypto这个市场的指标。这行指标可以帮助我们明确Crypto（垃圾币、烂项目另说）是一个实际存在生态，特别Defi和Web3，有很多人正在为这个产业实际付出。正式这些因素佐证了Crypto的未来的正期望。

- 金融指标
- 开发者生态
- 其他机构的动作

### 金融指标

金融指标我们主要看：

- 市值
- 流动性和交易额

首先看市值，根据 coinmarketcap 的数据，目前（2021-11）加密货币总市值为2.6万亿美金。而市值前十的币几乎占据了超过95%的总市值。什么概念呢？标普500的头部公司，比如苹果、微软、谷歌，的市值基本上是2万亿级别。

然后我们看流动性和交易额，日交易额约为1000亿美金。什么概念呢？世界交易最频繁的外汇USD-EUR的日均交易额为5000亿美金。如果我们仅仅关注Crypto的货币属性，这已经是一个足够大的、流动性足够好的市场了。

### 开发者生态

Crypto本质上是计算机科学的产物，没有计算机和互联网的支持，Crypto本身不可能存在。而计算机和互联网的主要建造者正是开发人员，即程序员。当然Crypto的载体是计算机，参与者实际上还是人，还是价值保存和交换过程（这其实也是一个Crypto注定会成为常态的原因）。

根据 decrypt 的调研，有超过8000名开发人员每个月在进行各种Crypto项目的开发，其中以太坊最为集中，约有2300人每月；而新兴的区块链项目 Polkadot 每月也有超过400名开人员参与开发。新兴的急速区块链项目 Solana 有超过100名开发人员提交了代码，平均每个月有超过300个Commit被提交合并。可以看出，开源社区正在助力 Crypto。

### 其他机构的动作

我们再来看看老派的金融机构是怎么看Crypto的。我有所耳闻的：

摩根大通早在几年前就开始为客户提供Crypto产品了，而且内部成立了相应的Trading desk。高频交易公司Jump Trading最近成立了一个80人的团队进行区块链开发。英国对冲基金Maven正在组建Crypto自营交易组。

## 结论

无论是从回测数据，还是所谓“基本面”分析，在你的投资组合中加入Crypto都是不错的选择。

## Ref

- https://academy.binance.com/en/articles/a-guide-to-cryptocurrency-fundamental-analysis
- https://app.intotheblock.com/