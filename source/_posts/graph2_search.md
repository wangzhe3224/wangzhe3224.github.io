---
title: Graph Algorithms - Search
date: 2020-05-02
tags: [Data Structure, Graph, Algorithms, Python]
categories: Coding
---

When working with graph, search is an important topic. For example, search for connectivity, search for shortest path. There are two basic strategies to do search in graph: Depth-first(DFS) and Breadth-first(BFS). **Note that in this blog, all the discussions are based on undirected graph**. But the strategy can be used to all kind of graphs given they share similar data structures.

# What kind of problems we are solving?

The basic idea of search in general is to walk through the data structure and collection information we need. In terms of Graph, only two elements matters: nodes (vertices) and edges. Walking through a graph, really means iterating the nodes in a way.

# Data Structure

The next questions to ask is that how can I solve a question by looping through the least nodes? Well to answer this question, we need to decide a data structure to represent graph. 

Here we select a straight forward way: adjacent list. Completed code can be found [here](https://github.com/wangzhe3224/pygraph/blob/master/pygraph/entities/graph.py)

Essentially, we use dict of dict to represent nodes, and dict of dict of dict to represent adjacent list. I know.. it is not a list at all. But the idea is the same, the benefit of using a dict is that it is very easy to embed meta data to either nodes or edges. And it is an easy way to extend this data structure to other types of graph, say weighted graph. 

```python=
class UndirectedGraph(Graph):
    """"""
    dict_dict_dict = dict
    dict_dict = dict

    def __init__(self):
        """"""
        self.__adj = self.dict_dict_dict()  # dict of dict of dict
        self.__nodes = self.dict_dict()  # dict of dict
```

And.. in the end, dict (hash map) is just a list with hashable index instead of int as index. Or in another words, dict is just a generalized list... alright.. too far away. :smirk: 

For example, we can represent graph: 
```
1 - 2 - 3
    |
    4
```

with following:

```
__adj = {1: {2: {}}, 2:{3:{}, 4:{}}, 3:{2:{}}, 4:{2:{}}}
__nodes = {1:{}, 2:{}, 3:{}, 4:{}}
```
# Search strategy

Ok, we got our little dict(s), the next question is how can we search or walk through this structure? Well when we meet the first node, there are two obvious ways: 1. go to one of its adjacent node and go even deeper via that node. 2. go to all of its adjacent nodes and do the same for other nodes. 

The first way is called depth-first, the second is called breadth-first.

Apperently they have different properties.

## Depth-first search

For detailed code, please go https://github.com/wangzhe3224/pygraph/blob/master/pygraph/algos/dfs.py

We can prove that DFS marks all the nodes connected to a given node in time proportional to the sum of their degrees.

Recall `degree of a node` is the number of nodes connected to it directly. 

This strategy is efficient in may problems:

- Given a graph, are two given nodes are connected? This question, is equivalent to ask, given two nodes, is there a path from node a to b? if so, find me the path (in terms of sequence of nodes of course)!
- How many connected components does the graph have?

All right, let's try to solve a find path problem using DFS.

Here is one question: given a graph, node a, calculate *one* path between a and the rest of the nodes, if no path, return None.

So let's start with a recursive way, which is the nature of DFS. 

```python=
def path_view(nodes, edge_to: dict, source):
    """ convert edge_to to path view """
    _paths = {}

    for node in nodes:
        if node in edge_to:  # has a path
            path = []
            _next = node
            while _next != source:
                path.append(_next)
                _next = edge_to[_next]
            path.append(source)
            _paths[node] = path

        else:
            _paths[node] = None   # no path

    return _path
    

def dfs_path(graph, source):
    """ get paths from source to other nodes.

    edge_to is a parent-link representation of the tree which has source as root.
    Note: not all the path, but one of the path if exist

    :param graph: Graph
    :param source: the source node
    :return:
    {target: [source, x, x, node2]}
    """
    visited = set()
    edge_to = {}  # magic path..

    def _dfs_path(graph, start):
        for _node in graph[start]:  # all its neighbour
            if _node in visited:
                continue
            visited.add(_node)
            edge_to[_node] = start
            _dfs_path(graph, _node)

    # DFS
    _dfs_path(graph, source)

    return path_view(graph.nodes, edge_to, source)
```

## Breadth-first search

Breadth-first search use a different strategy from depth-first search. It will search all the connected nodes and do the same process to sub-nodes. While depth search will go down a path to the end.

```python=
def bfs_path(graph, source):
    """ a breadth first search for paths. These suppose to be the shortest paths.

    edge_to is a parent-link representation of the tree which has source as root.

    Reference
    ---------
    <Algorithms 4th edition> by Robert Sedgewick. P540

    :param source: a source node
    """
    _queue = deque([])
    _visited = set()
    _queue.append(source)
    _edge_to = {source: source}
    while _queue:
        cur_node = _queue.popleft()
        for child in graph[cur_node]:
            if child in _visited:
                continue

            _visited.add(cur_node)
            _edge_to[child] = cur_node
            _queue.append(child)

    return path_view(graph.nodes, _edge_to, source
```