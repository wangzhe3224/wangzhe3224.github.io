---
title: 回溯 DFS
tags: [DFS]
categories: Leetcode
date: 2021-04-18
---

# 回溯，DFS

- [46. Permutations](https://leetcode.com/problems/permutations/)
- [47. Permutations II](https://leetcode.com/problems/permutations-ii/)
- [1466. Reorder Routes to Make All Paths Lead to the City Zero](https://leetcode.com/problems/reorder-routes-to-make-all-paths-lead-to-the-city-zero/)
- [679. 24 Game](https://leetcode.com/problems/24-game/submissions/)

## 46. Permutations

**问题**

> Given an array nums of distinct integers, return all the possible permutations. You can return the answer in any order.

**例子**

```
Example 1:

Input: nums = [1,2,3]
Output: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
Example 2:

Input: nums = [0,1]
Output: [[0,1],[1,0]]
Example 3:

Input: nums = [1]
Output: [[1]]
```

**思路**

还是从简单的思考过程出发，假设给出 `[1,2,3]` 我们如何写出全排列呢？一个方法可以是：`1 ? ?？`，第一个？可以选择2或者3，然后会影响？？的选择。这种思路是典型的回溯，即穷举每一个位置的可能性，然后继续下一个选择，直到结束，回退一层，换一个选择。

实现起来就是一个深度优先搜索，但是所搜一层结束后，要回档当前层的状态。

**代码**

```python=
class Solution:
    
    def permute(self, nums: List[int]) -> List[List[int]]:
        res = []
        track = []
        
        def backtrack(nums, track):
            # end condition
            if len(nums) == len(track):
                res.append(track[:])  # take a copy...
                return

            for n in nums:
            # 穷举
                if n in track:
                    continue
                # 选择
                track.append(n)
                # 递归进入下一层选择
                backtrack(nums, track)
                # 回档
                track.pop()
                
        backtrack(nums, track)
        return res
```


## 47. Permutations II

**问题**

> Given a collection of numbers, nums, that might contain duplicates, return all possible unique permutations in any order.

**例子**

```
Example 1:

Input: nums = [1,1,2]
Output:
[[1,1,2],
 [1,2,1],
 [2,1,1]]
 
Example 2:

Input: nums = [1,2,3]
Output: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
```

**思路**

此题与上一题的思路是一致的，只不过由于重复的存在，我们需要穷举不同的数字，而且应该记录该数字当前可用的数量（这只一个状态），并且在回档的时候记得补回使用的数量。

**代码**

```python=
class Solution:
    def permuteUnique(self, nums: List[int]) -> List[List[int]]:
        result = []
        
        def backtrack(path, counter):
            # 结束条件
            if len(path) == len(nums):
                res.append(path[:])
                return
                
            for num in counter:
                if counter[num] > 0:
                    # 增加路径
                    path.append(num)
                    # 改变状态
                    counter[num] -= 1
                    # DFS
                    backtrack(path, counter)
                    # 回滚
                    path.pop()
                    counter[num] += 1
                    
        backtrack([], Counter(nums))
        return result
```


## 466. Reorder Routes to Make All Paths Lead to the City Zero

**问题**

> - [1466. Reorder Routes to Make All Paths Lead to the City Zero](https://leetcode.com/problems/reorder-routes-to-make-all-paths-lead-to-the-city-zero/)

**例子**

```
Input: n = 6, connections = [[0,1],[1,3],[2,3],[4,0],[4,5]]
Output: 3
Explanation: Change the direction of edges show in red such that each node can reach the node 0 (capital).
```

**思路**

首先把图改造成 undirected，同时标记那些路径是新加入的，那些是原有的。然后从0点出发做 DFS 搜索，如果途中经历了原有的路线，计数器加一。因为这些路线是需要改造的路线。

**代码**

```python=
class Solution:
    def minReorder(self, n: int, connections: List[List[int]]) -> int:
        # 转化成 undirected graph，并记录那些路径是原始路径，0，那些是增加路径，+1
        graph = defaultdict(list)
        # 构造无方向图
        for s, d in connections:
            graph[s].append((d, 1))  # 这是s->d的原有路线，需要+1
            graph[d].append((s, 0))
            
        # dfs
        visited = set()
        self.res = 0
        def dfs(cur, parent, graph):
            for node, cost in graph[cur]:
                # node != parent 为了防止往回走。。
                if node not in visited and node != parent:
                    self.res += cost
                    visited.add(node)
                    dfs(node, cur, graph)
                    
        dfs(0, -1, graph) 
        return self.res
```

当然这题也可以用 BFS

```python=
class Solution:
    def minReorder(self, n: int, connections: List[List[int]]) -> int:
        graph = defaultdict(list)
        # 构造无方向图
        for s, d in connections:
            graph[s].append((d, 1))  # 这是s->d的原有路线，需要+1
            graph[d].append((s, 0))
            
        res = 0
        queue = [0]
        visited = set([0])
        
        while queue:
            node = queue.popleft()
            for n, cost in graph[node]:
                if n not in visted:
                    visited.add(n)
                    res += cost
                    queue.append(n)
                    
       return res
```


## 679. 24 Game

**问题**
> You have 4 cards each containing a number from 1 to 9. You need to judge whether they could operated through *, /, +, -, (, ) to get the value of 24.

**例子**
```
Example 1:
Input: [4, 1, 8, 7]
Output: True
Explanation: (8-4) * (7-1) = 24

Example 2:
Input: [1, 2, 1, 2]
Output: False
```

**思路**

基本问题是给出四个数和四则运算，搜索满足条件的数字组合。典型的搜索问题。对于没两个数字，我们需要尝试四种运算，得到结果A，然后再A和剩下的三个数字里继续搜索。

这题被划分成困难，但是其实代码非常简单和清楚，就是典型的DFS通过递归实现。

**代码**

```python=
class Solution:
    def judgePoint24(self, nums: List[int]) -> bool:
        
        if len(nums)==1:
            return round(nums[0], 4) == 24
        
        for i in range(len(nums)-1):
            for j in range(i+1, len(nums)):
                first, second = nums[i], nums[j]
                left = nums[:i] + nums[i+1: j] + nums[j+1: ]
                
                if self.judgePoint24(left+[first+second]):
                    return True
                
                if self.judgePoint24(left+[first*second]):
                    return True
                
                if self.judgePoint24(left+[first-second]):
                    return True
                
                if self.judgePoint24(left+[second-first]):
                    return True
                
                if second and self.judgePoint24(left+[first/second]):
                    return True
                
                if first and self.judgePoint24(left+[second/first]):
                    return True
                
        return False
```


###### tags: `Leetcode` `DFS`