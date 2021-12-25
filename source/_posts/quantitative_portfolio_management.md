---
title: Quantitative Portfolio Management
date: 2021-12-22
tags: [Systematic Trading, Statistical Arbitrage]
categories: Reading
math: true
---

这是一本针对股票类资产的统计套利书，系统的描述了该类投资组合的交易：数据、Alpha生成、风险控制、成本控制、投资组合优化。

系统化交易 = 数据 + 模型

数据 = 收集 + 后处理

模型 = 预测模型 + 风险模型 + 花费模型 + 投资组合构成模型

预测模型 = Alpha + Alpha组合模型

风险模型 = 投资组合协方差 + 回撤 + Alpha协方差

花费模型 = 滑点 + 市场冲击

投资组合优化 = 目标 + Penalty + 约束

最后，还需要检测回测模拟和实盘交易之间的区别。

## 数据

- Tick and Bar
- Corporate actions and Adjustment
- How to compute "return"

股票数据的特点，Corporate actions和调整因子以及回报率计算。

简化成两类：分红，D；拆分，S。

$adj_d = \frac{S_d}{1 - D_d/C_{d-1}}$

收益率计算分成凉了：算术回报率 和 对数回报率。
算术回报是横向可加，而算术回报率是竖向可加。

$$R_{log} = log(1 + R) = R - R^2/2 + \mathbb{O}(R^3)$$

算术收益率对投资组合优化比较有帮助，而对数回报率对Kelly公式比较有帮助。

## 预测（Alpha）

### 预测的数据

- Point-in-Time，PIT and lookahead
- Survival bias
- Move the market, ie, market impact
- ID mapping

### 技术分析

对于股票，应该把他们按照Sector或者流动性进行分组，然后执行动量策略或者均值回归策略。
同时，最好不要混用ETF和个股的策略，因为他们的内在特性非常不同。

- 均值回归
- 动量
- 成交量（Volume）
    - 有成交量支撑的趋势往往是动量，而没有成交量支持的趋势往往是均值回归
- 统计指标
    - Hurst exponent，分型指标，判断动量还是均值回归
- 其他相关的不同类型资产

### 统计学习

## 组合预测（Combine Alpha）

### 相关性和分散

![分散度提升的极限](https://i.imgur.com/vhdJKHw.png)

### 维度缩减

### Alpha 池管理

> 维护一个分散化的Alpha池，运行一个有效的组合算法，以及一个考虑花费的投资组合优化算法，这三者可能是最有效的量化模型了。
> 但是我们很难知道一个组合算法是否是最好的，有时候组合alpha的开销，可能达到了挖掘一个alpha开销的30%。

Alpha开发的纲领：

- 尽量使用PIT数据
- 预测时长和尺度
- 回报率的类型：实际回报、市场中性回报、因此残值或者引子回报。线性回报率还是指数回报率。
- 衡量预测准确性的指标：分布、MSE、相关性、残值的偏度
- 衡量预测不确定性的指标：置信区间？
- 与已有信号的相关性
- 过拟合的检查

### Pnl Attribution，回报率归因

Marginal attribution 和 regression-based attribution

## 风险，Risk

在量投资组合管理的背景下，风险（risk）一般被认为是PnL的波动和控制这种波动方法。最简单的风险指标是：Variance（方差）。不过方差本身也比较复杂，还有如下简化指标：

- VaR, Value at Risk，$VaR(p)$
- CVaR, expected shortfall
- drawdown

### Factor Model

### PCA

### Alpha Risk

## 花费，Trading Cost

## 投资组合构成，Portfolio Construction

## 模拟，Simulation

###### tags: `Sysytematic Trading` `Statistical Arbitrage`