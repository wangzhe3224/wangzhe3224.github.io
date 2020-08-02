---
title: Reinforment Learning 3 Markov Decision Process 
tags: [Reinforcement Learning, MDP]
categories: Quant 
date: 2020-07-31
mathjax: true
---

# Markov Decision Process, MDP

[![hackmd-github-sync-badge](https://hackmd.io/BGkR2gTjTLy6oHBfkQ2EAQ/badge)](https://hackmd.io/BGkR2gTjTLy6oHBfkQ2EAQ)


## High level overview of RL

At the heart of RL theory, it is Markov Decision Process.

The general rule we follow is that anything that cannot be changed arbitrarily by the agent is considered to be outside of it and thus part of its environment.

High level description of RL problem: three signals.

The **representation** of the signals (actions and states) is art! Reword, on the other hand, is always real numbers. (why?? this does not sound good!!! Not consistent with actions and states which have complex representation!!)

Two types of RL tasks: episodic task and continuing task.

The reward for both cases: 

$$G_t = \sum_{k=0}^{T-t-1}\gamma^k R_{t+k+1}$$

where, $T$ can be infinite and $\gamma$ can be 1.

## The Markov Property

Here we don't discuss the design of state signal, because I focus on form the RL problem framework. However, the design of the states representation is very important in terms of make a good RL model.

State representation can be very complicated and not expected to inform the agent everything about the environment. 

A state signal that succeeds in retaining all relevant information is said to be Markov, or to have the **Markov property**.

The dynamic of environment is a joint distribution of states and rewards:

$$Pr\{R_{t+1}=r, S_{t+1}=s'|S_0,A_0,R_1,...,S_t, A_t\}$$

If state signal has the Markov property, we have

$$p(s',r|s,a) = Pr\{R_{t+1}=r, S_{t+1}=s'|S_t, A_t\}$$

In order for these to be effective and informative, the state representation must be informative.

## Markov Decision Process

Expected rewords for state-action pairs:

![](https://i.imgur.com/64vtOf2.png)

The state-transition probability:

![](https://i.imgur.com/eqZhGEy.png)

The expected rewards for state-action-next-state triples:

![](https://i.imgur.com/7xgrcZX.png)


## Value functions

Value functions estimation how good is a state in terms of the goal. Accordingly, value functions are defined with respect to particular policies.

For MDPs, we can define $v_{\pi}(s)$ formally as

$$v_{\pi}(s)=\mathbb{E}_{\pi}[G_t|S_t=s]$$

where, $G_t = \sum_{k=0}^{\infty}\gamma^kR_{t+k+1}$.

Similarly, we can define the value of taking action a in state s under a policy:

$$q_{\pi}(s, a) = \mathbb{E}_{\pi}[G_t | S_t=s, A_t=a]$$

A fundamental property of value function is that they satisfy particular recursive relationships.

$$v_{\pi} = \sum_{a}\pi(a|s)\sum_{s',r}p(s',r|s,a)[r+\gamma v_{\pi}(s')]$$

This is **Bellman equation**.

## Optimal Value Functions

Solving a reinforcement learning task means, roughly, finding a policy that achieves a lot of reward over the long run. 

$$q_{*}=\mathbb{E}[R_{t+1}+\gamma v_{*}(S_{t+1})|S_t=s,A_t=a]$$

We have

$$v_{*}=max\sum_{s',r}p(s',r|s,a)[r+\gamma v_{*}(s')], for all A(s)$$

$$q_{*}(s,a) = \sum_{s',r}p(s',r|s,a)[r + \gamma max q_{*}(s',a')]$$

These are Bellman optimality equation.

## Bellman Equations

![](https://i.imgur.com/Ln7PnVy.png)

The are relationships between value function and q-function:

![](https://i.imgur.com/YEGGt2x.png)

Our goal in RL is to solve Bellman Optimality Equation. There are two ways of solving this non-linear problem:

- Dynamic Programming, this when you have a model of the MDP.
  * Value iteration
  * Policy iteration
- Sampling 
  * Monte Carlo
  * Q-learning
  * Sarsa

## Summary

- Reinforcement learning is about learning from interaction how to behave in order to achieve a goal.
- the actions are the choices made by the agent; the states are the basis for making the choices; and the rewards are the basis for evaluating the choices.
- A policy is a stochastic rule by which the agent selects actions as a function of states. The agent’s objective is to maximize the amount of reward it receives over time.