---
title: 2021总结
categories: Admin
tags: [总结]
date: 2021-12-27
---

## 世界

2021年，我是这样观察世界的：

- COVID-19
- 证券市场
- Crypto
    - 金融属性
    - Web3 和 元宇宙

### Covid-19

一个代号19年的病毒，影响了整个2020年，也影响了整个2021年，想想有点后怕呢。也许，他还会继续影响2022年。

Covid-19在2021年经历了Delta，Omicron两个变种，从发病至今，世界范围内累积感染2亿人口，死亡4百万人。

![COVID-19](https://i.imgur.com/7XOBxYP.png)

### 证券市场

虽然，Covid-19还在，但是今年却没有发生2020那样的股票市场“闪崩”，相反的标普竟然是大涨27%。

![SP500指数](https://i.imgur.com/dWpAetD.png)

当然，这里不仅跟市场对Covid的态度有关系，也跟美联储的大放水分不开。看下图，从2020闪崩开始，美国10年国债利息一度降到近50年最低点：0.33%。随后，在2021年缓慢增加，可以预知，美联储在2022年仍然会继续加息。

![10年国债利率](https://i.imgur.com/Gfrpc9b.png)

我通常用下面的这几个图来观察市场状态：标普、20年国债、黄金、日元、VIX。从目前的状态看，市场仍然比较兴奋，但是TLT的价格增加也意味着来年的大牛市应该不会出现了，不过经典的避险资产黄金和日元持续走低，证明资本还是Risk on的，VIM指标也比较正常。

![我的市场晴雨表](https://i.imgur.com/h8vDtXL.png)

### Crypto
#### 金融属性

Crypto已经成了一个不能忽略的“正经”金融产品了，这一年标普也启动了一系列Crypto指数，下图是Large cap Crypto指数，可以看到2021年，该指数获得了411%的收益，远远超过了股票市场。当然，其波动率也是非常可观，可以说是投机的绝佳·标的物。

![S&P Cryptocurrency BDM Ex-LargeCap Index](https://i.imgur.com/2BSUMGJ.png)

关于Crypto在投资组合中的作用，可以参考：[为什么你的投资组合需要Crypto？
](https://wangzhe3224.github.io/2021/12/01/portfolio_with_crypto/)

事实上，自从比特币期货在CBOE发行后，数字货币已经被主流金融机构接受了，2021年，第一个比特币ETF也发行了，标志着数字货币渐渐被被动投资人接受，从投机产品，逐渐过度到稳定的金融产品。

#### Web3 和 元宇宙

> WTF is NFT？

Crypto 经过了10年的发展，现在已经不仅仅具有金融属性（投机和投资），还需有一些社会属性。Web3 和 元宇宙 这些概念的相继提出，其实是一种变革价值交换体系的尝试。我不知道Web3 和 元宇宙 会走多远，会以什么形态呈现出来，我知道的是，社会有这样一种需求：变革价值交换体系。

现在的价值交换是通过什么呢？货币和银行。货币和银行是谁掌握的？国家和政府。国家和政府是谁掌握的？资本家。

区块链提供的价值交换是通过什么？Crypto和分布式账本。看起来很美好对吗？真正的民主胜利（去了解一下DAO）？其实不然，资本家不会放弃自己的对货币控制，国家如果没有对货币的控制，就好像壮汉断了一臂（另一只手臂是军队）。

那么，区块链就没未来了吗？也不是，因为区块链确实实现了去中心化，但是对应的代币（token）并没有。资本家可以控制代币，特别是当目前区块链技术由proof of work 像 proof of stake 过度后，掌握大量的代币就相当于控制了该代币的网络。

![](https://i.imgur.com/SKCNKsI.png)

看一下这张图就知道，绝大部分网络的代币由投资人（即资本家）控制。特别是新兴的“第三代”区块链技术，比如Solana、Binance Chain，Polkadot。而这些区块链无疑都是POS，即只要你手握大量代币，你就是大概率成为Validator。而且，成为这些公链的验证节点，你需要购买强大的计算中心，普通的个人电脑是不能挖矿的，或者挖矿效率低下。

一个事实是：比特币。它是一个例外，第一个数字货币，至今仍然是POW，这就意味着控制比特币网络非常的困难。而且，比特币 没有 机构投资人参与，是一个完全的大众链。最后，比特币节点的门槛极低，个人电脑即可。

所以，Crypo肯定会在以后的很长一段时间存在，但是就其社会意义而言，只有比特币是独特的，而且他公链总归是资本家的工具。我个人看好整个区块链产业，因为其一，比特币提供了一种独特的价值交换方式，其二，资本家已经控制了大部分公链，不会很快放弃他们的。

#### Crypto 与 Rust

区块链的兴起也带动了技术的蓬勃发展，甚至盘活了新秀语言Rust。Rust一直是我关注的一个新兴语言，它改变了我对 System Programming 语言的看法。在Rust以前，提到 System Programming 语言，我只能想到 C/C++。但是这两个语言都是爷爷辈的语言了，以至于他们的问题都成了程序员的一种技能，要掌握。比如手动垃圾回收，如何避免悬垂指针、如何避免段错误等等。而Rust的出现改变了这个现状，Rust的编译器帮助程序员做了上面的工作，它的类型系统更加现代和强大，代数类型系统、模式匹配、内存管理模型都让系统编程变的非常舒服，而Rust的这些特性，我觉得会让他走出系统编程的领域，扩展到更加上层的应用。

而 区块链 的发展正是Rust的地盘。目前，主流的智能合约公链，比如Solana，Polkadot，都是围绕 Rust 构建的，甚至 ETH 也有这个想法，虽然目前ETH生态是以 Solidity 和 Go 为主的。


## 我

聊完世界，看看自己。

### 生活

这一年恐怕是我最痛苦的一年了，看到了世事无常，看到了生命的脆弱，经历这些反而让我更加看清这个世界的绝望，看清神对人的爱。靠着神，我们挺了过来，我希望我可以时刻用这段经历提醒自己，未来的盼望才是确实的，眼前的往往是虚幻的。（是的，与世界的看法背道而驰）。

教会渐渐恢复了下线聚会活动。今年夏天，我第一次站在讲台上[布道](https://www.gospelhome.org.uk/sermon/?sermon_id=691)。虽然只是短短的讲道，我也体会到了专职传道人的不易。他们要花很多时间准备讲道内容，讲道结束还需要反思。

> 你的“财宝”在哪里，你的心思和时间就在哪里。

### 学习

#### 计算机

修了[Msc in Software Engineering](https://www.cs.ox.ac.uk/softeng/courses/subjects.html)的四门课，还需要再修3门就可以毕业啦。

- [Deep Neural Networks]
- [Quantum Computing]
- [Cloud Computing and Big Data]
- [Design Patterns]

但是，有一说一，计算机这个学科更多时间是靠自学的，而且自学起来非常轻松，因为网络上的资源非常丰富。

2021年是我自学计算机的第五个年头了，这一年大部分的学习时间仍然在基础知识上，花了大量的时间学习计算机的底层知识。列出比较成体系的文章系列如下：

- [Python知否 - Python进阶视频和与代码](https://github.com/wangzhe3224/Python-zhifou)
- [重拾面向对象设计模式 - Python实现](https://github.com/wangzhe3224/Python-zhifou/tree/master/src/design_pattern)
- [重新认识Python系列](https://wangzhe3224.github.io/2021/02/16/python_1_gc/): 深入分析CPython虚拟机的内部原理，包括GC、GIL、二次开发、Cython的使用等等
- [编程101 PyOS 一个Python写的OS](https://wangzhe3224.github.io/2021/03/06/pyos_1/): 用Python讲述并发原理和操作系统调度系统
- [重读CSAPP笔记](https://wangzhe3224.github.io/tags/CSAPP/)
- [重拾 Leetcode 系列](https://wangzhe3224.github.io/categories/Leetcode/) | [Leetcode In Python 仓库](https://github.com/wangzhe3224/leetcode_py)

在开源社区，我准要参与了 [Cryptfeed](https://github.com/bmoscon/cryptofeed) 这个仓库的共享，同时我在AWS部署了Crypto tick数据和Orderbook数据的记录器，记录主流货币和交易的数据信息，以备将来分析。

当然，读书是必不可少的：

- [代码之外生存指南](https://wangzhe3224.github.io/2021/12/01/reading-soft-skill/)
- [CSAPP](https://github.com/wangzhe3224/CSAPP-Lab)
- [Domain Modeling Made Functional](https://pragprog.com/titles/swdddf/domain-modeling-made-functional/)
- [Rust In Action](https://github.com/wangzhe3224/books/blob/master/ProgrammingLanguages/Rust/Rust%20in%20Action%20by%20Timothy%20Samuel%20McNamara.pdf)
- [Clean Architecture](https://github.com/wangzhe3224/books/blob/master/Design/Clean%20Architecture%20A%20Craftsman's%20Guide%20to%20Software%20Structure%20and%20Design.pdf)

#### 量化交易

量化交易是我的本职工作，大部分的学习过程其实是在工作中进行的，在一次一次的debug中进行的。

产出：

- [一些列量化学习路线图](https://wangzhe3224.github.io/categories/Quant/)
- [Awesome Systematic Trading: 一个量化交易开源软件资源的合集](https://github.com/wangzhe3224/awesome-systematic-trading)

读书：

- [Quantitative Portfolio Management](https://wangzhe3224.github.io/2021/12/22/quantitative_portfolio_management/)

除了工作以外，主要是通过开源社区学习量化开源框架的设计模式和功能，尝试不同的框架，为将来的计划做准备。

### 工作

#### 主业

今年的项目比较复杂，一个是关于 PnL归因的，一个是关于 投资组合优化的。收获还是蛮大。

明年会接受一个更大一些的项目，一个end to end的策略生产化。

#### 副业

开启了自媒体之路！10月份开始做小红书和一些开源项目，虽然只做了两个月，但是感觉还是很有意思，可以分享自己的收获，为他人创造价值。

我的IP：泛程序员，泛泛，FunCoder

目前主要经营小红书，同时经营知乎、B站和油管。

### 投资

2021年我的高流动性投资组合回报率:

- 杠杆类账户，权重 33%：14.17 % （木有跑赢标普500，哎）
- 现金类账户，权重 58%：8.7 %
- Crypto，  权重  9%：60.2%

加权平均收益：14.5 % (木有跑赢标普

波动率目标：15%

主要原因是，Cover call 花费太大了。。今年市场比我认为的要更加牛市。

### 心得

关于生活

- 意识可以决定物质，经常暗示你自己
- 关心你身边熟悉的人，起码比关心陌生人更关心他们

关于学习和输出

- 学习要有章法和框架，在框架中有目的填充内容，不可盲目学习
- 输出要有框架和目的性，确定框架后，分解成小任务，分别输出
- 学习和输出的内容最好是相对独立的，正交的内容，这样以前的产出就可以重新组合形成新的内容。（类似软件工程的组合原则）
- 学习其实一种投资，有时间成本，所以开始之前想要是不是符合自己的大计划；一旦选中，不要放弃，专注
- 一门技术，掌握20%的内容，就可以解决80%的问题，所以，首先识别20%的内容是什么？然后掌握它
- 学习的最高境界是教授，而教授可以为其他人创造价值

关于专注力

- 分解成小任务，使用番茄时钟，强迫自己有专注时间
- 记录自己的工作量，在回顾的过程中就可以更好的认识自己，而且对未来的工作量有更好的估计
- 一定要有自己的专精领域，不可多而不深，多没有问题，但是必须要有一个细分方向非常深入

关于职业

- 有意识的专精一个细分方向，比如我做量化交易，我专精股票交易，专精中长线策略
- 专精不代表不去了解其他内容，相反应该尽可能的了解其他相关方向，然后围绕自己的专精，拓展自己的知识和技能

关于投资

- 永远不要孤注一掷，多样性是免费的午餐，当然多样性也有代价
- 黑天鹅比想象中的更加频繁
- 市场不会按照你想的方向运行
- 没事儿不要看盘，计算机会帮你做这些事情

## 展望2022

好好生活，多读圣经。

强化计算机基础知识，逐渐为业务专精和第二专精服务。比如熟悉量化交易框架、输出文章、代码、视频。

强化量化知识，逐渐形成自己的职业细分专精方向：股票量化交易。

开拓一个新的相关业务专精：Crypto量化交易。

进一步经营个人IP，为他人创造价值。

