---
title: Leetcode Jump Game (1-3)
tags: [DP, Greedy, DFS]
categories: Leetcode
date: 2021-04-13
---

# Leetcode Jump Game (1-3)

这个系列的三个题虽然名字很像，但是第一和第二个思路类似，属于贪心问题，而第三题其实是搜索问题。

## 55. Jump Game I

**问题**

> Given an array of non-negative integers, you are initially positioned at the first index of the array. Each element in the array represents your maximum jump length at that position. Determine if you are able to reach the last index.

Example:

```
Input: [2,3,1,1,4]
Output: true
Explanation: Jump 1 step from index 0 to 1, then 3 steps to the last index.
 
Input: [3,2,1,0,4]
Output: false
Explanation: You will always arrive at index 3 no matter what. Its maximum
index.
```

**思路**

给出一个非负数组，要求判断从数组 0 下标开始，能否到达数组最后一个位置。
这个题采用贪心算法，在每一个节点都选择跳最远的距离，如果遇到一个点的index超过了能跳的最大距离，则不能到达，否则可以到达。

原理就是在每一个 index 的地方重新评估我们能到达的最远距离，如果 index 已经超过这个最远距离，就断开了。

**代码**

```python=
def solution(nums):
    longest = 0
    for i, v in enumerate(nums):
        if i > longest:
            return False
    longest = max(longest, i+v)

    return True    
```


## 45. Jump Game II

> Given an array of non-negative integers nums, you are initially positioned at the first index of the array.Each element in the array represents your maximum jump length at that position.
Your goal is to reach the last index in the minimum number of jumps.
You can assume that you can always reach the last index.

**例子**

```
Input: nums = [2,3,1,1,4]
Output: 2
Explanation: The minimum number of jumps to reach the last index is 2. Jump 1 step from index 0 to 1, then 3 steps to the last index.

Input: nums = [2,3,0,1,4]
Output: 2
```

**思路**

这道题跟上一道题类似，不过是求到达最后一个index的最小步数。还是采用贪心算法，在每一个index地方选择最大的跳跃。如果我们还没有到达最后，就继续跳跃（增加一步）。

**代码**

```python=
class Solution:
    def jump(self, nums: List[int]) -> int:
        jumps = 0
        longest = 0
        cur_pos = 0
        
        for i, v in enumerate(nums[:-1]):
            longest = max(longest, i+v)
            if i == cur_pos:
                jumps += 1
                cur_pos = longest
                
        return jumps
```

## 1306. Jump Game III

> Given an array of non-negative integers arr, you are initially positioned at start index of the array. When you are at index i, you can jump to i + arr[i] or i - arr[i], check if you can reach to any index with value 0.  
> Notice that you can not jump outside of the array at any time.

**例子**

```
Input: arr = [4,2,3,0,3,1,2], start = 5
Output: true
Explanation: 
All possible ways to reach at index 3 with value 0 are: 
index 5 -> index 4 -> index 1 -> index 3 
index 5 -> index 6 -> index 4 -> index 1 -> index 3 

Input: arr = [4,2,3,0,3,1,2], start = 0
Output: true 
Explanation: 
One possible way to reach at index 3 with value 0 is: 
index 0 -> index 4 -> index 1 -> index 3
```

**思路**

这题看起来跟前两个很像，但是其实一个搜索问题。即从 start 开始跳出，每次有两个选择：向左或者向右。具有递归的性质，我们可以做 DFS，需要设置一个 visited 的 set 确保我们不会循环搜索。思路比较清楚：start 点进栈，判断结束条件，然后分别向左、向右所搜，进栈。

**代码**

```python=
class Solution:
    def canReach(self, arr: List[int], start: int) -> bool:
        stack, visited = [start], set()
        nums = arr
        
        while stack:
            idx = stack.pop()
            
            if nums[idx] == 0:
                return True
            
            left = idx - nums[idx]
            right = idx + nums[idx]
            
            if left not in visited and left >= 0:
                stack.append(left)
                visited.add(left)
            
            if right not in visited and right < len(nums):
                stack.append(right)
                visited.add(right)
                
        return False
```


###### tags: `Leetcode` `DP` `Greedy`