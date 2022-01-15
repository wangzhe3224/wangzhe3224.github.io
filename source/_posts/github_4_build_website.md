---
title: 使用 GitHub 设置任意网站
tags: [GitHub, 建站]
categories: Coding
date: 2022-01-15
---


## 基本原理

使用 GitHub Page 功能，每一个仓库设置某个 Branch 为 Page 的 Host，然后再该 Branch 中的 `index.html` 文件就是网站的入口文件，设置好后，网站可以通过 `https://{你的用户名}.github.io/{你的仓库名}/` 访问。

1. 创建仓库
2. 创建网站分支
3. 创建网站入口

### 创建仓库

这一步很简单，去 GitHub 网站即可完成。

### 创建分支

把刚才建立的仓库 Clone 下来，进入 Clone 的目录，输入：`git checkout -b front-end`，开一个新的分支专门用来 Host 我们的网站。

然后，把新的分支推到远端仓库：`git push -u origin front-end`，输出如下：

```
Total 0 (delta 0), reused 0 (delta 0), pack-reused 0
remote:
remote: Create a pull request for 'front-end' on GitHub by visiting:
remote:      https://github.com/wangzhe3224/Jesus_is_Lord/pull/new/front-end
remote:
To github.com:wangzhe3224/Jesus_is_Lord.git
 * [new branch]      front-end -> front-end
Branch 'front-end' set up to track remote branch 'front-end' from 'origin'.
```

### 创建入口文件

创建文件 `index.html` , 这就是我们网站的入口。Push 到 `front-end` 分支即可。

### 配置 GitHub Page

来到：<https://pages.github.com/> 选择 `Project Site`，按照提示配置入口页面为 `index.html`

然后我们就可以通过下面网址访问我们的网站：`https://{你的用户名}.github.io/{你的仓库名}/`

## 使用建站软件

当然，我们不希望自己一个一个的编写 html、css ，已经有很多建站工具在开源社区。比如个人博客，可以选择：[hexo](https://hexo.io/)；项目文档，可以选择：jekyll；甚至 GitHub 自己都有文档模板可以选择。

这里我们选择 Hexo 作为例子。Hexo 简单说就是一个用 Markdown 作为输入的建站软件，所有的文章、博客采用 MD 的形式书写，框架会自动根据选定的主题和配置，生成对应的 Html 和 CSS 文件，然后就像我们之前的 `index.html` 会被 GitHub Page 锁定并载入。

Hexo 的安装请参考官方文档：<https://hexo.io/docs/>，整体比较简单，基本上就是安装：`node.js` 和 `git`。

首先，进入我们的分支根目录:

```bash
hexo init page   # 初始化一个博客的文件夹。
cd page
npm install  # 安装依赖
```

安装结束，可以看到如下文件架结构：

```
.
├── _config.yml
├── package.json
├── scaffolds
├── source
|   ├── _drafts
|   └── _posts
└── themes
```

其中，网站的配置文件在 `_config.yml`，而博客的 MD 文件都在 `source/_post` 文件夹下。

为了方便起见，我们修改 `_config.yml` 文件：

```
url: https://{你的用户名}.github.io/{你的仓库名}/
public_dir: ../docs
```

这样，我们就把生成的网站文件生成在 `../docs` 文件夹，这主要是为了方便 GitHub Page 识别，因为 GitHub Page 只能识别根目录或者 `docs` 两个目录。还有一种办法就是把网站生成在另一个新的分支，但是比较麻烦。

接下来，我们尝试本地生成并运行一下网站：`hexo s`，该命令会生成一个名为 `public` 的文件夹，里面就是生成的网站文件，其中 `index.html` 就是入口文件。

```
❯ hexo s
INFO  Validating config
INFO  Start processing
INFO  Hexo is running at http://localhost:4000/Jesus_is_Lord/ . Press Ctrl+C to stop.
```

访问 <http://localhost:4000/Jesus_is_Lord/> 即可看到网站。

最后，我们把分支推送远端：

{% note info %}
#### 注意
我们需要编辑隐藏的 `.gitignore` 文件，把 `public` 目录纳入 git 的追踪目录，否则无法推送 public 文件夹。打开 `.gitignore` 文件，删除 public 行，保存即可。
{% endnote %}

```
git add .
git commit -m "first push"
```

{% note info %}
#### 注意
我们需要改变Github Page 的入口到 `docs` 文件夹
{% endnote %}

Push 后，我们就可以在之前的链接看到网站了。

![](https://i.imgur.com/ZdWnAmA.jpg)


## 自动化部署和发布

现在，我们只要增加或者更新 `source/_post` 文件夹下面的 MD 文件，然后运行 `hexo g`，最后 Push 更新即可。

这样呢，就是记得要多跑一步 `hexo g`，才能 push 文件。我们也可以通过设置 GitHub Action，来实现自动化部署，即我们只需要修改 MD 文件或者配置文件，然后直接 push，GitHub Action 运行 `hexo g`，然后把生成的网站文件部署到一个默认分支：`gh-page`。

可以参考：

https://hexo.io/docs/github-pages

需要建立 `.github/workflows/pages.yml` 文件进行配置。

## 参考

- https://pages.github.com/