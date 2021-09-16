---
title: Tree层遍历
tags: [BFS, Tree]
categories: Leetcode
date: 2021-04-20
---

# Tree层遍历

- [102 Binary Tree Level Order Traversal](https://leetcode.com/problems/binary-tree-level-order-traversal/)
- [107 Binary Tree Level Order Traversal II](https://leetcode.com/problems/binary-tree-level-order-traversal-ii/)
- [1302. Deepest Leaves Sum](https://leetcode.com/problems/deepest-leaves-sum/)
- [637 Average of Levels in Binary Tree](https://leetcode.com/problems/average-of-levels-in-binary-tree/)

## 102 Binary Tree Level Order Traversal

**题目**

> Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).

**例子**

```
Input: root = [3,9,20,null,null,15,7]
Output: [[3],[9,20],[15,7]]
Example 2:

Input: root = [1]
Output: [[1]]
Example 3:

Input: root = []
Output: []
```

**思路**

此题属于比较常见的BFS遍历，即通过一个队列将同一层的节点遍历一遍，然后入列下一层的节点，循环。不过需要注意一些 None 的conner case处理。

**代码**

```python=
class Solution:
    def levelOrder(self, root: TreeNode) -> List[List[int]]:
        if not root:
            return []
        
        q = collections.deque()
        q.append(root)
        res = []
        while q:
            tmp = []
            for _ in range(len(q)):
                node = q.popleft()
                if node:
                    tmp.append(node.val)
                    if node.left: q.append(node.left)
                    if node.right: q.append(node.right)
            
            res.append(tmp)
            
        return res
```

## 107 Binary Tree Level Order Traversal II

**题目**

> Given the root of a binary tree, return the bottom-up level order traversal of its nodes' values. (i.e., from left to right, level by level from leaf to root).

**思路**

此题是上一题的倒叙模式。最直接的方法是采用上题的解法，然后reverse结果。或者我们也可以直接采用queue进行，不过需要多一个状态记录层数。

**代码**

```python=
# dfs recursively
def levelOrderBottom1(self, root):
    res = []
    self.dfs(root, 0, res)
    return res

def dfs(self, root, level, res):
    if root:
        if len(res) < level + 1:
            res.insert(0, [])
        res[-(level+1)].append(root.val)
        self.dfs(root.left, level+1, res)
        self.dfs(root.right, level+1, res)
        
# dfs + stack
def levelOrderBottom2(self, root):
    stack = [(root, 0)]
    res = []
    while stack:
        node, level = stack.pop()
        if node:
            if len(res) < level+1:
                res.insert(0, [])
            res[-(level+1)].append(node.val)
            stack.append((node.right, level+1))
            stack.append((node.left, level+1))
    return res
 
# bfs + queue   
def levelOrderBottom(self, root):
    queue, res = collections.deque([(root, 0)]), []
    while queue:
        node, level = queue.popleft()
        if node:
            if len(res) < level+1:
                res.insert(0, [])
            res[-(level+1)].append(node.val)
            queue.append((node.left, level+1))
            queue.append((node.right, level+1))
    return res
	
def levelOrderBottom(self, root):
    deque, ret = collections.deque(), []
    if root:
        deque.append(root)
    while deque:
        level, size = [], len(deque)
        for _ in range(size):
            node = deque.popleft()
            level.append(node.val)
            if node.left:
                deque.append(node.left)
            if node.right:
                deque.append(node.right)
        ret.append(level)
    return ret[::-1]
```

## 637 Average of Levels in Binary Tree

**题目**
> Given the root of a binary tree, return the average value of the nodes on each level in the form of an array. Answers within 10-5 of the actual answer will be accepted.

**例子**

```
Input: root = [3,9,20,null,15,7]
Output: [3.00000,14.50000,11.00000]
Explanation: The average value of nodes on level 0 is 3, on level 1 is 14.5, and on level 2 is 11.
Hence return [3, 14.5, 11].
```

**思路**

简单说这题就是求每一层的平均数。同样的思路，用一个queue包括所有的该层节点。

**代码**

```python=
class Solution:
    def averageOfLevels(self, root: TreeNode) -> List[float]:
        q, res  = collections.deque(), []
        
        q.append(root)
        
        while q:
            size = len(q)
            _s = 0
            for _ in range(size):
                node = q.popleft()
                if node:
                    _s += node.val
                    if node.left: q.append(node.left) 
                    if node.right: q.append(node.right)
                    
            res.append(_s/size)
            
        return res
```

## 1302. Deepest Leaves Sum

**题目**

> Given the root of a binary tree, return the sum of values of its deepest leaves.

**例子**

```
Example 1:
Input: root = [1,2,3,4,5,null,6,7,null,null,null,null,8]
Output: 15

Example 2:
Input: root = [6,7,8,2,7,1,3,9,null,1,4,null,null,null,5]
Output: 19
```

**思路**

此题仍然是安层遍历，只不过我们只关心最后一层的数据。因此我们写一个循环，每一次搜集所有该层的节点，直到没有节点为止，此时queue剩下的元素就是我们需要的。

**代码**

```python=
class Solution:
    def deepestLeavesSum(self, root: TreeNode) -> int:
        if not root:
            return 0
        q = [root]
        while True:
            q_new = [ x.left for x in q if x.left ] 
            q_new += [ x.right for x in q if x.right ] 
            if not q_new:
                break
            q = q_new
        return sum([ node.val for node in q ])
```


## Ref

- https://leetcode.com/problems/deepest-leaves-sum/discuss/499023/Two-python-O(n)-sol.-by-level-order-traversal.-93%2B-With-explanation