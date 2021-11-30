---
title: 在VS Code中使用VIM (VIM教程)
tag: Vim
categories: Coding
date: 2021-11-30
---

- [在VS Code中使用VIM](#在vs-code中使用vim)
  - [一些基本配置](#一些基本配置)
    - [中文输入法的梦魇](#中文输入法的梦魇)
    - [按键绑定](#按键绑定)
  - [基础](#基础)
    - [模式](#模式)
    - [移动](#移动)
      - [Normal Mode](#normal-mode)
      - [Insert Mode](#insert-mode)
      - [Visual Mode](#visual-mode)
    - [页面展示](#页面展示)
    - [编辑](#编辑)
  - [常用操作](#常用操作)
  - [高级主题](#高级主题)
    - [寄存器](#寄存器)
    - [标记](#标记)
  - [插件](#插件)
    - [surround](#surround)

## 一些基本配置

:information_source: VS Code Vim 不是 Vim。不过他模拟了绝大部分的Vim操作。
但是也会出现很多支持不太好的功能，比如宏、Vim script等等。但是，就我个人的使用Code
的Vim模拟器已经满足我的需求了。更加复杂的功能，还是需要 code 的命令支持：`Cmd+Shift+p`.

### 中文输入法的梦魇

如何解决VSCode Vim中文输入法切换问题？ - Daniel的回答 - 知乎
<https://www.zhihu.com/question/303850876/answer/540324790>

### 按键绑定

```text
jj -> ESC
enter -> :
caps lock -> ctrl
```

## 基础

Vim常用的有三种模式，但是不能孤立的用，要结合起来用。
Vim的规则非常简单，但是组合起来非常强大，提供了一套文本编辑的“高级”语言。

Vim语言的基本语法：`动词 + 「数量、介词」 + 名词`
Vim语言充满了名词做动词的情况。

Vim的精髓在于重复，`.`

### 模式

三种基本模式：

- Normal，用来移动和编辑
- Insert，用来输入
- Visual/Selection，用来选择编辑块

```text
Esc                Insert -> Normal
i/I/o/O/c/a/A      Normal -> Insert
v / V              Normal -> Visual
```

### 移动

#### Normal Mode

基本操作：

```
hjkl       👈 ⬆️ ⬇️ 👉
w/b/e      按照单词移动
{ }        按照段落移动
%          在闭合的括号之间移动
gg         回到文档最上端
G          回到文档最低端
0          回到行首
$          回到行尾
```

加入数量：

```
1j         向下移动1行
8j         向下移动8行
```

移动到某一行：

- `:12<Enter>`  移动到12行
- `12gg`        移动到12行

搜索移动：

这是非常高效移动方式：j

- `fa`: 向右移动到下一个a
- `ta`: 向右移动到下一个a的前一个字符
- `Fa`: 向左移动到下一个a
- `Ta`: 向左移动到下一个a的前一个字符

另外，可以直接按 `\` 进入搜索模式，去寻找目标单词或字母。

#### Insert Mode

插入模式就是其他编辑的模式，用来输入信息。但是在插入模式，我们也可以直接移动光标、删除。
这进一步增加了Vim的灵活性，也就是说对于很局部化的操作，我们可以在插入模式下进行移动。

在插入模式下，Vim的光标移动遵循了一半 Bash shell 的快捷键。

def cls():
    ...

```text
Ctrl+p     up
Ctrl+n     down
Ctrl+b     left
Ctrl+f     right
Ctrl+a     到行首
Ctrl+e     到行位
Ctrl+h     delete 1 
Ctrl+w     delete back 1 word
Ctrl+u     delete back to start of line
```

#### Visual Mode

选择模式下的移动与正常模式的完全一致的。

:point_right:**纵向编辑** :point_left: 神器

`ctrl+v`

### 页面展示

窗口移动

```text
zz         把光标置于屏幕中间
ctrl + e   向上移动屏幕
ctrl + y   向下移动屏幕
```

折叠、展开代码块

```text
zc        关闭代码块
zo        打开代码块
za        打开、关闭代码块
```

### 编辑

这就是Vim强大的地方：编辑。

Vim中的动词：

```text
d
c
y
p
x
>
<
u
Ctrl - r
. 
```

名词，这些东西在Vim中成为 Text Object，推荐使用他们进行操作，这是一种高于`hjkl`移动的抽象。

```text
w       词（可以做动词）
p       段落（可以做动词）
jk      行 （可以做动词）
各种括号、引号等等
s       句子
```

介词

```text
i     表示里面
a     表示外面
```

## 常用操作

- 格式化代码：`==`
- 注释代码：`gc{c,j,k}`
- 切换tab：`gt{tab的数字}`
- 回退：`u`
- 重做：`Ctrl+r`

## 高级主题

### 寄存器

### 标记

## 插件

### surround