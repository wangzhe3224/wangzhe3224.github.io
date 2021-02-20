---
title: 关于类型系统的一些思考
date: 2021-02-20
tags: [Java, Ocaml, Haskell, Python]
categories: Coding
---

## 类型系统是什么

> 类型系统是一个有多个规则组成的逻辑系统，系统内的规则会给程序中的每一个组成部分，包括变量、表达式、函数、甚至模块等等，制定一个 类型 属性。

通俗的讲，类型系统是为了赋予程序或者数据意义。因为任何值或者一个函数，在内存里面都只是一串bits，而类型就是要给这串bits意义。例如，`10` 是的类型是一个奇怪的 int 类型，这个int只有两位。类型系统会给你加额外的信息让他变成一个 int，`01|10`，这里我们假设类型占两位，01就是int的bit表达，| 用来区分类型和值。这是，10就有了意义，而且程序在编译阶段或者运行时就可以通过这个类型标识确保采用合法的操作来操作这个值。

换句话说，类型系统形成了一个除了语法（syntax）和语义（semantic）以外的另一套可以用来分析代码的系统。刚才我们也提到了，类型系统属于逻辑系统，就是通过规则（rule）可以进行推到和证明。所以我们可以肯定的说，好的类型系统可以帮助我们从逻辑角度分析程序，减少bug。因为语法和语义其实并没有办法从逻辑层面表达任何关于程序本身要做的事情。而类型系统可以发现一些逻辑错误，至少在他的rule可以推导的范围内。

有些语言只会给变量制定类型，而表达式、函数则没有类型。比如 Python 中，`if a == 1: 1 else: 2` 这个表达式是没有类型的概念的。而在 Ocaml 中，`if a=1 then 1 else 2` 这个表达式有类型 int。事实上一般函数式语言的类型覆盖会更加广泛，而过程式语言覆盖则低很多，比如表达式基本都是没有类型的。显然，类型覆盖约广泛，这个逻辑系统能提供的帮助就越多。

在实际工程中，好的类型系统会提高编译优化能力，甚至对代码重构、测试都有重要的作用。简单来讲，类型系统不但可以减少运行时的bug，还可以协助程序员进行开发。

当然，设计好的类型系统比较复杂，类型系统设计的有问题，反而会增加程序员的负担。

## 语言分类

当我们从类型系统的角度讨论计算机语言的时候，可以从如下四个维度看：
- 类型安全(type safe)，分为强和弱
- 类型表达(type expression), 分为显式和隐式
- 类型比较(type compatibility)， 一般可以有结构式(structural)和Norminal
- 类型检查(type checking), 分为静态和动态

我举几个例子帮助大家对上面四点有个感性的认知：


语言 | 类型安全 | 类型表达 | 类型比较 | 类型检查 |
| -------- | -------- | -------- | -------- | ------- |
| C        | 弱       | 显式       | Nominal  | 静态  |
| Python   | 强       | 隐式或者显式 | Structural       | 动态  |
| Java     | 强       | 显式      | Nominal  | 静态 |
| Ocaml    | 强       | 隐式或者显式 | Nominal/Structural | 静态 |

为了进一步理解，我们需要知道这四个维度的定义。

**类型安全**

一个语言是强类型安全，必须保证代码只能读取自己可以读取的内存区域，并且类型安全的代码不能对一个对象进行不合法的操作。这种保证可以是静态的，即在编译阶段，也可以是动态的，即在运行时。换个说法，类型

C语言的大部分代码是类型安全的，但是C语言的运行时不能保证类型安全，主要是因为可以进行cast操作。比如，要把指针放入array的时候，需要将指针cast成 `void*`，但是这个操作会丢失所有类型信息，当取回时，有需要 cast 回到原来的类型。由于这些cast的存在，系统运行时可能会出现意想不到的的行为。比如：

```c=
int x = 5;
char y[] = "37";
char* z = x + y;
```

这段c代码中，`z` 会指向一个内存地址，这个地址是比 `y` 地址+5 char的一个位置，这个位置可能是任何数据，但是程序本身不会直接崩溃，直到使用z的时候导致更加严重的问题，导致崩溃。而在Java中上述代码会在编译阶段报错。Python属于动态类型，类型安全也只能在运行时抛出异常。

当然这只是很简单的情况，Ocaml其实有用更加的强大的类型系统，能发现比上面这种明显问题更加不显然的逻辑错误。我们后面举例。

**类型表达**

所谓显示，就是指必须在代码中现实的写出变量的类型，比如C语言中，需要 `int a = 1;`；而在隐式语言中，比如Python，可以直接写 `a = 1`。当然对于带有类型推断的语言，比如Ocaml也可以写 `let a = 1`，不过Ocaml的类型系统已经推断出a的类型是int。Python的情况，只有在运行时才能解释器才能确定a的类型。

**类型比较**

这里主要在讨论如何说明两个变量的类型是相同的？对于Nominal类型系统，比较非常简单，只要两个类型的名字不一样，他们就是不一样的！无论他们的行为如何。但是对于Structural 类型系统，也叫 property based，只要两个类型的行为一样，他们就是一样的。对于一些存在集成的系统，比较就更加复杂了，需要更多的规则。

结构化类型最好的代表其实Python，在Python的世界里更喜欢被叫做 duck typing。我举个栗子：

```python=
class A:
    def __init__(self):
        self.a = 1

class B:
    def __init__(self):
        self.a = 1   
        
a = A()
b = B()

def dummy(o):
    print(o.a)
    
dummy(a)
dummy(b)
```

上面的代码运行完全没有问题，但是dummy函数的参数o却支持不同的类型（A和B），这就是所谓的 duck typing。

**类型检查**

这个很好理解，类型检查就是确保类型安全的过程。如果类型检查发生在编译阶段，那么就是静态类型；反之则是动态类型。

当然，也可以有另一个层面的理解，就是如果类型可以在运行时发生改变，那么就属于动态类型。Python毫无争议属于动态类型，但是Java在引入反射后，反而变得更加动态了。。。另一方面 Ocaml 的类型是完全静态的。


## 类型系统痛点

带来了那些痛点？
- （通常）需要更多的代码
- 奇葩的编译错误

*举例1：需要更多的代码*

**Python**
```python=
def truncate_reminder(x):
    int_part = int(x)
    return (int_part, x - int_part)
```
**Java**
```java=
/* 应该感谢Java终于有了泛型。。。不然这段代码的长度会扩大两倍。。。。
 * 泛型算是类型系统一个改善，Java之前的类型系统表达能力真的非常有限 。。。 */
Pair<Int, Float> truncateReminder(Float x) {
    Int intPart = Int(x);
    return (new Pair<Int, Float>(intPart, x - intPart));
}
```
**Ocaml**
```ocaml=
let truncate_reminder x = 
  let int_part = truncate x in
    (int_part, x -. float int_part)
    (* float 需要显式的写出来，不然编译器也会告诉你这个 *)
```

上面可以发现，Python代码显然是最简洁的，Ocaml其次，Java则多了很多类型标识符+泛型。Ocaml的类型系统可以进行推断，如果推断失败了，它会告诉你它需要哪些提示来完成推断，这样就即有了动态语言的简洁，又可以有用静态类型系统的好处。

*举例2： 奇葩的错误*

**Python**
```python=
len([1])
# 1
len(1)
"""
---------------------------------------------------------------------------
TypeError                                 Traceback (most recent call last)
<ipython-input-2-1cf91bb60cc0> in <module>
----> 1 len(1)

TypeError: object of type 'int' has no len()
"""
```

Ok，Python的类型错误提示还是很友好的。

**Ocaml**
```ocaml=
List.length([1])
(* 1 *)
List.length(1)
(*
Line 1, characters 11-14:
Error: This expression has type int but an expression was expected of type
         'a list
*)
```

hmm，看起来更复杂一点了，比如`'a list`是啥？需要更多关于带参类型的理解，才能读懂这段错误提示。但是起码，你看到表达式的类型是int，然而这个函数需要 类型 `a list`。（不懂无所谓现在）但是显然，类型系统需要更多的学习。

让我们来看看更加先进的Haskell:

**Haskell**

```
Prelude> :t length
length :: Foldable t => t a -> Int

-- hmm Foldable 是啥？ lenght这个函数的类型是 Foldable t => t a -> Int。 ok
-- 在看
Prelude> length [1]
1
-- ok 结果正确，但是。。。
Prelude> length 1

<interactive>:4:8: error:
    • No instance for (Num [a0]) arising from the literal ‘1’
    • In the first argument of ‘length’, namely ‘1’
      In the expression: length 1
      In an equation for ‘it’: it = length 1
```

看到最后的错误提示，你是什么感觉呢？你只是想求一个int 的长度而已。。。

## 类型系统好处

- 提高程序的性能
- 检测错误
- 指导代码重构
- 强迫不变量(Invariants)
- 让tooling变得更加简单

工程经验表明，类型系统带来的好处，远远超过了痛点。特别是对于大型、需要多人合作的项目。

## 写在最后

- 选择类型安全的语言，除非你知道你面对的是什么
- 动态类型和静态类型各有利弊
- 不同的类型系统带来的表达能力和优势完全不一样
- 类型系统也不是越复杂越高级越好

动态语言非常灵活，代码更加简洁，非常适合快速原型或者一些对正确性要求不高的项目。动态语言也更适合开发人员较少的项目。而静态类型语言则更加注重代码的正确性和性能，良好的类型系统对大型项目管理和重构都有很重要的意义，但是类型系统也意味着更多的学习。

我们从举例1可以看到，Ocaml的类型系统显然比Java的类型系统表达能力更强，更加先进。但是相应的也带来了一些学习曲线，比如 `'a list`。当然，在实际工程中，我们也要取舍选择合适复杂度的类型系统，Haskell的类型系统显然过于先进了，学习成本可能更高。

## 参考

- https://wanwenli.com/programming/2013/12/27/Type-Systems.html
- https://www.youtube.com/watch?v=0arFPIQatCU
- https://en.wikipedia.org/wiki/Comparison_of_programming_languages_by_type_system
- https://en.wikipedia.org/wiki/Type_system#Explicit_or_implicit_declaration_and_inference