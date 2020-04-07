---
title: Z-backtest
tags: Backtest
categories: Quant
date: 2020-04-07
---

## Intro

Why? bother to create another backtest framework, if we already have plenty of them?

- I can not find even one backtest framework to backtest option (or deriveritive) based strategy properly. (Mix of option and delta one product is a Bigger NO!)
- Debug/Reconcile backtest is painful, because of bad state management
- Logic components are hard to re-use
- And thanks to point 3, strategy code to strategy logic is not easy
- Not easy to do strategy of strategies

How? to solve above problems?

1. Use unified interface for derivertive and delta-one Node (And Event a Strategy!)
2. Use explicit state management, things like Redux
3. Use Algo stacks to express logics
4. Thanks to point 3, this is solved
5. Use Tree structure to describe strategy (Check point 1)

What? we will achieve in this framework?

1. Derivertive/Delta-one/Strategy can be backtested together
2. Strategy data will be presented as a tree structure
3. Common logic can be tested and re-used easily
4. Compose common logics creats new strategy easily
5. Strategy logic will be explicitly expressed as Algo stucks
6. State evolution during backtesting is trasnprent 

What are not our goals (at least for now):

1. Spead (If you are simple enough, you should be fast as well)
2. Live trading (state => order => trade => state)
3. Intraday strategy
4. A lot of built in batteries (common logics, or complex derivative Node)

## Concepts

