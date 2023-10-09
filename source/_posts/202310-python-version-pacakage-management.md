---
title: Python 的版本和包管理系统
tags: [Python, poetry, pip, pyenv, conda]
categories: [Coding]
date: 2023-10-09
---

Python 构建相关工具主要包含三个部分：

- 版本管理
    - [pyenv: Simple Python version management](https://github.com/pyenv/pyenv)
    - [Conda](https://docs.conda.io/en/latest/)
- 虚拟环境管理
    - [pyenv-virtualenv](https://github.com/pyenv/pyenv-virtualenv#pyenv-virtualenv)
    - [Poetry](https://python-poetry.org/)
    - [Conda](https://docs.conda.io/en/latest/)
- 包依赖管理
    - [Poetry](https://python-poetry.org/)
    - [Conda](https://docs.conda.io/en/latest/)

> 其实很多工具并不只有一个功能，比如 Poetry 既可以管理依赖，也可以管理虚拟环境。Conda 是及三个功能于一身的。

## 版本管理

版本管理主要是用来管理同一个机器上的不同的 Python 解释器，每一个版本的解释器都可以产生独立的虚拟环境和包依赖。
这里我建议使用：[pyenv: Simple Python version management](https://github.com/pyenv/pyenv)。
pyenv 支持主流操作系统，除了支持 CPython 的各大主流版本，还支持其他的 Python 实现，比如 Pypy。

## 虚拟环境管理

虚拟环境其实就是某一个 Python 版本 + 定制化的依赖。比如 `env-1` 是 Python 3.11 + numpy + pandas，而 `env-2` 是 Python 3.12 + networkx，而 `env-3` 是 pypy 3.10 + numpy + pandas。这其中 `env-1`, `env-2`, `env-3` 就是三个完全独立的 Python 执行环境。他们有不同版本的 Python 解释器，安装有不同的包，而且这些包的版本可能也是不一样的。

为什么需要不同的环境呢？其中一个比较重要用途就是确保包的版本不会存在冲突，因为一般每一个 Python 项目的依赖都不尽相同，如果要开发不同的项目，就需要不同的虚拟环境。另外，如果每个项目有独立的虚拟化环境配置，在打包 Docker 运行的时候，也会非常轻松。

虚拟环境管理的工具推荐：

[pyenv-virtualenv](https://github.com/pyenv/pyenv-virtualenv#pyenv-virtualenv)，这是 pyenv 的一个插件，安装以后可以直接通过 `pyenv virtualenv 3.11 env-1` 创建特定版本的 Python 虚拟环境。

它不仅可以管理 pyenv 的 Python 版本，还可以通过 Pyenv 管理 Conda 的环境。

## 包依赖管理

Python 有几个主要的包源：

- [PyPI](https://pypi.org/) Python Package Index
- [Conda](https://docs.conda.io/en/latest/) Package, dependency and environment management for any language
- [Conda-Forge](https://conda-forge.org/) 

目前 PyPI 还是最主要的 Python 库的源，而 Conda 则更加适合机器学习、数据科学的库，或者一些需要混合编程场景，比如 C++，CUDA 这种。

相应的 pip 和 conda 是两个主要的依赖管理器。需要指出，pip 在依赖管理方面非常弱，可能会出现冲突。

这里推荐两个包管理工具：

- [Poetry](https://python-poetry.org/) - Poetry is a tool for dependency management and packaging in Python
- [MiniConda](https://docs.conda.io/projects/miniconda/en/latest/) - Miniconda is a free minimal installer for conda

Poetry 的依赖解决更迅速，因为它是一个 Python 的包管理器，而 Conda 则不光是 Python 管理，这也是为什么在一些机器学习库的安装和管理上 Conda 更胜一筹，因为很多库都是不同语言的依赖。

不过，Poetry 是一个比较好开始的工具，如果发现不能安装的库，在考虑 Conda。
