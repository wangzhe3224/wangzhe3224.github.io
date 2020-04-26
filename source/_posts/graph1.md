---
title: Graph basics - 1 Concepts
date: 2020-04-25
tags: [Data Structure, Graph]
categories: Coding
---

Graph is a mathematical object to model pairwise connections between objects. There are a lot of applications:

![Typical graph applications](https://i.imgur.com/aDYbUMC.png)

<!--more-->

# 1. Definitions

{% note info %}
Definition: 
- A `graph` is a set of vertices and a collection of edges that each connect a pair of vertices.
- A `Bipartite graph` is a graph whose vertices we can divide into two sets such that all edges connect a vertex in one set with a vertex in the other set.

Definition: 
- A `path` in a graph is a sequence of vertices connected by edges. 
- A `simple path` is one with no repeated vertices. 
- A `cycle` is a path with at least one edge whose first and last vertices are the same.
- A `simple cycle` is a cycle with no repeated edges or vertices.
- *length* of a path or cycle is its number of edges.

Definitions:
- A graph is `connected` if there is a path from every vertex to every other vertex in the graph.
- A graph is `not connected` consists of a set of connected `components`, which are maximal connected subgraphs. 
- An `acyclic` graph is graph without cycles.

Definitions:
- A `tree` is an `acyclic connected` graph.
- A disjoint set of trees is called a `forest`.

Definitions:
- The `density` of a graph is the proportion of possible pairs of vertices that are connected by edges.
{% endnote %}

![Anatomy of a graph](https://i.imgur.com/goP5flX.png)

![A tree](https://i.imgur.com/RHAkNfF.png)

![A forest](https://i.imgur.com/zRy67JE.png)

# 2. Graph Interface

We now need to define fundamental graph operation interface and find a data structure to represent undirected graph.

```python=
from abc import abstractmethod
class Vertex:
    """ Vertex """

class Edge:
    """ Edge """
    
class GraphOperation:
    """ Graph operation interface """
    
    @abstractmethod
    def add_edge(v: Vertex, m: Vertex)->None:
        """"""
    
    @abstractmethod
    def adj(v: Vertex) -> []:
        """ find adjacent to v """
        
    def degree(v: Vertex) -> int:
        """ get degree of """
        
    def count_self_loops() -> int:
        """ number of self loops """
```

In the end, most of the operations can be done via `adj` method. We could add more operations for graph, but it will depends on the application's use case. 

# 3. Data Structures

There are several ways to represent graph, such as adjacent matrix, array of edges, and adjacent list. Here we select adjacent list because it makes `adj` method very simple and it will also be able to represent parallel edges whereas adjacent matrix cannot do.

`adjacent list` representation has following characteristics:

- space usage is proportional to V + E
- constant time to add an edge
- constant time per adjacent vertex processed

However, the order of adjacent vertex is random for now. We could add order for it (but add some time complex).

```python=
class UndirectedGraph(GraphOperation):
    """  """
    
    def __init__():
        self.__adj_list = []  # type: List[Vertex]
```

![Adjacent list representation](https://i.imgur.com/G0aulAp.png)