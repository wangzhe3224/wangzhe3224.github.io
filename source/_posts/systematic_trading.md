---
title: Systematic Trading
tags: [读书笔记,Investing]
categories: Quant
date: 2020-04-21
mathjax: true
---

## 如何阅读
### Layer 1 Read

作者退休前是AHL的基金经理，经历过2008年的股灾。

- 这本书的目的
- 作者想要解决的问题
- 作者如何组织材料
- 作者的关键概念有哪些
- 作者的结论是
- 我学到了什么
- 与我有什么关系

### Layer 2 Read

- 这一章在讲什么
- 如何联系到作者的写作目的
- 如何联系到上一章
- 关键概念
- 解决了什么问题
- 结论

### Layer 3 read: 精读感兴趣的地方，甚至动手操作。

<!--more-->

## Part I: theory

### Cognitive bias

1. hard to admit failure
2. happy to be confirmed
3. overconfident


> what makes an addictive game:
> 1. an illusion of control
> 2. frequent changes of *Almost* win big
> 3. rapid and continous to give a constant flow of stimulation
> 

if we know most of player has these bias, we can leverage them by apply trading rules to remove our own bias.

### Good system design

- objective
- easiy to explain/understand
- avoid over-fitting
- avoid over-trading
- avoid over-betting

### What makes good trading rule

- Risk prem
- Skew trading
- Leverage
- Liquidity
- Correlation

> I also believe finding the best trading rules is less important than designing your trading system in the correct way.

## Part II: toolbox

### Fitting
1. Come up with a small number of trading rules to exploit each idea I have about how the market behaves.
2. For each rule select a few variations. At this stage I am not looking at performance, but at behaviour such as trading speed and correlation with other variations.
3. Allocate forecast weights to each variation, taking uncertainty about Sharpe ratios into account. Poor rules will have lower weight, but are rarely entirely excluded.

**Select rules from different themes**
- trend following
- carry 

Some points:
- So diversification amongst instruments is preferable to rule diversification, Adding new instruments is a tiresome task of uploading and checking data which is less fun than coming up with more trading rules, but in my experience is of far more benefit.

### Portfolio Allocation

- Forecast weights
- Instrument weights

The goal here is given some constrains to produce allocation weights on underlyings (instruments or trading rules).

Portfolio allocation should be tool to control risk, leverage divercification. Optimizaion is good but only when result is still reasonable in terms of diversification. 

**question:** how can we quantify diversification?

## Part III: framework

### Framework overview

Components:
- Instruments to trade
- Forecasts
- Combine forecast
- Volatility targeting
- Portfolio
- Speed and Size for all

### Instruments

![](https://i.imgur.com/v9TZ5ds.png)

### Forecasts

- Forecast should be a scale not binary
- Should be vol adjusted
- Should be consisten in scale
- Forecast should be capped

![](https://i.imgur.com/aTjsVtr.png)

The process works as following:

$$
signal = cap({raw} / vol * scalar, up\_limit, floor\_limit)
$$

where,
$raw$ is raw signal,  
$vol$ is volatility estimation of underly asset(s),  
$scalar$ is an enstimation number to scale the signal to a range, say -20~+20  
$cap(.)$ is a function that cap the signal to $up\_limit, floor\_limit$ 


### Combined Forecasts

The purpose is that given more than 1 signals for 1 instrument (can be extented to multiple instruments), we need a function to aggregate thme. $fweight$ or forecast weights estimation is at the core of this stage. And they should all be positive and
add up to 100%.

**Next question is how to choose an fweights given several signals?**

To answer this, portfolio construction method is useful, although the underlyings here is signals not assets. And correlation of signal return (NOTE: not performance) are needed in order to come up with weights. Several level (say, 2 levels) of grouping is useful, if you have several types of signals, and each of them has several variances. 

$$raw\_combined = f(corr, raw\_signals)$$

There is another concept is needed: forcast diversification multiplier, FDM. The reason is that we want to maintian the scale level of combined signal as same as scale level as individiual signals. When the signals are not perfectly correlated, the raw weighted combination will always results in a lower scale level. So we need a multiplier to scale it back.

Agian, correlation is important here:

$$FDM = target\_vol / portfolio\_vol$$

NOTE: it is better to cap this formula as well to avoid large multiplier. 

Again, after FDM, the signal level should be capped to 20, as we always do. (20 is just standard we selected, it needs to be consistent.)

So in the end:

$$
combined\_signal = cap(raw\_combined * FDM, -20, 20)$$

![](https://i.imgur.com/xMt7Oll.png)

### Vol targeting

The end result of this is just float, which is a overall volatility target you want to achieve. In another word, a parameter in the system, that will be used across the system. 

There are two ways:

- vol in pct
- vol in cash value

### Position sizing

In this stage, the task is to work out how scaled position, like how may shares (no rounding yet),given vol target and combined signal for one instrument. Note that, here we assumed that all the capital will be allocated to one instrument.

To achieve this, the first quesitons: if I am holding 1 share/unit of this instrument, how much rish am I exposed to in terms of cash?

To answer that question, we define **block value** as: when holding 1 unit of instrument, the cash value movement when the price of the instrument moves 1%. In this way, a connection between cash value movement and price quote movement is built. Then we just need to figure out the prive volatility. 

Bad news, estimation of volatility is not that easy.. 

What'more, if you are holding multiple currency, it is better to convert cash value movement into base currency.

Now, without considering forecast, assume we put all the capital into one instrument, and want to achieve a cash volatility, we need a **volatility scalar**.

$$vol\_scalar = tartet\_cash\_risk / block\_value$$

Above vol scalar is associated to a average signal level 10, so the final position will be:

$$pos\_sub = signal\_level * vol\_scalar
$$

### Portfolio

Finally, it is time to put all sub system above into a portfolio. Out of this, we will work out exactly how much units of each instruments we need to fill. In other words, generate a target position in terms of units (rounded).

The concept here is as same as in Combine Forecasts, except that the underlyings are now correlation between sub systems, instead of instruments.

> A good approximation is that the correlation between subsystem returns will be 0.70 of the correlation of instrument returns. So if two assets have a correlation of 0.5 between their instrument returns in appendix C, then their subsystems will have a correlation of 0.7 × 0.5 = 0.35.

Note that, similar to FDM, an Instrument diversification multiplier, IDM, is needed here to avoid low resulting vol.

By this step, the positions are still fractional. Before we decide how much to trade, we need a buffer (position inertia) to avoid back forward small trade because of rounding. For the sake of reducing trading cost.

### Speed and size

Now, we have system to trade, the next question is that how to config the system? For example, what kind of predicor should I used? what kind of instrument should I trade? What target vol should I select?

#### Caluclate cost of trading

Types of cost:
- execution cost
- mamangement fee for ETFs

Agian, the costs of different instruments should be normalized to be compared. 

$$ norm\_cost = (2*C) / (16 * ICV)
$$

where,
$C$ is cost to trade 1 unit in currency C,  
$ICV$ is daily instrument currency volatility.  

Note that 16 is for tha annulized vol. $norm\_cost$ has the same unit as Sharpe ratio. So it is easy to compare the cost effect with the strategy sharpe ratio.

Some experience value of costs:

- Futures: 0.001
- Spread betting: 0.01
- ETF: 0.08

### Turnover

Now we need to measure how qucikly you trade. The number of round trips per year is the turnover. 

A norm cost times turnover inshares, it is the final cost, in the same unit as sharpe ratio.

### Determine portfolio size

2 × volatility scalar × instrument weight × instrument diversification multiplier

## Part IV Practice

## Reference

- Systematic Trading: A unique new method for designing trading and investing systems
