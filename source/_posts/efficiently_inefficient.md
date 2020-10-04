---
title: Efficiently Inefficient Market
date: 2020-10-03
tags: [Investing, Hedge Fund]
categories: Reading
mathjax: true
---

# Efficiently Inefficient Market

[![hackmd-github-sync-badge](https://hackmd.io/DEJL1LPVSd6-XRKV85iEeg/badge)](https://hackmd.io/DEJL1LPVSd6-XRKV85iEeg)


# 感受

作者认为，市场足够的有效，但是不是完全有效，也正式基金经理的主动挖掘无效性，才进一步促进了市场的有效。只不过，主动投资是有花销的，比如人力、技能、电脑、场地等等，这些都会为主动管理资金设立门槛，导致超过容量有限。

作者在AQR从事量化投资相关研究，具有很好的学术和工业背景，所以他的见解更加贴合真是市场，但是又包含严谨的说明，没有任何玄学。比如，他就明确的说出：想要盈利就必须要预测，而且要做好的预测。

这一点我很认同，母我看到太多所谓的“交易”达人胡扯：不预测，只是跟随市场。<---- **扯淡**。

# 内容

- 价值
- 趋势
- 流动性
- Carry
- 质量

# 1、主动投资活动

## 评价策略表现

Alpha, t-statics, sharpe ratio, information ratio, alpha-to-margin ratio, sortino ratio

## 寻找、回测策略

每一个策略背后都应该有合理的盈利逻辑，因为你的每一笔交易都会存在对手方，如果你的策略真的有效，那么对手会亏损，问题在于他有什么理由一直亏损？

所以超额利润，alpha，一般来源有两个：流动性的补偿和信息的补偿。

![Alpha的来源](https://i.imgur.com/FRHkc6g.png)

**信息**

市场价格如果可以反映该产品的一切信息，那么这个过程不是自动完成的，也不是瞬间完成的，需要有人去交易这些信息，把这些信息反映到市场价格中去。反过来说，如果市场自动、瞬间反映了所有信息，那么不会有人去收集并交易任何信息，因为没有意义。可以，如果是这样的话，市场优又如何可以反映新出现的信息？所以，对冲基金等主动管理者就通过收集和交易信息成全了市场的有效性。

对冲基金往往也充当了信息的生产者，比如他们会对公司进行深入系统的研究，然后做出对应的交易，从而将这些信息反映到价格中。对冲基金也会高价购买信息，然后通过交易行为，将这些信息反映到价格中，并且从中盈利。同时，对冲基金也会交易一些非理性行为，比如

> there is a general tendency of initial underreaction and delayed overreaction that creates trends and momentum.

所以，当一个新的策略形成的时候，问问自己受益从何而来？
- 这些信息被大部分人忽略了吗？
- 通过整个多种不同的信息，得到了新的信息吗？
- 我比其他人更快的获得了这个信息吗？
- 这些信息还没有完全反映到市场价格吗？

**风险**

获得超额回报的另一个途径就是承担风险。市场风险不计入。通常对冲基金会通过承担流动性风险获得市场收益意外的超额回报。

流动性风险会直接影响资产的价格。

*市场流动性风险*，是指需要花费巨额的费用才能退出某个资产。最常见的情况就是在崩盘的情况下，bid-ask差价非常大，甚至出现没有bid的情况，无人接盘。因此，流动性差的资产通常具有较高的回报率或者比较便宜，这就是市场流动性风险补偿。

*资本流动性风险*，是指被margin call的风险。换句话说，持有高Margin的资产应该得到相应的回报，因为承担了资本流动性风险。

*需求压力*，Demand pressure，并购套利就是一个典型的需求压力策略。当一些机构进行风险对冲的时候，也会出现需求压力。在比如需要roll future contract的时候，债券降级的时候，都会产生一些需求压力，通常都是卖出压力。

**回测**

回测的基本组成部分：
- 交易池，定义可以交易的资产
- 信号，信息输入
- 交易规则，包括调仓规则，交易规则等等
- 时间延迟，Point-in-time 信息
- 交易费用

## 回归分析的等效性

投资组合资产的选择和比较几乎等效于线性回归系数的分析：

> 任何预测性质的回归分析都可以等效成资产组合选择，任何资产组合选择都可以等效成为预测回归分析。

- 时间序列回归分析，与择时策略相关
- Corss-sectional回归分析与则产选择策略相关
- 单因子回归分析与根据一个信号排序资产相关；而多因子回归则与多因子排序相关

### 时间序列回归

$$R_{t+1}^e = a + bF_t + e_{t+1}$$

**而 $b$ 的最小二乘估计值就可以被看成一个long-short择时策略的累计回报率**：

$$\hat{b}=\frac{\sum_t(F_t - \bar{F})R_{t+1}}{\sum_t(F_t-\bar{F})^2} = \sum_{t=1}^{T}x_tR_{t+1}$$

其中，$x_t = k(F_t - \bar{F})$，而$k = 1/\sum(F_t-\bar{F})^2$ 不影响策略的夏普值。

$x_t$就是实际的交易仓位，当信号$F_t$超过其均值时，x为正，即买入。反之，则卖出。

### *Corss-sectional回归与选股*

$$R_{t+1}^i= a + bF_t^i + e_{t+1}^i$$

其中，i代表一个资产，F同样代表信号。针对投资组合中的所有资产进行上述回归分析，得到回归系数矩阵：

$$\hat{b}_t=\frac{\sum_i(F_t^i - \bar{F_t})R^i_{t+1}}{\sum_i(F_t^i - \bar{F_t})^2} = \sum_{i}x_t^iR_{t+1}^i$$

**这个回归系数 $\hat{b}$ 就代表了一个long-short策略在t和t-1获得的收益**。而资产的权重就是：

$$x_t^i=k_t(F_t^i-\bar{F_t})$$

这个回归系数$\hat{b_t}$的平均值，其实就是Fama–MacBeth模型中的系数$\hat{b}$。

$$\hat{b} = 1/T\sum_{t=1}^T\hat{b}_t$$

进而，我们可以求出策略的波动率：

$$\hat{\sigma} = \sqrt{\frac{1}{T-1}\sum_{t=1}^T(\hat{b_t}-\hat{b})^2}$$

这里如果看一下t-static会发现，其实t-statistics就是高夏普比例的表现。

$$tstatistics = \sqrt{T}\frac{\hat{b}}{\hat{\sigma}}$$

### 多因子回归

$$R_{t+1}^i= a + b^FF_t^i + b^GG_t^i + e_{t+1}^i$$

在这种情况下，$b^F$ 代表了同时交易信号F和信号G的时候，信号F的收益。

> 值得注意的是，时间序列线性回归更加可以，因为用到了信号均值进行计算。而信号均值从回测的角度，属于未来信息。

## 构建投资组合以及风险管理

当我们识别出若干可用的信号以后，就需要组合这些信号形成投资组合进行交易。具体方法多种多样，但是总体原则是：

- 多样性
- 头寸限制
- 对信心更强的信号，下注更多
- 根据风险指标调整投资组合
- 关注相关性

## 交易的花费

- 交易花费
- funding cost
    * 总杠杆
    * 净杠杆
- Margin

# 2. 股票类策略

主要分为三类：discretionary equity, dedicated short bias, and quantitative equities.

> Intrinsic value: It is the discounted value of the cash that can be taken out of a business during its remaining life.

交易股票的基础在于股票估值，即固有价值。估值的核心在于未来现金流的现今折扣价值：

$$V_t = E_t(\frac{D_{t+1}+V_{t+1}}{1+k_t})$$

其中，k 即使股票的回报率，D 是股票的分红。

不过，分红并不容易预测，特别对于有些成长型的公司，股票并没有分红，所以需要Earning和Book value进行替代计算。

当然，除了上述绝对估值，也可以对股票进行相对估值。

## Discretionary equity

- Value
- Growth
- Quality

## Dedicated short bias

## Quant equity

- Fundamental quant
    * value
    * quality
    * bet against beta
- Statistic Arb
- HFT


# 3、资产配置和宏观策略

宏观策略的逻辑是自顶向下的，而股票策略则通常是自底向上的。宏观策略的主要受益来源是各种Risk Premiums，比如股票风险回报、时间结构回报（国债）、信誉风险回报（公司债）、流动性风险回报（房地产等）、其他（比如价值引子、趋势、carry等等）。

**市场择时**

市场择时策略可以通过回归和回测进行分析。

**回报率的来源**

## 全球资产配置

> The whole world is simply nothing more than a flow chart for capital.

- Carry
- Central banks


## CTA

趋势策略，不同时间周期、不同产品的多样性效应。

# 4、套利策略

