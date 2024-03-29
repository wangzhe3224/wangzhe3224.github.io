---
title: 如何选择（第一）下一个语言
categories: Coding
date: 2021-12-07
---

如何选择你的第一门（或者下一门）计算机语言？这是一个重要的问题。

- [选择语言](#选择语言)
- [硬件抽象层次](#硬件抽象层次)
  - [硬件直接抽象](#硬件直接抽象)
  - [硬件独立抽象](#硬件独立抽象)
  - [中级语言](#中级语言)
  - [带复杂运行时的预言](#带复杂运行时的预言)
  - [解释型语言](#解释型语言)
  - [更高级的抽象](#更高级的抽象)
- [语言的灵活度](#语言的灵活度)
  - [想干啥干啥](#想干啥干啥)
  - [一些偶尔很烦人的约束](#一些偶尔很烦人的约束)
  - [一些合理的约束](#一些合理的约束)
- [写给选择第一门语言的人](#写给选择第一门语言的人)
- [写给选择下一门语言的人](#写给选择下一门语言的人)

为什么重要？因为现在市面上的计算机语言太多了！看一下计算机语言指数，大家喜闻乐见的语言都不下10种了，且不说一些比较小众的语言。不花时间，我们很难弄清楚这些语言之间的区别，或者弄清楚那个语言更是我们的需求。这篇小文就尝试给大家一个选择语言的方向。

![计算机语言指数](https://raw.githubusercontent.com/wangzhe3224/pic_repo/master/images/20211207153533.png)

当然，也有很多时候，你并没有什么选择，你只能用你公司或者课程指定你用的语言 ：）

## 选择语言

当我们有一堆东西要选择的时间，最明智的做法是首先归类。谈到语言的归类，最先映入脑海的就是所谓”编程范式“。比如，我们经常听到：面向过程、面向对象、或者函数式等等。但是，一会儿我们就会发现，现代语言多数都是多范式的，不同范式之间的界限也没有那么明确。相反，现代计算机语言可能在抽象、生态上更加能够区分彼此，而不是范式。

在我们开始选择语言之前，还有一点我觉得值得说明，即**所有的语言几乎都是等价的，他们可以做的事情是相同的**，比如打印、计算、IO等等。他们不同的地方在于你可以如何做这些事情。比如有一些语言更加适合做数值计算，有一些语言更加适合做高并发网站后台，而另一些语言则适合做网页或者移动端应用。

**所以，在选择一个语言之前，最好先弄清楚你想做什么事情。**

以下我们从两个层面给语言分类，然后介绍每一个门类下面的特征和语言，也许在哪之后我们就可以选择我们”心仪“的语言了。

## 硬件抽象层次

市面上的语言可以按照他们对硬件的抽象程度做一个比较明确的分类，一般来讲如果一个语言暴露给程序员许多硬件层面的控制，比如内存、寄存器，这类语言我们称之为”低级语言“（Low level）；如果一个语言更多地隐藏了计算机硬件的属性，就成为”高级语言”（High Level）。显然，低级语言和高级语言没有好坏之分，他们提供了截然不同的硬件抽象层次。

通常，抽象是有性能代价的（速度或者内存），高级语言的性能低于低级语言。值得指出的是，即使是高级语言，在目前的硬件支持下，性能也足够满足大部分应用程序的需求了。这也是为什么在那个计算资源匮乏的时代（上个世纪80年代），大部分语言现在看起来都属于低级语言。

我们0抽象说起：

### 硬件直接抽象

在这个层次，硬件直接直接暴露给我们，`汇编语言`生活在这里。因为它几乎把每一个CPU指令都提供给你，你可以精确的控制CPU执行那个指令，访问内存的哪一个地址等等。你可以明确的告诉计算机，把这个整数存入存入内存的0xxxxx地址，然后把寄存器a的数字和寄存器b的数字相加，把结果存入寄存器c。

这种抽象级别的语言，`汇编`，通常用于非常底层的程序，比如操作系统的代码中你可能会看到一些汇编代码，再比如一些需要“榨干”机器性能的程序，例如视频解码程序。需要注意的是，汇编代码对不同的硬件架构，都是不一样的。通常一套代码只能运行在一类处理器或者硬件之上，不是很方便移植。

**你应该不会把汇编作为第一门语言**

代表语言：`汇编`

### 硬件独立抽象

在这个级别的代表语言就是 The `C` Programming Language。这类语言，仍然出于低级语言的范畴，仍然可以对硬件进行直接的操作，比如它语言程序员自己管理内存的使用情况。但是这类语言已经比汇编语言跨出了重要的一步：加入了类型（描述内存里面装了什么东西）、函数（可以重复使用的代码）和循环（可以循环执行的代码）。

另一个重要的特点是，这类语言通常是**编译型**语言，即源代码会被**编译器**按照不同的平台和系统，编译成不同的二进制可执行文件。正式因为编译器，这类语言的源代码可以跨平台使用。

这类语言本身通常比较简单，仅提供很少的功能，运行性能比较稳定，基本上你写什么，他执行什么，很透明。而且，他们的运行性能通常非常高，与汇编有的一拼。而弊端就是，如果业务逻辑很复杂，你需要写很多代码，而且需要运用自己的大脑管理内存（我们并不是很擅长）。

**如果，你的使用场景对性能又很高要求，你可以选择这类语言**

代表语言：`C`

### 中级语言

再增加一些抽象，我们就来到了“中级语言”。这类语言通常的特征是：

- 闭包（Closure）：运行时的动态函数
- 半自动内存管理（运行时或者编译时）：智能指针（C++），引用计数（Swift）或者所有权（Rust）
- 更加复杂的类型系统：更好的实现代码复用，减少代码量
  - 泛型
  - 多态

**如果你对性能有要求，同时希望做更加复杂的业务逻辑，增加代码的清晰度，可以选择**

这类语言包括：`C++`, `Swift`, `Rust`

### 带复杂运行时的预言

进一步增加抽象，就需要语言提供一个自己的运行时系统（runtime），这就意味着你写好的源代码并不是最后执行程序全部，语言的运行时会跟你的代码一起运行，目的是为你提供方便，让你的代码写起来更加轻松。运行时的代表包括：垃圾回收期（GC），一个帮助你自动回收内存的程序；协程，比如Go的Goroutine，一个帮助你轻松并发的系统。当然，这些抽象跟中级语言中的抽象不同，他们有较大的性能花费（当然仅仅是相对的，这里谈到的花费通常是毫秒或者MB级别的内存）。他们带来的好处确实很大，比如GC可以大大减少处理内存的代码，同时可以避免内存管理错误（比如段错误）。

这类语言占据了编程语言的主流：`Java + JVM`, `Scala`, `Go`, `C# + .Net`, `Ocaml`, `Haskell`

**如果，你不知道你的应用场景，多半你可以在这里挑一个。。**

### 解释型语言

这类语言的性能比之前提到的语言会降低较多，但是好处是，这些语言可以一部分一部分的执行，即在运行过程中，可以进行更多动态的操作。这类语言写起来非常快，很容易就可以形成代码，而且运行时通常可以改编类型，这让编程变得特别轻松。不过，由于缺少编译器的帮助，这些语言更容易出现运行时的
Bug。

这类语言包括：`Python`, `Javascript`, `PHP`, `Ruby` ...

**如果你关心快速实现程序，或者你需要他们的生态，选择解释类语言吧**

### 更高级的抽象

当我们进一步抽象，我们的语言可以直接脱离硬件，只思考数据结构和算法问题。其实很多解释型语言也可以放在这个分类里面。不过这里我想说另一类语言：声明式语言。

之前提到的语言中，我们的程序往往给出一系列执行，告诉计算机我们希望如何一步一步执行程序，计算结果，而声明式语言中我们更强调描述我们希望进行那种计算，而把具体如何计算交给语言的运行时和编译器去完成。这种方式更加方便人类去思考，因此也可以减少错误和Bug，在某些情况下，这类语言的性能甚至可以跟中级语言一样好，因为编译器会进行优化。这类语言通常是带运行时的。

这类语言包括：`Haskell`, `Ocaml`, `F#`, `Lisp`, `SQL`


## 语言的灵活度

从抽象层面看语言，可以为我们选择语言提供一些指导。这里我们换一个维度看不同的语言，就是语言的灵活程度。声明，不是灵活度高就更好。

### 想干啥干啥

这了语言不是很严格，你基本可以做你想做的任何事情。比如，你可以写 `x = 1 + 's'`，你的程序会开心的执行，但是有有可能出一个运行时bug，如果你没有定义如何把一个整数和一个字符相加的话。通常这类语言都是**动态类型**或者**解释型**，你可以一直通过 `运行 - 出错 - 修改 - 运行` 这样的循环快速的迭代程序，当然，当程序的变得越来越大，你会感觉力不从心，想要一个编译器。

这类语言：`Javascript`, `Ruby`。 也有一些稍微严格一点的：`Python`, `TypeScript`等等

### 一些偶尔很烦人的约束

这类语言会给你增加一点约束，已免你写出明显有问题的代码。比如你定义了一个函数：`func(int, int) -> int`，那么你就不能写 `func(1, '2')`，编译器会不高兴，然后告诉你你错了。这类语言通常被称为：**静态类型**或者**编译型**。

这类语言：`Go`, `C/C++`, `Java`...

### 一些合理的约束

有一些语言会提出更加多的约束，不仅仅为了避免类型错误，还会试图避免一些可能的运行时错误。比如，`Rust`，默认不运行改变变量的值，除非你明确的说你要改变它，以防止不必要的问题；Rust还会检查你的内存管理是不是合理等等。

这类语言包括：`Rust`, `Haskell`, `Ocaml/F#`, `Swift` 


## 写给选择第一门语言的人

如果你刚刚接触编程，也不知道未来想要做什么样的程序，选择一个语言挺难的。不过，如果你觉自己希望花些时间好好学习计算机，我建议你学习一个低级语言，比如 `C`，因为他会帮助你理解计算机硬件和程序之间的关系，为你以后的学习打好基础，比如操作系统。当然，如果你有一些工科背景或者数学背景，希望通过编程快速的做一些事情，那么可以选择一个高级语言，比如 `Python`。

还有一个选择语言的维度是：生态。我举个例子，机器学习。大部分的机器学习生态都是围绕Python建立的，那么学习Python就是你最好的选择了。

## 写给选择下一门语言的人

只有一条建议：选择一个不是你熟悉的分类下的语言学习。
