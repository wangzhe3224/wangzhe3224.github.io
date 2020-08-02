---
title: Reinforment Learning 4 Dynamic Programming
tags: [Reinforcement Learning, DP]
categories: Quant 
date: 2020-08-01
mathjax: true
---

In previous chapter, value functions are defined. Dynamic Programming method is used here to use value functions to organize and structure the search for agent best policy.

![](https://i.imgur.com/26qVDFu.png)

![](https://i.imgur.com/YFH5OcT.png)

In other words, DP algorithms are obtained by turning Bellman equations such as these into assignments, that is, into update rules for improving approximations of the desired value functions.

## Policy Evaluation

First thing, how can we compute value function $v_{\pi}$ given a policy? This is also known as *prediction problem* or *policy evaluation*. 

![](https://i.imgur.com/GBtvnIv.png)

As above, there is a iterative method that we can solve this recursive problem.

![](https://i.imgur.com/qwEAxdf.png)

TODO: code to simulate Grid world value functions

## Policy Improvement

The theory is simple. If $q_{\pi}(s,\pi'(s)) \gt v_{\pi}(s)$, then $\pi'$ must be as good as, or better than, $\pi$ . Hence $v_{\pi'}(s) \gt v_{\pi}(s)$

![](https://i.imgur.com/Yrw6w2t.png)

Or in another equation:

![](https://i.imgur.com/NMnxuE7.png)


TODO：code

## Policy Iteration

Once we know how to compute value function and how to improve a policy using value function, we can iterate the process to get a optimal policy.

![](https://i.imgur.com/39yUEIw.png)

## Value Iteration

![](https://i.imgur.com/kfwyLJf.png)
