---
title: Rust包管理和文件组织
tags: Rust
categories: Coding
date: 2021-11-13
---

## 包（package）、Crate

首先关于文件和文件夹管理的两个概念：

- 包（Package）
- Crate（不知道翻译成啥）
  * 库，lib
  * 二进制，bin

一个包，包含一个`Cargo.toml`文件，描述如何构建这个包内部的一个或者多个`Crate`。`Cargo.toml` 负责根据配置将这些Crate进行编译和连接。

**规则**：

- 一个包中最多只能包含一个库（lib）Crate
- 包可以包含多个二进制（bin）Crate
- 包至少要包含一个Crate（lib或者bin）

`Crate` 可以有两种形态：二进制（bin）或者库（lib）。区别这两者的规则是：如果只存在`src/main.rs`，这是一个与包同名的二进制（bin）Crate，且这个文件就是Crate的根。如果存在`src/lib.rs`，这是一个与包同名的库（lib）Crate，且这个文件是Crate的根；如果同时含有这两个文件，则这个包包含两个Crate：一个库，一个二进制。

通过将文件放在`src/bin`目录下，一个包可以包含多个二进制Crate，每一个文件都会被编译成独立的二进制Crate。

注意每一个二进制（bin）Crate都需要有一个main函数作为二进制的入口。

## 模块（mod）

模块 帮助代码分组、重用，隐藏内部状态，即封装。使用`mod`可以生命一个模块，模块可以嵌套子模块。`pub`用来暴露模块和他的API。

通常一个模块（包括他的子模块）会被放在同一个文件夹内部，有两种主要的方式：内部库，外部库。

内部库的文件结构如下：

```text
src
  - lib1
    - impl.rs，模块的实现
    - mod.rs, 主要包含模块引入
  - lib2
    - impl.rs
    - mod.rs
main.rs
```

外部库文件结构如下：

```text
project
  - src
    - main
  - lib_ext
    - src
      - impl.rs
      - mod.rs or lib.rs
    - Cargo.toml
  - Cargo.toml
```

外层Cargo文件需要增加`dependency`:

```toml
[dependencies]
util = { path = "lib_ext", version = "0.1.0" }
```

如果是二进制Crate，可以直接把文件放入`src/bin`中，不需要额外引导。

模块的引用方式为：`mod1::submod::item`，可以采用 `use` 关键字缩短引用路径。

