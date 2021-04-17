---
title: Palindrome Pairs and the Trie
tags: [Tree]
categories: Leetcode
date: 2021-04-17
---

# Prefix tree

- [208. Implement Trie (Prefix Tree)](https://leetcode.com/problems/stream-of-characters/) 
- [1032. Stream of Characters](https://leetcode.com/problems/implement-trie-prefix-tree/)
- [336. Palindrome Pairs](https://leetcode.com/problems/palindrome-pairs/)

这两个题都提到了一种树：Trie，也叫做 prefix tree 或者 digital tree，属于所搜树的一种。通常用于字符串的分段搜索，也可以用来做输入提示，即给出一些字母，搜索后续可用的路径。搜索方式属于 DFS，每个节点可以通过带有一些属性，从而实现其他功能，比如不同的action等等。

第三题呢，乍一看跟 Trie 没关系但是，用 Trie 可以大大提高效率。

第一个题是中等，后两个都是困难题。

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
        cur.is_end = True

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
## 336. Palindrome Pairs

**问题**

> Given a list of unique words, return all the pairs of the distinct indices (i, j) in the given list, so that the concatenation of the two words words[i] + words[j] is a palindrome.

**例子**

```
Example 1:

Input: words = ["abcd","dcba","lls","s","sssll"]
Output: [[0,1],[1,0],[3,2],[2,4]]
Explanation: The palindromes are ["dcbaabcd","abcddcba","slls","llssssll"]
Example 2:

Input: words = ["bat","tab","cat"]
Output: [[0,1],[1,0]]
Explanation: The palindromes are ["battab","tabbat"]
Example 3:

Input: words = ["a",""]
Output: [[0,1],[1,0]]
```

**思路**

我们可以暴力解，即`O(k*n^2)`，反复遍历检查。k 是词的长度，如果 n 远远大于 k，这个算法的效率就会非常低。

假设我们考虑两个词，A和B。检查 A+B 是否形成回文，怎么办呢？首先，我们看 `A[0] ?= B[-1]`，如果是，继续看；如果不是，即可确定他们不能形成回文。所以，当我们再检查一个词是否可以与给出词组形成回文的时候，我们可以只看那些词头和词尾相同的词，缩小所搜范围。同样的思路可以进一步延伸☞倒数第二个，倒数第三个。。。字母。

实际上这就形成了一个多级的map，用来缩小搜索范围。这个多级map也就是 Trie 的数据结构。

我们反向构造一个 Trie，每个节点有一个flag表示到这个node为止是否形成了一个词。当我们拿到以一个词A，需要与 trie 路径上的词匹配的时候，有两种情况：

1. 匹配词长度 <= A的长度
2. 匹配词长度 >  A的长度

假设我们有一个 word list： `['acbe', 'ca', 'bca', 'bbac']`，反向可以形成如下 Trie：

![](https://i.imgur.com/wn2uMo1.jpg)

现在我们看情况1：匹配词长度 <= A的长度，假设我们搜索 `acbe` 可以匹配出回文的词。首先，我们选择 `a` 开头的path，因为其他path没有可能。然后看 `c`，也发现了一个路径，而且c有index标记，是一个终端词。这时候，我们检查余下的部分be是否是回文（也就是看这个组合`acbe + ac`），发现不是回文，继续看下一个字母b，又发现了一个路径，且是终端词，检查余下的部分，`e`，是回文（只有一个字母），此时我们就发现了一组，即`acbe + bca`（记得我们的Trie是逆向构建的，acb就是词bac）。

继续看情况2：匹配词长度 >  A的长度，假设我们搜索`ca`的可能匹配。选择了上图中间的路径，不过因为ca短，没有到达任何一个词，但是这样也意味着，ca可能跟这个路径上剩下词形成回文，只要剩下的部分是回文。

**代码**

```python=
def is_palindrome(w):
    return w == w[::-1]

class Trie1:
    def __init__(self):
        self.children = defaultdict(Trie1)
        self.index = -1
        self.palindrome_below = []

    def add_word(self, word, index):
        trie = self
        for i, c in enumerate(reversed(word)):
            if is_palindrome(word[0:len(word)-i]):
                trie.palindrome_below.append(index)
            trie = trie.children[c]
        trie.index = index

def make_trie(words):
    trie = Trie1()
    for i, word in enumerate(words):
        trie.add_word(word, i)
    return trie

def get_palindrome(trie, word, index):
    res = []
    while word:
        if trie.index >= 0:
            if is_palindrome(word):
                res.append(trie.index)
        if not word[0] in trie.children:
            return res

        trie = trie.children[word[0]]
        word = word[1:]

    if trie.index >= 0:
        res.append(trie.index)
    res.extend(trie.palindrome_below)
    return res

def solution(words):
    trie = make_trie(words)
    res = []
    for i, word in enumerate(words):
        selected = get_palindrome(trie, word, i)
        res.extend([i, c] for c in selected if i!=c)
    return res
```

## ref

- https://fizzbuzzed.com/top-interview-questions-5/
