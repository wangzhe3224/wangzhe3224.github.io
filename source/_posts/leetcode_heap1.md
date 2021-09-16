---
title: Heap 使用
tags: [Heap]
categories: Leetcode
date: 2021-04-18
---

# Heap（堆）的使用

- [1046. Last Stone Weight](https://leetcode.com/problems/last-stone-weight/)
- [703. Kth Largest Element in a Stream](https://leetcode.com/problems/kth-largest-element-in-a-stream/)
- [1792. Maximum Average Pass Ratio](https://leetcode.com/problems/maximum-average-pass-ratio/)
- [621. Task Schedule](https://leetcode.com/problems/task-scheduler/)

## 1046. Last Stone Weight

**思路**

此题比较直接，直接采用heap来维护最重的数值在头部，需要注意的是 Python 的 heap 都是 min heap，所以需要取负数来实现此题。

**代码**

```python=
class Solution:
    def lastStoneWeight(self, stones: List[int]) -> int:
        h = [-s for s in stones]
        heapify(h)
        print(h)
        while len(h) >= 2:
            fst = heappop(h)
            snd = heappop(h)
            if fst != snd:
                heappush(h, fst-snd)

        return -sum(h)
```


## 703. Kth Largest Element in a Stream

**思路**
这题的要点在于维护一个固定长度的heap。可以采用 `heapreplace` 函数实现 push和pop 的组合操作。

**代码**

```python=
class KthLargest:

    def __init__(self, k: int, nums: List[int]):
        self.nums = nums
        self.k = k
        heapify(self.nums)
        # 保持头部是 kth largest 
        while len(self.nums) > k:
            heappop(self.nums)

    def add(self, val: int) -> int:
        if len(self.nums) < self.k:
            heappush(self.nums, val)
        elif val > self.nums[0]:
            heapreplace(self.nums, val)
            
        return self.nums[0]
```


## 1792. Maximum Average Pass Ratio

**思路**

这道题的关键在于想要找到最大平均数，需要把好学生分配到改变通过率最大的班级，即 delta 最大的班级。根据这个特征，我们需要一个堆来决绝，按照每个班增加一个好学生后的 delta 作为 Priority。永远把好学生分配到怼的头部。

**代码**

```python=
import heapq

class Solution:
    def maxAverageRatio(self, classes: List[List[int]], extraStudents: int) -> float:
        h = [((x/t - (x+1)/(t+1)), x, t) for x, t in classes]
        heapify(h)
        
        while extraStudents:
            v, x, t = heappop(h)
            x, t = x+1, t+1
            heappush(h, (x/t-(x+1)/(t+1), x, t))
            extraStudents -= 1
            
        return sum([x/t for _,x,t in h]) / len(h)
```

## 621. Task Schedule

```python=
class Solution:
    def leastInterval(self, tasks: List[str], n: int) -> int:
        from heapq import heappush, heappop
        from collections import Counter
        h = []
        res = 0
        
        for k, v in Counter(tasks).items():
            heappush(h, (-1*v, k))
            
        while h:
            i = 0
            tmp =  []
            while i<=n:
                res += 1
                if h:
                    left, task = heappop(h)
                    if left != -1:
                        tmp.append((left+1, task))
                    
                if not h and not tmp:
                    break
                else:
                    i += 1
                    
            for item in tmp:
                heappush(h, item)
                
        return res
        
```

###### tags: `Leetcode` `Heap`