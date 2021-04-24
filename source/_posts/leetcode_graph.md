---
title: 1192 Critical Connections in a Network
tags: [BFS, DFS，Graph]
categories: Leetcode
date: 2021-04-21
---

# 1192. Critical Connections in a Network

- [1192. Critical Connections in a Network](https://leetcode.com/problems/critical-connections-in-a-network/)
- [797. All Paths From Source to Target](https://leetcode.com/problems/all-paths-from-source-to-target/)


## 1192. Critical Connections in a Network

**问题**

> There are n servers numbered from 0 to n-1 connected by undirected server-to-server connections forming a network where connections[i] = [a, b] represents a connection between servers a and b. Any server can reach any other server directly or indirectly through the network.A critical connection is a connection that, if removed, will make some server unable to reach some other server.
> Return all critical connections in the network in any order.

**例子**

```
Input: n = 4, connections = [[0,1],[1,2],[2,0],[1,3]]
Output: [[1,3]]
Explanation: [[3,1]] is also accepted.
```

**思路**

思路1：暴力破解

按照循序分别移除一个边，然后dfs剩下的图，如果DFS的深度小于节点数，说明移除的边是关键路线。这个思路简单，一旦边数量多起啦，就会超时。

思路2：找循环

关键路线其实就是不在 cycle 中的 edge，我们只需要找到所有不在循环中边，就是此题答案。

下一个问题是：如何找到循环？无论哪种方法，我们需要遍历图，为了找到循环，最好的办法是DFS。DFS的过程中，需要一个特殊标记表明节点的深度，因为如果我们发现循环，等价于发现了一个节点，两次访问他深度不相同！

现在还有一个问题，我们可以用标记在当前的搜索层发现循环，但是上一个层并不知道这个信息，我们需要把这个信息返回到上一层，其实就是回溯（backtraking）。

**代码**

```python=
def solution(connections, n):
    graph = build(connections, n)
    mark = [-2] * n
    connections = set(map(tuple, (map(sorted, connections))))
    
    def dfs(node, depth):
        if mark[node] >= 0:
            # visited already!
            return mark[node]
        
        mark[node] = depth
        min_back_depth = n
        for adj in graph[node]:
            if mark[adj] == depth - 1:
                # visited from prev level
                continue
            back_depth = dfs(adj, depth+1)

            if back_depth <= depth:  # found cycle
                connections.discard(tuple(sorted((node, adj))))
            
            min_back_depth = min(back_depth, min_back_depth)
        
        return min_back_depth

    dfs(0, 0)
    return list(connections)
```

## 797. All Paths From Source to Target

**问题**
> Given a directed acyclic graph (DAG) of n nodes labeled from 0 to n - 1, find all possible paths from node 0 to node n - 1, and return them in any order.
>
> The graph is given as follows: graph[i] is a list of all nodes you can visit from node i (i.e., there is a directed edge from node i to node graph[i][j]).

**例子**

```
Example 3:

Input: graph = [[1],[]]
Output: [[0,1]]

Example 4:

Input: graph = [[1,2,3],[2],[3],[]]
Output: [[0,1,2,3],[0,2,3],[0,3]]

Example 5:

Input: graph = [[1,3],[2],[3],[]]
Output: [[0,1,2,3],[0,3]]
```

**思路**

基本的DFS回溯问题，我们套用模板。

**代码**

```python=
class Solution:    
    def allPathsSourceTarget(self, graph):
        # backtrack
        res = []
        path = [0]
        N = len(graph) - 1

        def _dfs(node):
            # 模板：结束条件
            if node == N:
                res.append(path[:])
                return 
            # 模板：遍历所有下一个步骤
            for i in graph[node]:
                path.append(i)
                # 模板：走向更深
                _dfs(i)
                # 模板：恢复状态，继续循环
                path.pop()
                
        _dfs(0)
        return res
```

## ref

- https://leetcode.com/problems/critical-connections-in-a-network/discuss/382638/DFS-detailed-explanation-O(orEor)-solution

###### tags: `Leetcode` `Graph` `BFS` `DFS`