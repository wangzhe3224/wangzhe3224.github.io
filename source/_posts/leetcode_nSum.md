---
title: nSum 问题
tags: [Leetcode, nSum]
categories: Coding
date: 2021-04-09
---

# nSum 问题

## 2 Sum

方法1：去重、排序、字典、穷举

```python=
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        cache = {}
        
        for i in range(len(nums)):
            residual = target - nums[i]
            
            if residual in cache:
                return [cache[residual], i]
            
            cache[nums[i]] = i
            
        return []
```

## 3 Sum

方法1：去重、排序、字典、穷举

```python=
class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        if len(nums) <= 3 and sum(nums)!=0:
            return []
        
        res = []
        counter = collections.defaultdict(int)
        for i in nums:
            counter[i] += 1
            
        nums = sorted(counter.keys())
        
        for i in range(len(nums)):
            a = nums[i]
            
            if 3*a == 0 and counter[a] >= 3:
                res.append([a,a,a])
            
            for j in range(i+1, len(nums)):
                b = nums[j]
                
                if 2*b + a == 0 and counter[b] >= 2:
                    res.append([a, b, b])
                
                if 2*a + b == 0 and counter[a] >= 2:
                    res.append([a, a, b])
                    
                c = -a-b
                
                if c > b and counter[c] >= 1:
                    res.append([a, b, c])
        
        return res
```


###### tags: `Leetcode` `nSum`