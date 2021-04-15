---
title: Calculator 123
tags: [Stack]
categories: Leetcode
date: 2021-04-15
---

# Calculator I,II,III

问题：

```
Given a string s which represents an expression, evaluate this expression and return its value. 

The integer division should truncate toward zero.
```

例子：

```
Example 1:

Input: s = "3+2*2"
Output: 7
Example 2:

Input: s = " 3/2 "
Output: 1
Example 3:

Input: s = " 3+5 / 2 "
Output: 5
```

思路：

这道题检测的是栈的使用，基本策略是一个一个的过char，如果看见数字，就累加数字（考虑进位），如果看见操作符号：比如 + -，就把当前结果进栈；如果看见 * / 就从栈顶取出一个数字，操作后进栈。过程中需要保存的状态：上一个符号，当前的整数。

```python=
class Solution:
    def calculate(self, s: str) -> int:
        idx, stack = 0, []
        res = 0     # 当前的数字
        sign = '+'  # 前一个符号
        
        def update(op, v):
            if op == "+": stack.append(v)
            if op == "-": stack.append(-v)
            if op == "*": stack.append(stack.pop() * v)           #for BC II and BC III
            if op == "/": stack.append(int(stack.pop() / v))      #for BC II and BC III
    
        while idx < len(s):
            if s[idx].isdigit():
                res = res*10+int(s[idx])
                print(res)
            elif s[idx] in '+-*/':
                update(sign, res)
                print(res, sign)
                res, sign = 0, s[idx]
                print(res, sign)
                print(stack)
            idx += 1
        
        # 这里不要忘记，因为还有最后一个符号没有处理
        update(sign, res)
        print(stack)

        return sum(stack)
```

对于有括号的情况，我们需要用到递归，把括号内部的表达式当做一个子问题处理。当遇到左括号的时候，递归计算后面的表达式；遇到右括号的时候，update 函数，然后返回结果以及下一个步的index。

```python=
            elif s[it] == "(":                                        # For BC I and BC III
                num, j = self.calculate(s[it + 1:])
                it = it + j
            elif s[it] == ")":                                        # For BC I and BC III
                update(sign, num)
                return sum(stack), it + 1
```