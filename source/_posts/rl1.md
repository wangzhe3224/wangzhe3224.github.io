---
title: Reinforment Learning Introduction 1 - 2
tags: [Reinforcement Learning, n-arm bandit]
categories: Quant 
date: 2020-07-25
mathjax: true
---

[![hackmd-github-sync-badge](https://hackmd.io/EF3LjEjfQtCa-yEZlFNCmQ/badge)](https://hackmd.io/EF3LjEjfQtCa-yEZlFNCmQ)


Reinforcement learning, RL is a framework that let an agent to make suitable  decisions to achieve best goal. Underneath math problem to solve is a  Markov Decision Process, MDP.  RL is different from both supervised and unsupervised learning. 

# Elements of RL

Apart from Agent and Environment, following elements also play central 
roles: Policy, Reward Signal, Value Function, and Model of environment. 

Policy, is a map from current states to actions to take. It might be 
deterministic or stochastic.

Reword signal, defines the goal of RL. At each step, environment will 
give agent a single number, a reward.

Value function, specifies what is good in the long run. The estimation 
of value is in the central part of RL.

Model, is what the agent think the environment will behave. Basically by
building a model of env, the agent can do planning better. But model env
sometime is very hard.

Not all RL model need full set of above. But a good value function does 
help to make a better decision.In the end, evolutionary and value function methods both search the space of policies, but learning a value function takes advantage of information available during the course of play.

# A bit history 

There are two threads of RL histories. One thread concerns learning by trial and error that started in the psychology of animal learning. The other thread concerns the problem of optimal control and its solution using value functions and dynamic programming. 

Although the two threads have been largely independent, the exceptions revolve around a third, less distinct thread concerning temporal-difference methods

# Simplest problem: Multi-arm Bandits

The most important feature distinguishing reinforcement learning from other types of learning is that it uses training information that evaluates the actions taken rather than instructs by giving correct actions.

Consider the following learning problem. You are faced repeatedly with a choice among n different options, or actions. After each choice you receive a numerical reward chosen from a stationary probability distribution that depends on the action you selected. Your objective is to maximize the expected total reward over some time period, for example, over 1000 action selections, or time steps.

## Action Value method

Assume $q(a)$ is the true value of action a, and the estimation on t step is $Q_t(a)$. Then the simplest idea is average: 

$$Q_t(a) = \frac {R_1+ R_2 + ... + R_{N_t(a)}}{N_t(a)}$$

Once we have $Q_t(a)$, we can then select the action with highest estimated action value. The _greedy_ action selection method can be written as

$$A_t = argmax Q_t(a)$$

Greedy means that action selection always **exploits** currently knowledge to max immediate reward. A simple alternative is to behave greedily most of the time, but, **explore** new actions sometimes.

## Incremental Implementation

$$Q_{k+1} = Q_k + \frac {1}{k}[R_k - Q_k]$$

So esentially, update previous estimation with adjustment of new update.

$$NewEstimate \leftarrow OldEstimate + StepSize * [Target - OldEstimate]$$

## Nonstationary Problem

For non-stationary problem, it makes more sense to has more weights on recent result.

$$Q_{k+1} = Q_k + \alpha [R_k - Q_k]$$

$$Q_{k+1} = (1-\alpha)^kQ_1 + \sum_{i=1}^k\alpha(1-\alpha)^{k-i}R_i$$

## Upper-Confidence-Bound Action Selection

$$A_t = argmax_a\Big[Q_t(a) + c\sqrt{\frac{ln t}{N_t(a)}}\Big]$$

The idea here is to add exploration more wisely. So if an action is not selected for a long time, it is more likely to be selected, and if an action has been selected a lot of time, it is more likely to be selected (stick with optimal action, i.e. exploiate. )

## Gradient Bandits

we can also learn a preference of each action, $H_t(a)$. The more preference, the more change to take that action. But preference is a relative value.

$$\pi_{t}(a) = P\{A_t=a\} = \frac {e^{H_t(a)}}{\sum_{b=1}^{n}e^{H_t(b)}}$$

So action is a softmax of preferences. We want to learn the preference of each actions.

Initially, all preference is 0.

So the learning/updating process is:

$$H_{t+1}(A_t) = H_t(A_t) + \alpha(R_t - \bar{R_t})(1 - \pi_{t}(A_t))$$

$$H_{t+1}(a) = H_t(a) - \alpha(R_t - \bar{R_t}\pi_t(a), \forall{a} \ne A_t$$

Above is a stochastic approximation to gradient ascent:

$$H_{t+1}(a) = H_t(a) + \alpha \frac {\partial {E[R_t]}} {\partial {H_t(a)}}$$

where, $E[R_t] = \sum_{b}\pi_t(b)q(b)$

# Different Agents of Mult-arm Bandits

## Random Agent

The agent pick action randomly from action space, `number_of_arms`.

```python
class Random(object):
  """A random agent.
  
  This agent returns an action between 0 and 'number_of_arms', 
  uniformly at random. The 'previous_action' argument of 'step'
  is ignored.
  """

  def __init__(self, number_of_arms):
    self._number_of_arms = number_of_arms
    self.name = 'random'
    self.reset()

  def step(self, previous_action, reward):
    return np.random.randint(self._number_of_arms)

  def reset(self):
    pass
```

## Greedy Agent

The agent pick action that has most big expected value.

So pick action as following:

$$A_t = argmax Q_t(a)$$

Every step, update Q value of previous actions and counter of actions:

$$N(A_{t-1}) = N(A_{t-1}) + 1$$
$$Q(A_{t-1}) = Q(A_{t-1}) + \alpha(R_t - Q(A_{t-1}))$$

```python
class Greedy(object):

  def __init__(self, number_of_arms):
    self._number_of_arms = number_of_arms
    self.name = 'greedy'
    self.reset()
  
  def step(self, previous_action, reward):
    if type(previous_action) == type(None):
      return np.random.randint(self._number_of_arms)
    else:
      # update values
      self.N[previous_action] += 1
      lr = 1./self.N[previous_action]
      error = reward - self.Q[previous_action]
      self.Q[previous_action] += lr*error
      
      # get new actions
      return np.argmax(self.Q)
    
  def reset(self):
    self.Q = np.zeros((self._number_of_arms,),dtype='float32')
    self.N = np.zeros((self._number_of_arms,),dtype='float32')
```

## $\epsilon$-Greedy Agent

The issue of pure greedy agent is that it may stuck in some false action and never explore. So we add a small change to select action which does not have best q value, but just to explore to gather more information.

The update process is as same as Greedy agent. But the way we choose actions changed:

$$A_t = argmax Q, rand > \epsilon$$
$$A_t = random action, rand <= \epsilon$$

```python
class EpsilonGreedy(object):

  def __init__(self, number_of_arms, epsilon=0.1):
    self._number_of_arms = number_of_arms
    self._epsilon = epsilon
    self.name = 'epsilon-greedy epsilon:{}'.format(epsilon)
    self.reset()
  
  def step(self, previous_action, reward):
    if type(previous_action) == type(None):
      return np.random.randint(self._number_of_arms)
    else:
      # update values
      self.N[previous_action] += 1
      lr = 1./self.N[previous_action]
      error = reward - self.Q[previous_action]
      self.Q[previous_action] += lr*error

      # get new actions
      ra = bool( np.random.random() < self._epsilon )
      return (not ra) * np.argmax(self.Q) + (ra) * np.random.randint(self._number_of_arms)
      
  def reset(self):
    self.Q = np.zeros((self._number_of_arms,),dtype='float32')
    self.N = np.zeros((self._number_of_arms,),dtype='float32')
````

## UCB Agent



```python
class UCB(object):

  def __init__(self, number_of_arms):
    self._number_of_arms = number_of_arms
    self.name = 'ucb'
    self.reset()
  
  def step(self, previous_action, reward):
    if type(previous_action) == type(None):
      return np.random.randint(self._number_of_arms)
    else:
      self.t += 1
      # update values
      self.N[previous_action] += 1
      lr = 1./self.N[previous_action]
      error = reward - self.Q[previous_action]
      self.Q[previous_action] += lr*error
      
      # here is the extra bit
      U = np.sqrt(np.log(self.t)/1./(self.N+1.))
      
      # get new actions
      return np.argmax(self.Q+U)
      
  def reset(self):
    self.Q = np.zeros((self._number_of_arms,),dtype='float32')
    self.N = np.zeros((self._number_of_arms,),dtype='float32')
    self.t = 0
```

## Reinforce Agent 

Base line will not affect mean, but will change the variance of the estimation. 

After we have the policy, we can sample an action from the policy.

```python
class Reinforce(object):
 
  def __init__(self, number_of_arms, step_size=0.1, baseline=False):
    self._number_of_arms = number_of_arms
    self._lr = step_size
    self.name = 'reinforce, baseline: {}'.format(baseline)
    self._baseline = baseline
    self.reset()
  
  def step(self, previous_action, reward):
    if type(previous_action) == type(None):
      return np.random.randint(self._number_of_arms)
    else:
      self.t += 1
      self.all_reward += reward
      if self._baseline:
        base = self.all_reward / (self.t * 1.)
      else:
        base = 0
      # update preferences
      # this is H_a, reduce others preference
      self.prob -= self._lr * (reward-base) * self.policy
      # this is H_A, increase current action preference
      self.prob[previous_action] += self._lr * (reward-base)
      x = self.prob
      y = np.exp(x - np.max(x))
      self.policy = y / np.sum(y)
      # get new actions
      # here we sample an action from the updated policy
      import bisect
      acc = np.cumsum(self.policy)
      return bisect.bisect(acc, np.random.random())

  def reset(self):
    self.policy = np.ones((self._number_of_arms,),dtype='float32')/self._number_of_arms
    self.prob = np.zeros((self._number_of_arms,),dtype='float32')
    self.t = 0
    self.all_reward = 0 
```

# Full RL Problem

Above problem is not a full RL problem, because there is no association between action and different situations. Full RL problem needs to learn a policy that maps situations to actions.

