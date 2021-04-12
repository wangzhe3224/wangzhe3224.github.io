---
title: 动态规划问题
tags: [Leetcode, DP]
categories: Coding
date: 2021-04-08
---

# 动态规划问题

动态规划问题最鲜明的特点是求最值，问题本身一般可以用重复的、更小的子问题解决（递归特性）。解决方法通常是：递归、备忘录递归、迭代、备忘录迭代。要素是找到：
- 重复子问题
- 最优子结构
- 状态转移方程

基本套路：`写出 base -> 明确所有状态 -> 明确每个状态的选择 -> 定义 dp 数组` 

```
# 初始化 base case
dp[0][0][...] = base
# 进行状态转移
for 状态1 in 状态1的所有取值：
    for 状态2 in 状态2的所有取值：
        for ...
            dp[状态1][状态2][...] = 求最值(选择1，选择2...)
```

当然也会有一些问题没有明显的求最值的要求，比如 62 Unique Path，但是该问题可以用递归解决，同样的分析也可以用 DP 进行穷举。

问题举例：
- 简单题：
    - [198. House Robber](https://leetcode.com/problems/house-robber/)
    - [121. Best Time to Buy and Sell Stock](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/)
    - [122. Best Time to Buy and Sell Stock II](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/)
    - [322. Coin Change](https://leetcode.com/problems/coin-change/)
    - [509. Fibonacci Number](https://leetcode.com/problems/fibonacci-number/)
- 中度题：
    - [213. House Robber II](https://leetcode.com/problems/house-robber-ii/)
    - [123. Best Time to Buy and Sell Stock III](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/)
    - [518. Coin Change 2](https://leetcode.com/problems/coin-change-2/submissions/)
    - [62. Unique Paths](https://leetcode.com/problems/unique-paths/)

## 简单题

### 198. House Robber

```
输入：[1,2,3,1]
输出：4
解释：偷窃 1 号房屋 (金额 = 1) ，然后偷窃 3 号房屋 (金额 = 3)。
     偷窃到的最高金额 = 1 + 3 = 4 。

来源：力扣（LeetCode）
链接：https://leetcode-cn.com/problems/house-robber
```

要点在于不能抢隔壁，获得最大收益。最大值是典型的动态规划问题，首先明确状态。面对一个房子（i），我们有两种选择：抢或者不抢。

```
max(抢， 不抢)   # 找到最大值
抢就意味着前一个不能抢，所以抢的收益是： dp[i-2] + num[i]
不抢的收益： dp[i-1]
所以：
max(dp[i-1], dp[i-2]+num[i])
```

```python=
class Solution:
    def rob(self, nums: List[int]) -> int:
        if not nums:
            return 0
            
        prev2, prev1 = 0, 0
        for num in nums:
            tmp = prev1
            prev1 = max(prev2+num, prev1)
            prev2 = tmp
        return prev1
```

### 121. Best Time to Buy and Sell Stock

```
输入：[7,1,5,3,6,4]
输出：5
解释：在第 2 天（股票价格 = 1）的时候买入，在第 5 天（股票价格 = 6）的时候卖出，最大利润 = 6-1 = 5 。
     注意利润不能是 7-1 = 6, 因为卖出价格需要大于买入价格；同时，你不能在买入前卖出股票。

来源：力扣（LeetCode）
链接：https://leetcode-cn.com/problems/best-time-to-buy-and-sell-stock
著作权归领扣网络所有。商业转载请联系官方授权，非商业转载请注明出处。
```

这个问题跟上面的问题其实类似，目标是求最大值。接下来分析状态，可以发现除了 index 以外，我们其实有两个状态：买卖次数 k 和持股状态（0代表持币，1代表持股）。然后可以据此构造 DP 数组：`dp[i][k][0|1]`，例如 `dp[1][1][0]` 的意思就是，第一天，还可以交易1次，当前持币。

那么每一天我们的最优解是：

```
dp[i][k][0] = max(dp[i-1][k][0], dp[i-1][k][1] + price[i])
dp[i][k][1] = max(dp[i-1][k][1], dp[i-1][k-1][0] - prices[i])
```

有了个这个，我们现在只需要搞清楚 base：

```
dp[i][0][0] = 0
dp[i][0][1] = -inf   # 这种不可能存在，因为 k = 0 意味着不能买入，则不可能持有股票
```

再具体到我们这个问题，k=1，`dp[i-1][0][0] = 0` 不能交易，又持币，显然不可能有收益。而且注意到 k 其实不能影响状态方程了，也可以省略。我们的 dp 数组就退化成二维了。继续观察，其实只有i 和 i-1 两个状态相关，不需要记录所有的 i，数组就变成 1 维。

```python 
class Solution:
    def maxProfit(self, prices):
        dp_i_0, dp_i_1 = 0, -1e10
        
        for i in range(len(prices)):
            dp_i_0 = max(dp_i_0, dp_i_1+prices[i])
            dp_i_1 = max(dp_i_1, -prices[i])
            
        return dp_i_0
```

你可能已经发现了，这两个题的解法和代码几乎是一样的。

在 II 的题中，去掉了 `k = 1` 约束，k 可以无限大，我们只需要稍微更改上面的代码：

```python 
class Solution:
    def maxProfit(self, prices):
        dp_i_0, dp_i_1 = 0, -1e10
        
        for i in range(len(prices)):
            temp = dp_i_0
            dp_i_0 = max(dp_i_0, dp_i_1+prices[i])
            dp_i_1 = max(dp_i_1, temp-prices[i])  # 这里 dp[i-1][k-1][0] - prices[i]
            
        return dp_i_0
```


### 322. Coin Change

```
给定不同面额的硬币 coins 和一个总金额 amount。编写一个函数来计算可以凑成总金额所需的最少的硬币个数。如果没有任何一种硬币组合能组成总金额，返回 -1。
你可以认为每种硬币的数量是无限的。
```

首先这也是个最值问题：最少几个硬币。怎么分析这个问题呢？采用穷举的思想，假设我们需要换 10 元，比较复杂。但是如果我们换 1 元，就很简单，知道了 1 元的方法，2元的最少硬币个数 = min(用这个硬币，不用这个硬币）。对于每一个数量，每一个硬币，我们有两个选择：用这个硬币 和 不用这个硬币。

我们根据这个关系，可以写出如下算法：

```python 
def coin_change_322(coins: [int], amount: int):
    dp = [amount+1] * ( amount+1 )  # 初始化成最大值，+1 用来标记无解。
    dp[0] = 0
    
    # 状态1 是总共换钱的数量
    for i in range(1, amount+1):
        # 状态2 是硬币的种类
        for c in coins:
            if i >= c:  # 只有总量大于该硬币的时候才有意义。
                dp[i] = min(dp[i], dp[i-c] + 1)

    return dp[amount] if dp[amount] != amount+1 else -1
```


### 509. Fibonacci Number

```
斐波那契数，通常用 F(n) 表示，形成的序列称为 斐波那契数列 。该数列由 0 和 1 开始，后面的每一项数字都是前面两项数字的和。也就是：

F(0) = 0，F(1) = 1
F(n) = F(n - 1) + F(n - 2)，其中 n > 1
给你 n ，请计算 F(n)
```

这个题其实不属于 DP 问题，因为并不涉及最值求解，但是思路确实非常类似，代码看起来也很类似，只不过去掉了最值的部分，状态只有一个。

```python=
class Solution:
    def fib(self, n: int) -> int:
        if n==0: return 0
        if n==1: return 1
        n_1 = 0
        n_2 = 1
        for i in range(2, n+1):
            temp = n_2
            n_2 = n_2 + n_1
            n_1 = temp
            
        return n_2
```


## 中等题

上面的问题多数都有对应的中难度版本，但是只要按照这个框架，也很容易解答。

### 213. House Robber II

```
Input: nums = [2,3,2]
Output: 3
Explanation: You cannot rob house 1 (money = 2) and then rob house 3 (money = 2), because they are adjacent houses.
```

这个题的区别在于，头尾相接了。我们只需要重复简单题的算法，然后注意 coner case 即可。

```python=
class Solution:
    def rob(self, nums: List[int]) -> int:
        
        if len(nums) == 1:
            return nums[0]

        def simple_rob(nums):
            prev2, prev1 = 0, 0
            for num in nums:
                tmp = prev1
                prev1 = max(prev2+num, prev1)
                prev2 = tmp
            return prev1
        
        return max(simple_rob(nums[1:]), simple_rob(nums[:-1]))
```


### 123. Best Time to Buy and Sell Stock III

```
Input: prices = [3,3,5,0,0,3,1,4]
Output: 6
Explanation: Buy on day 4 (price = 0) and sell on day 6 (price = 3), profit = 3-0 = 3.
Then buy on day 7 (price = 1) and sell on day 8 (price = 4), profit = 4-1 = 3.
```
这道题难度在于 k=2，不是 1 也不是无穷，更加泛化了。对应到 DP 问题比前两个位多了一个维度，k。回顾我们的状态方程：

```
dp[i][k][0] = max(dp[i-1][k][0], dp[i-1][k][1] + price[i])
dp[i][k][1] = max(dp[i-1][k][1], dp[i-1][k-1][0] - prices[i])
```

现在我们需要两层循环来体现两个状态了：

```python=
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        i10, i11 = 0, -1e10
        i20, i21 = 0, -1e10
        
        for i in range(len(prices)):
            # 因为k只有两个状态，我们这里直接展开写了
            i20 = max(i20, i21+prices[i])
            i21 = max(i21, i10-prices[i])
            i10 = max(i10, i11+prices[i])
            i11 = max(i11, -prices[i])
            
        return i20
```

### 518. Coin Change 2

此题存疑，为什么一定要 coin 在外层，而 amoung 在内层才能得到正确答案？

```python=
class Solution:
    def change(self, amount: int, coins: List[int]) -> int:
        dp = [0]*(amount+1)
        dp[0] = 1
        for c in coins:
            for i in range(1, amount+1):
                if i >= c:
                    dp[i] = dp[i] + dp[i-c]
                    
        return dp[amount]
```

### 62. Unique Path

```python=
class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        if not m or not n:
            return 0
        
        dp = [[1 for _ in range(m)] for _ in range(n)]
        
        for i in range(1,n):
            for j in range(1,m):
                # 注意这里，i j 是两个状态，到达这个状态 有两个子情况
                dp[i][j] = dp[i-1][j] + dp[i][j-1]
                
        return dp[-1][-1]
```

## Ref

- https://bbs.cvmart.net/topics/1232
- https://zhuanlan.zhihu.com/p/349940945
- [一个大龄博士的刷题转码之路](https://zhuanlan.zhihu.com/p/349591952)
- https://labuladong.gitbook.io/algo/dong-tai-gui-hua-xi-lie/dong-tai-gui-hua-ji-ben-ji-qiao/dong-tai-gui-hua-xiang-jie-jin-jie
- https://leetcode.com/problems/house-robber/discuss/156523/From-good-to-great.-How-to-approach-most-of-DP-problems.


###### tags: `Leetcode` `DP`