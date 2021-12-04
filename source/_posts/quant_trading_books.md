---
title: 量化投资学习路线图 - 书籍篇
tags: [Investment, Study]
categories: Quant
date: 2021-12-04
---

从业人员，利益无关。推荐一下我走的路线。这些书都是实际从业老兵写的，内容都是实打实的，经过实践检验的，而不是纸上谈兵。书中都有详细的代码和数据供读者检验和学习。
空谈的、哲学炒股、玄学交易的书趁早别看。

具体书评，我放最后了。小红书  泛程序员  更多精彩量化交易和编程分享！

- [路线](#路线)
  - [入门：Ernest P. Chan的两本早期经典](#入门ernest-p-chan的两本早期经典)
  - [进阶： Robert Carver 的两本经典](#进阶-robert-carver-的两本经典)
  - [实战新书 Python for Algorithmic Trading: From Idea to Cloud Deployment（2021）](#实战新书-python-for-algorithmic-trading-from-idea-to-cloud-deployment2021)
  - [量化的基础：Efficiently Inefficient: How Smart Money Invests and Market Prices Are Determined](#量化的基础efficiently-inefficient-how-smart-money-invests-and-market-prices-are-determined)
- [书评](#书评)
  - [Quantitative Trading: How to build your own Algorithmic Trading Business](#quantitative-trading-how-to-build-your-own-algorithmic-trading-business)
  - [Algorithmic Trading: Winning Strategies and Their Rationale](#algorithmic-trading-winning-strategies-and-their-rationale)
  - [Systematic Trading: A unique new method for designing trading and investing systems](#systematic-trading-a-unique-new-method-for-designing-trading-and-investing-systems)
  - [Smart Portfolio: A practical guide to building and maintaining investment portfolios](#smart-portfolio-a-practical-guide-to-building-and-maintaining-investment-portfolios)

## 路线

### 入门：Ernest P. Chan的两本早期经典

特别适合没有经验的小伙伴，因为作者都是从最基础的内容讲起来，逐渐增加难度，非常有体系。读完后，对整个量化交易行业的交易策略和具体实施会有更加深刻、全面的认知。

- 《Algorithmic Trading: Winning Strategies and Their Rationale》
- 《Quantitative Trading: How to Build Your Own Algorithmic Trading Business》

### 进阶： Robert Carver 的两本经典

Robert是退休前在老牌量化对冲基金 Man AHL (AHL 目前管理超过400亿美金的资产) 做交易员，经历过两次金融危机，可以说是身经百战的老兵。所以他的书，没有花里胡哨的内容，直接给出量化交易的精髓：系统构建。Robert在书中特别强调自顶向下的量化模型，即首先构建框架，再去纠结细节。适合对量化交易感兴趣的各个阶段的小伙伴，特别是对于新手，这是两本好书。因为量化这个行业充斥着大量水平较低的书籍，会误导刚刚接触的小伙伴。

- 《Systematic Trading: A unique new method for designing trading and investing systems》
- 《Smart Portfolio: A practical guide to building and maintaining investment portfolios》

### 实战新书 Python for Algorithmic Trading: From Idea to Cloud Deployment（2021）

这是一本实践性很好的关于算法交易的书籍。作者由浅入深的描述了如何形成一个交易策略，如何把这个策略部署在云端的基础设施上进行交易。本书成书2020年，内容与时俱进。

作者在前言这样写道：近些年随着开源软件、数据、云计算平台以及券商API的普及，算法交易早已不是只有机构用户才能参与的游戏了，散户和小投资人都可以利用这些资源进行自己的算法交易。我很认同他的说法，特别是数字货币领域，我自己的算法就部署在AWS上，而数字货币的实时数据甚至都是免费提供的，大家可以轻易免费获得2级订单部数据，进行交易。

这本书很适合初学者，特别是有一点点Python经验的，对算法交易感兴趣的小伙伴。因为这本书的每一个章节都有对应的notebook代码进行说明，这些代码都开源在Github，大家可以在本书的Github仓库找到对应的代码，学起来非常轻松且实用。我觉得更贴心的是，作者还简单介绍了一些策略部署的问题，如何使用docker，如何使用队列中间件比如ZeroMQ，以及如何连接券商API，如何进行实际交易等实践性质的内容。这些内容，往往是其他算法交易书籍所缺乏的，我读到的大部分书籍都仅仅关注策略和统计，忽略了这个非常重要的实践部分，而这个部分恰恰是算法交易落地交易的重要一环。从我自己的经验看，策略往往是简单的，而策略的实现和运行往往需要花费更多的精神（哈哈，其实Quant Dev的工作便是如此）。

从策略角度说，本书更适合初学者，策略本身都是基础策略，更强调如何落地实现。比如如何搭建回测框架，如何搭建数据源等等。总而言之，是一本不可多得的好书。

### 量化的基础：Efficiently Inefficient: How Smart Money Invests and Market Prices Are Determined

一本有关量化投资策略的好书，作者在学术圈和工业界都有很好的口碑，跟著名的资管公司AQR有着各种渊源，所以，这本书的内容即涵盖了许多学术观点，但也通俗易懂。
全书分为四部分，第一部分主要讲解投资策略的回测与衡量；第二部分主要讲股票方面的策略；第三部分讲解资产配置与宏观策略；第四部分讲解套利策略。每章节最后都有一个相关对冲基金经理的采访。


这本书适合对量化投资领域感兴趣的小伙伴，可以对这个行业有比较全面的认识。但是这本书总体来说比较偏重概念，实践性的内容较少。

## 书评

### Quantitative Trading: How to build your own Algorithmic Trading Business

这是一本来自2009年的“老”书了，全文只有200页，言简意赅。如果你对量化交易感兴趣，却不知道从哪里下手，这本书很合适。
我对这本书有着特殊的情感，因为这是我入行量化读的第一本书，帮助我构建了最早的框架。而且作者身体力行地回答了一个基本问题：个人量化交易可以成功吗？（可以，不然意义何在？）
这本书适合谁呢？主要适合两类人：

1. 个人交易员，想要从0开始自己的量化交易生涯
2. 学生，想要进入量化交易领域，开始自己的量化交易职业生涯

这本书讲了什么呢？这本书的重点不在于策略，而是量化交易的组成部分。作者试图告诉读者如何自己去寻找盈利的策略，如何评估一个策略的好坏、如何回测、如何确保策略在实盘后仍然盈利等等。主要内容如下：

- 量化交易的3w（What/Who/Why)
- 如何寻找、发现好的策略
- 回测的基本要领
- 量化交易的一些准备
- 执行系统
- 资金和风险管理
- 一些常见的策略类型
- 结论：个人量化交易可以成功吗？

最后一个问题很有意思：个人做量化交易可能成功吗？作者通过自己和其他一些个人交易员的真实经历给出了肯定的答案。他也点出了这中间的要害：资金容量。一个10万美金的账户比一个1亿美金的账户更容易产生高的Sharpe。当然这句话我是在机构做了几年量化后，才有更深刻的体会，当初学习的时候并没有真正体会到这句话背后的意义。

### Algorithmic Trading: Winning Strategies and Their Rationale

这是Chen的第二本关于量化交易的书，这本书更加关注策略的测试和逻辑。这是读完《Quantitative Trading》后最好的选择。虽然本书名为算法交易，但是并不是指订单执行算法，而是指系统化交易。

这本书主要分成四个大部分：

- 回测和自动化执行
- 均值回归类策略
- 趋势类策略
- 风险控制

基本上涵盖了经典的基于价格和成交量数据的策略类型，作者详细解释了每个策略的数学统计模型和实现方法，最后讲述了一些常见的风险控制工具，比如杠杆优化（凯利公式）、风险指标、止损以及回撤控制。

这本书很适合对量化交易一无所知的小伙伴或者刚刚入行的小伙伴，因为作者介绍了这个行业最基本的一些策略，这些策略特别适合流动性较好的标的物，比如股票、ETF、期权和期货。因为这些标的物市场份额最大，而且流动性好且容易接触和交易，实盘操作不容易出现问题。比如流动性突然消失、或者交易自己完全不懂的产品（比如加密货币）。

作者也回答了一个“致命”问题：为什么要分享这些策略？如果真的可以盈利，为何要分享？这些策略和知识并不是要你直接真金白银的直接进行交易，而是提供一个基础的框架，在此基础上逐步完善，比如选择不同的标的物、不同的模型、不同的资金容量等等，但是大框架不会变化，这就是所谓一般知识。而且，比如趋势策略，已经是人尽皆知的策略了，但是仍然可以产生收益。至于为什么会这样，似乎没有人可以说清楚。

### Systematic Trading: A unique new method for designing trading and investing systems

此书作者是退休前在老牌量化对冲基金 Man AHL (AHL 目前管理超过400亿美金的资产) 做交易员，经历过两次金融危机，可以说是身经百战的老兵。所以他的书，没有花里胡哨的内容，直接给出量化交易的精髓：系统构建。Robert在书中特别强调自顶向下的量化模型，即首先构建框架，再去纠结细节。

尽管如此，Robert在书中给出了实打实的实现量化交易框架的细节，提出了一些交易理论，但是他没有纸上谈兵。他甚至开源了自用的代码（以后给大家讲讲这个），这套代码可以实现书中的所有细节，当然也包含了更多额外的功能。

这本书适合对量化交易感兴趣的各个阶段的小伙伴，特别是对于新手，这是一本好书。因为量化这个行业充斥着大量水平较低的书籍，会误导刚刚接触的小伙伴。

### Smart Portfolio: A practical guide to building and maintaining investment portfolios

这是另一本来自 Robert Carver 的关于个人投资框架的书，这本书朴实无华的回答了三个问题：

1. 应该投资什么资产？
2. 每个资产应该投资多少？
3. 如何调整投资组合？

书中详细的给出了一套系统的选择、计算、调整投资组合的框架，贯彻着自顶向下的理念。作者从基本问题出发，通过逐一回答这些问题，逐步构建投资组合框架。总体来说，这本书适合个人投资者，科学合理的构建稳健的投资组合，同时告诉读者如何在这个框架中植入自己的新想法，比如新的策略、对某个股票或者资产的观点。

如果你手上有多余的现金，不知道如何科学投资，就从这本书开始吧。Robert不是那种股评人，而是真正在市场中经历风雨的作者，他写的东西我觉得都是从实践中总结的，而不是纸上谈兵。