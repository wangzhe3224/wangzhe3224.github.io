---
title: Python3 10的新特性
tags: Python
categories: Coding
date: 2021-05-15
---

# Python3.10的新特性！

新版本的Python 3.10主要有三个大变化：
- 增加模式匹配
- 更好的错误提示
- 更好的类型检查


## 结构化模式匹配

模式匹配主要通过`mathc`和`case`关键字，具有如下实现方法：

```
match subject:
    case <pattern_1>:
        <action_1>
    case <pattern_2>:
        <action_2>
    case <pattern_3>:
        <action_3>
    case _:
        <action_wildcard>
```

模式匹配大大增加了控制流的清晰度和表达能力:

比如：

```python=
command = input()
match command.split():
    case ["quit"]:
        quit()
    case ["load", filename]:
        load_from(filename)
    case ["save", filename]:
        save_to(filename)
    case _:
        print (f"Command '{command}' not understood")
```

也可以匹配类型：

```python
match media_object:
    case Image(type=media_type):
        print (f"Image of type {media_type}")
```

还可以配合守卫使用：

```python=
match point:
    case Point(x, y) if x == y:
        print(f"The point is located on the diagonal Y=X at {x}.")
    case Point(x, y):
        print(f"Point is not on the diagonal.")
```

## 更好的错误提示

Python3.9采用了新的Parser，这给3.10更加人性的错误提示奠定了基础。

比如在3.8，如下代码的错误提示：

```
print ("Hello"
print ("What's going on?")

  File ".\test.py", line 2
    print ("What's going on?")
    ^
SyntaxError: invalid syntax
```

而在3.10中：

```
  File ".\test.py", line 1
    print ("Hello"
          ^
SyntaxError: '(' was never closed
```

在比如：

```
{x,y for x,y in range(100)}
  File "<stdin>", line 1
    {x,y for x,y in range(100)}
     ^
SyntaxError: did you forget parentheses around the comprehension target?
```

## 更好的类型检查支持

增加了ParamSpec和TypeVar，可以让函数的类型检查再有装饰器的情况下正常工作。

```python=
from typing import Awaitable, Callable, ParamSpec, TypeVar

P = ParamSpec("P")
R = TypeVar("R")

def add_logging(f: Callable[P, R]) -> Callable[P, Awaitable[R]]:
  async def inner(*args: P.args, **kwargs: P.kwargs) -> R:
    await log_to_database()
    return f(*args, **kwargs)
  return inner

@add_logging
def takes_int_str(x: int, y: str) -> int:
  return x + 7

await takes_int_str(1, "A") # Accepted
await takes_int_str("B", 2) # Correctly rejected
```

## 其他：

- 新的union type表达：`A|B`
- 多重上下文


## Ref

- https://docs.python.org/3.10/whatsnew/3.10.html