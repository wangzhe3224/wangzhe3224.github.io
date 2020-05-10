---
title: Graph - DiGraph 
date: 2020-05-09
tags: [Data Structure, Graph, Algorithms, Python]
categories: Coding
---

# 1. Concepts

**Definition.** A `directed graph` or `digraph` is a set of nodes and a 
collection of `directed edges`. Each directed edge connects an ordered 
pair of nodes.

**Definition.** A `directed path` is a path in a digraph is a sequence of nodes in which there is a directed edge pointing from each node in the sequence to its successor in the sequence. A `directed cycle` is a directed path with at least one edge whose first and last nodes are the same. A `simple cycle` is a cycle with no repeated edges or nodes. The `length` of a path is its number of edges.

With above, we can define that a node a is reachable from node b if there is a directed path from a to b. 

# 2. Data Structure

Again, before we go to the algorithms of DiGraph, let's define our data structure representation of digraph. Full code can be found here: https://github.com/wangzhe3224/pygraph/blob/master/pygraph/entities/digraph.py.

Here I list the important part. DiGraph is a bit different from Undirected graph in terms of its internal data containers. DiGraph has not only `_adj` for adjacent list, but also has `_succ` and `_pred` which is used to represent the direction of edges. What's more, there is a `reverse` function to reverse the direction of the edges in the graph.

```python=
from typing import Hashable

from pygraph.entities.graph import GraphBase


class DiGraph(GraphBase):
    """"""

    dict_dict_dict = dict
    dict_dict = dict
    node_factory = dict
    edge_factory = dict

    def __init__(self, **kwargs):
        """"""
        super().__init__(kwargs)
        self._succ = self._adj
        self._pred = self.dict_dict_dict()

    def add_node(self, node: Hashable, **kwargs):
        """ Add node to graph,
        :param node:
        :param kwargs: node's meta data
        :return:
        """
        if node not in self._succ:
            self._succ[node] = self.dict_dict()
            self._pred[node] = self.dict_dict()
            attr_dict = self._nodes[node] = self.node_factory()
            attr_dict.update(kwargs)
        else:  # already existed
            self._nodes[node].update(kwargs)

    def add_edge(self, node_a: Hashable, node_b: Hashable, **kwargs):
        """ add edge to graph
        :param node_a:
        :param node_b:
        :param kwargs: meta data for edge, weights can go here!
        :return:
        """
        if node_a not in self._succ:
            self._succ[node_a] = self.dict_dict()
            self._pred[node_a] = self.dict_dict()
            self._nodes[node_a] = self.node_factory()
        if node_b not in self._succ:
            self._succ[node_b] = self.dict_dict()
            self._pred[node_b] = self.dict_dict()
            self._nodes[node_b] = self.node_factory()

        data = self._adj[node_a].get(node_b, self.edge_factory())
        data.update(kwargs)
        self._succ[node_a][node_b] = data
        self._pred[node_b][node_a] = data

    def adj_nodes(self, node: Hashable):
        """ find adj nodes view
        :param node:
        :return:
        """
        return self._succ[node]
        
    def reverse(self) -> GraphBase:
    """ reverse the graph """
    gp = self.__class__()
    for a in self.nodes:
        for b in self._adj[a]:
            gp.add_edge(b, a)

    return gp
```

# 3. Problems

Ok, let's visit some of the problems around DiGraph:

- Single-source reachability
- Topological sort
- Strong connectivity

These problem is similar to what we have in [undirected graph](https://wangzhe3224.github.io/2020/05/02/graph2_search/). 

## 3.1 Single-source reachability

> Given a digraph and a source node *a*, support query of the form: Is there a directed path from *a* to a given node *x*?
>

This problem is solved using the same function as in undirected graph. Both single-source directed path(DFS) and shortest directed path (BFS).

Related code: https://github.com/wangzhe3224/pygraph/tree/master/pygraph/algos

## 3.2 Topological sort

This is a scheduling problem. Defines:

> Given a digraph, put the nodes in order such that all its directed edges point from a node earlier in the order to a node later in the order. Or does not exist. 
> 

In order to solve this, we first need to make sure, there is no cyclic in the graph. or make sure the graph a DAG, directed acyclic graph. **So first we need a algorithm to detect cyclic in a graph.**

The solution is leverage DFS's stack, one fact is that all the node in current stack is in the same path, of we find a node that appear twice in the stack, we know there is a cyclic, hence graph is not a DAG.

Once we know we have a DAG, the next job is to find the order. It turns out that it is another application of DFS.

## 3.3 Strong connection

Strong connection between a and b is that they are mutually reachable. 

The solution is similar to cyclic detection in undriected graph, but we need loop through reverse post order in previous section. 

Check code here: https://github.com/wangzhe3224/pygraph/blob/master/pygraph/algos/cyclic.py#L28