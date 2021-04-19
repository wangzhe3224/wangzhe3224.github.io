---
title: 一个简单的算术 LL1 Parser
tags: [LL1]
categories: Compiler
date: 2021-04-19
---

# 一个简单的算术 LL(1) Parser

这篇文章探索如何手写一个简单的算术表达式 Parser。

## 问题

我们要解决的问题是把一个算术表达式字符串转化成语法树（Abstract Syntax Tree，AST），就像通用计算机语言一样，然后evaluate该AST。算术表达式包含：`+ - * / ( )` 以及数字。

## LL(1) Parsing

这里我们采用LL(1）parsing。LL(1) parser 属于自顶向下的分析器，分析时不断用当前匹配的规则对分析器栈顶的元素进行替换。我们需要如下两个信息来进行分析：

- 分析器栈顶的词法单元（token），要么是终端字符（Terminal），要么是非终端字符（Non-Terminal）。比如 `+` 就是终端字符，而非终结字符就是语法规则左手侧的，比如 `Exp`。
- 当前正在处理的终结词法单元

比如当前的栈顶单元是`S`，而当前处理的终结字符是`a`，同时我们以这样一个语法规则：`S -> a P`。这时，我们需要将`S`替换成`a P`，其中`S`和`P`都是非终端字符，而`a`是终端。

## 语法

```
1. Exp -> Exp [ + | - ] Exp2
2. Exp -> Exp2
3. Exp2 -> Exp2 [ * | / ] Exp3
4. Exp2 -> Exp3
5. Exp3 -> ( Exp )
6. Exp3 -> Num
```

按照上述语法，我们展开`2+3*4`： 

```
Exp
1. Exp + Exp2
2. Exp2 + Exp2
3. Exp3 + Exp2
6. Num + Exp2
3. Num + Exp2 * Exp3
4. Num + Exp3 * Exp3
6. Num + Num * Exp3
6. Num + Num * Num
```

不过目前这个语法，我们还不能用`LL(1)`分析器分析，因为 LL1 要求只能每次看一个词法单元，而我们的语法的右手侧不是唯一的。我们需要重写语法：

```
1. S      -> Exp $
2. Exp    -> Exp2 Exp'
3. Exp'   -> [ + | - ] Exp2 Exp'
4. Exp'   -> none
5. Exp2   -> Exp3 Exp2'
6. Exp2'  -> [ * | - ] Exp3 Exp2'
7. Exp2'  -> none
8. Exp3   -> num
9. Exp3   -> ( Exp )
```

## 实现

首先定义词法单元，和AST节点。

```python=
import enum
import re

class TokenT(enum.Enum):
    T_NUM = 0
    T_PLUS = 1
    T_MINUS = 2
    T_MULT = 3
    T_DIV = 4
    T_LPAR = 5
    T_RPAR = 6
    T_END = 7


class Node:
    def __init__(self, token_t, value=None):
        self.token_t = token_t
        self.value = value 
        self.children = []
```

然后我们写词法器，Lexer：

```python=
def lex(exp):
    mapping = {
        "+": TokenT.T_PLUS,
        "-": TokenT.T_MINUS,
        "*": TokenT.T_MULT,
        "/": TokenT.T_DIV
    }

    tokens = []
    for c in exp:
        if c in mapping:
            token_t = mapping[c]
            token = Node(token_t=token_t, value=c)
        elif re.match(r"\d", c):
            token = Node(TokenT.T_NUM, value=int(c))
        else:
            raise ValueError(f"Unknow token {c}")
        
        tokens.append(token)

    tokens.append(Node(TokenT.T_END))
    return tokens
```

然后我们按照上面的语法写分析器：

```python=
def match(tokens, token):
    if tokens[0].token_t == token:
        return tokens.pop(0)
    else:
        raise


def parse_e(tokens):  # + -
    left_node = parse_e2(tokens)

    while tokens[0].token_t in [TokenT.T_PLUS, TokenT.T_MINUS]:
        node = tokens.pop(0)
        node.children.append(left_node)
        node.children.append(parse_e2(tokens))
        left_node = node

    return left_node


def parse_e2(tokens):  # * /
    left_node = parse_num(tokens)

    while tokens[0].token_t in [TokenT.T_MULT, TokenT.T_DIV]:
        node = tokens.pop(0)
        node.children.append(left_node)
        node.children.append(parse_num(tokens))
        left_node = node

    return left_node

def parse_num(tokens):  # num
    if tokens[0].token_t == TokenT.T_NUM:
        return tokens.pop(0)

    match(tokens, TokenT.T_LPAR)
    expression = parse_e(tokens)
    match(tokens, TokenT.T_RPAR)

    return expression


def parse(inputs):
    # 返回语法树
    tokens = lex(inouts)
    ast = parse_e(tokens)
    match(tokens, TokenT.T_END)
    return ast
```

当我们得到语法树后，就可以实现计算了：

```python=
ops = {
    TokenT.T_PLUS: lambda x,y: x+y,
    TokenT.T_MINUS: lambda x,y: x-y,
    TokenT.T_MULT: lambda x,y: x*y,
    TokenT.T_DIV: lambda x,y: int(x/y),
}

def compute(node):
    if node.token_t == TokenT.T_NUM:
        return node.value
    
    left = compute(node.children[0])
    right = compute(node.children[1])
    return ops[node.token_t](left, right)
```

比如：

```python=
strings = "1+2*(3-5)"
ast = parse(strings)
res = compute(ast)
print(res)
# output: -3
```

## Ref

- https://github.com/gnebehay/parser/blob/master/parser.py