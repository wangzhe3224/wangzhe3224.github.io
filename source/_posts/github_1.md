---
title: GitHub怎么用 - 1 入门和检索
date: 2021-12-28
tags: [GitHub]
categories: FunCoder
---

## GitHub·能干啥

`GitHub`是通过`Git`进行 *版本控制* 的软件 *源代码* 托管服务平台。创建于2008年，最初的版本是 `Ruby` 完成的（啊，那时候正式Ruby on Rails的全胜时期）。目前拥有超过4000万用户（我觉得这是4000万程序员吧：>），是目前最大的开源项目托管平台。

GitHub对于程序员来说意味着：

- 代码相关
    - 代码仓库托管
    - 代码阅读、学习
    - 开源项目参与和学习
    - Devops
- 打造个人IP
    - 博客
    - 图床
    - 写书
    - 社交媒体
- 资料库
    - 学习路线图
    - 教程
    - 电子书集合

这一篇，泛泛给大家聊聊如何利用GitHub获取资源和入门GitHub，以后会给大家具体讲讲上面提到的一些功能，比如如何实现博客、图床、写书、代码阅读等等。

## GitHub·如何检索资源？

GitHub获取资源主要靠搜索和索引仓库。

### 搜索

首先注册一个GitHub账号，只需要一个邮箱，就可以开启GitHub之旅了。访问 <https://github.com/> 会看到这样一个页面：

![](https://i.imgur.com/1eTu38j.png)

具体的功能已经放在图例说明啦。需要注意的是，输入关键词后，会出现提示，注意观察：`All GitHub` 意味着从整个Github进行搜索，有时候可能会出现其他选项，比如 `搜索当前仓库`等等。

![](https://i.imgur.com/qKfnD2W.png)

一般我们会得到如下结果，我们可以利用GitHub的选项进一步对结果进行筛选和排序，得到我们想要的结果。

![](https://i.imgur.com/ZRljtqv.png)

### 索引仓库

GitHub的搜索功能比较强大，但是肯定没有“人工”智能更加智能，因此我们需要找到相关主题的索引仓库。这些仓库一般是其他开发人员花时间精心整理的，一般汇集了更加实用和相关的仓库和文章。比如这个仓库（哈哈）包含了泛泛整理的量化交易相关的代码仓库和教程仓库：

![](https://i.imgur.com/6TCdJN9.png =x300) 

另外，推荐一个索引仓库 [GitHub Ranking](https://github.com/EvanLi/Github-Ranking)，这里你可以查看GitHub上 Star最多、Fork最多、还有按照语言排序的仓库榜单等等。

![GitHub Ranking](https://i.imgur.com/DY9f0kN.png)

上面可以找到非常实用的资源，比如 [freeCodeCamp.org](https://github.com/freeCodeCamp/freeCodeCamp)，该项目有33万star，里面包含很多入门计算机、编程的教程，还可以在 Issue 区讨论和寻求帮助。

![freeCodeCamp.org](https://i.imgur.com/1rrd9eo.png =x400)

当然，闲来无事，可以当抖音刷刷，经常会发现宝藏。比如这货 [996.ICU](https://github.com/996icu/996.ICU/blob/master/README_CN.md)- 这仓库有26万star，是用来吐槽和黑名单那些黑心996企业的。

![996.ICU](https://i.imgur.com/P6fAPq3.png =250x)
![](https://i.imgur.com/nY3tgFV.png =400x)

### 通过follow专家用户

比如，你发现了一个仓库很好，然后你就可以看看他的作者，如果他是一个活跃的贡献者，你就可以follow他，接到他的动态。比如数据科学家： Nicolas P. Rougier，他持续的输出各种高质量的数据科学教程：

![](https://i.imgur.com/IXHiEcc.png)

## GitHub·如何参与开源和社交

GitHub是一个合作软件开发平台，一旦你找到了你感兴趣的项目，就可以通过GitHub提供的各种功能参与其中。我给大家举个例子，比如下面这个[Polars](https://github.com/pola-rs/polars)。

![](https://i.imgur.com/p2jLzbV.png)

Issues通常会被标记不同的tag，比如`Bug`,`Feature`,`Help Wanted`等等。通常想要开始贡献开源项目通常有如下几个情况：

- 在使用过程中自己发现Bug，这时就可以自己提交Issue说明
- 认领已经存在的Issue，可以在相应的Issue下评论认领，然后提交PR。比如认领Bug或者认领Feature。

通常，如果你对项目不是特别熟悉，也没发现什么明显的Bug，`help wanted` tag 的issue是开始贡献最好的起点。

## GitHub·基本使用方法学习

学习GitHub基本使用的**最好**方法是：[GitHub Learning Lab](https://lab.github.com/)。 这个lab中有Github官方提供的制作精良的教程，而且是互动式，一步一步的教会你：

- 认领一个issue
- 提交、关闭issue
- 创建一个branch
- commit文件
- 开启一个新的Pull Request，即PR
- 回复、讨论PR的回复
- 合并你的PR
- Git的基本使用

推荐一个学习路径

1. [First Day on GitHub](https://lab.github.com/githubtraining/first-day-on-github)
2. [First Week on GitHub](https://lab.github.com/githubtraining/first-week-on-github)


