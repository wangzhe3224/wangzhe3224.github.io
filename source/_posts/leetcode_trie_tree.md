---
title: Prefix tree
tags: [Tree]
categories: Leetcode
date: 2021-04-15
---

# Prefix tree

- [208. Implement Trie (Prefix Tree)](https://leetcode.com/problems/stream-of-characters/) 
- [1032. Stream of Characters](https://leetcode.com/problems/implement-trie-prefix-tree/)

这两个题都提到了一种树：Trie，也叫做 prefix tree 或者 digital tree，属于所搜树的一种。通常用于字符串的分段搜索，也可以用来做输入提示，即给出一些字母，搜索后续可用的路径。搜索方式属于 DFS，每个节点可以通过带有一些属性，从而实现其他功能，比如不同的action等等。

## 208. Implement Trie (Prefix Tree)

**问题**

> A trie (pronounced as "try") or prefix tree is a tree data structure used to efficiently store and retrieve keys in a dataset of strings. There are various applications of this data structure, such as autocomplete and spellchecker.
> Implement the Trie class:
> Trie() Initializes the trie object.
> void insert(String word) Inserts the string word into the trie.
boolean search(String word) Returns true if the string word is in the trie (i.e., was inserted before), and false otherwise.
boolean startsWith(String prefix) Returns true if there is a previously inserted string word that has the prefix prefix, and false otherwise.

**例子**

```
Input
["Trie", "insert", "search", "search", "startsWith", "insert", "search"]
[[], ["apple"], ["apple"], ["app"], ["app"], ["app"], ["app"]]
Output
[null, null, true, false, true, null, true]

Explanation
Trie trie = new Trie();
trie.insert("apple");
trie.search("apple");   // return True
trie.search("app");     // return False
trie.startsWith("app"); // return True
trie.insert("app");
trie.search("app");     // return True
```

**思路**

此题就是实现一个`prefix tree`。我们采用字典构造树，基本插入算法是：对每一个词，构建一个path，path上的节点就是词内的字母，这些字母节点可以被很多词共享。搜索操作就是按照字母顺序遍历树的path，如果遍历成功到达一个leaf节点，搜索成功，否则失败，中途一旦发现不能继续，直接失败。对于 prefix 操作，思路与搜索类似，只不过不需要到达一个leaf节点，只要所有的字母都在某一个path即可。

其实，此题就算不清楚prefix tree的存在也是可以思考的。因为这个问题明显是一个搜索问题，搜索无非就是线性、树状或者图三种。这题由于涉及路径搜索，即给出一个字母序列，能在已有的结构中找到一个路径吗？找路径就是搜索树。

**代码**

```python=
from typing import List
from collections import defaultdict

class Trie:

    def __init__(self):
        """
        Initialize your data structure here.
        """
        class Node:
            def __init__(self):
                self.children = collections.defaultdict(Node)
                self.end = False
        
        self.tree = Node()
        

    def insert(self, word: str) -> None:
        """
        Inserts a word into the trie.
        """
        cur = self.tree
        for c in word:
            cur = cur.children[c]
        cur.end = True
        

    def search(self, word: str) -> bool:
        """
        Returns if the word is in the trie.
        """
        cur = self.tree
        for c in word:
            if c not in cur.children:
                return False
            else:
                cur = cur.children[c]
        
        return cur.end
        

    def startsWith(self, prefix: str) -> bool:
        """
        Returns if there is any word in the trie that starts with the given prefix.
        """
        cur = self.tree
        for c in prefix:
            if c not in cur.children:
                return False
            else:
                cur = cur.children[c]
        
        return True
```

## 1032. Stream of Characters

**问题**

> Implement the StreamChecker class as follows:
>
> StreamChecker(words): Constructor, init the data structure with the given words.
query(letter): returns true if and only if for some k >= 1, the last k characters queried (in order from oldest to newest, including this letter just queried) spell one of the words in the given list.


**例子**

```
StreamChecker streamChecker = new StreamChecker(["cd","f","kl"]); // init the dictionary.
streamChecker.query('a');          // return false
streamChecker.query('b');          // return false
streamChecker.query('c');          // return false
streamChecker.query('d');          // return true, because 'cd' is in the wordlist
streamChecker.query('e');          // return false
streamChecker.query('f');          // return true, because 'f' is in the wordlist
streamChecker.query('g');          // return false
streamChecker.query('h');          // return false
streamChecker.query('i');          // return false
streamChecker.query('j');          // return false
streamChecker.query('k');          // return false
streamChecker.query('l');          // return true, because 'kl' is in the wordlist
```

**思路**

此题的关键在于我们不断读入新的字母，形成一个字母序列，我们需要反向搜索当前stream形成的path是不是在我们的树上。所以，对于给出的词，我们需要逆向构造。而且我们需要每个节点包含一个`is_end`flag用来表明当前这个节点是不是一个词。

**代码**

```python=
class Node:
    __slots__ = ["children", "is_end"]
    def __init__(self):
        self.children = defaultdict(Node)
        self.is_end = False


def build_tree(words):

    # 给出一个词的列表，我们需要构造一个搜索树
    root = Node()

    for w in words:
        cur = root 
        w = w[::-1]
        for char in w:
            cur = cur.children[c]
        # cur is now the end of the path
        cur.is_word = True

    return root


class StreamChecker:

    def __init__(self, words: List[str]):
        '''
        Build a trie for each word in reversed order
        '''
		
        # for user query record, init as empty string
        self.prefix = ''
        
        # for root node of trie, init as empty Trie
        self.trie = build_tree(words)
            
    def query(self, letter: str) -> bool:
        '''
        Search user input in trie with reversed order
        '''
		
        self.prefix += letter
        
        cur_node = self.trie
        for char in reversed(self.prefix):
            
            if char not in cur_node.children:
                # current char not in Trie, impossible to match words
                break
            
            cur_node = cur_node.children[char]
        
            if cur_node.is_end:
                # user input match a word in Trie
                return True
        
        # No match
        return False
```


###### tags: `Leetcode` `Tree`