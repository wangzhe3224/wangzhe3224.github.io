---
title: Python 生态的时间戳内存探索
tags: [datetime, Python]
categories: Coding
date: 2022-08-21
---

如何表达一个 `datetime` ？我们需要三个部分：`date`, `time`, `timezone`。

在 Python 的生态中主要的事件对象包括：

- `datetime`： Python 原生的时间戳对象
- `np.datetime64`： Numpy 的原生时间戳对象
- `pd.Timestamp`： Pandas 的原生时间戳对象

不过近几年随着 `arrow` 的兴起，Arrow 的时间戳对象也进入了人们的视野。

使用下面代码来 Benchmark 三个时间戳的内存使用情况。我们随机生成一百万时间戳。

```python=
import pandas as pd
import numpy as np
from datetime import datetime
import random
from memray import Tracker


def generate_a_lot_datetime(n: int = 1_000_000):
    
    with Tracker("generate_a_lot_datetime.bin"):
        res = []   
        for i in range(n):
            res.append(datetime(2022, random.randint(1, 12), random.randint(1, 28), 1, 1, 1, i%1000))

    return res

def generate_a_lot_datetime64(n: int = 1_000_000):

    with Tracker("generate_a_lot_datetime64.bin"):
        res = []   
        for i in range(n):
            res.append(np.datetime64(f"2022-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}T01:02:03.123"))

    return res
    

def generate_a_lot_Timestamp(n: int = 1_000_000):

    with Tracker("generate_a_lot_Timestamp.bin"):
        res = []   
        for i in range(n):
            res.append(pd.Timestamp(f"2022-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}T01:02:03.123"))

    return res


if __name__ == "__main__":
    
    res = generate_a_lot_datetime()

    res = generate_a_lot_datetime64()

    res = generate_a_lot_Timestamp()

```

![三种时间戳的内存占用对比](https://i.imgur.com/ZOCoJwE.jpg)


可以发现，
- `np.datetime64`： 39.061 MB， 32 字节每个
- `datetime`: 55.063 MB，49 字节每个
- `pd.Timestamp`: 117.05 MB， 114 每个

numpy 表现最好，pandas 表现最差，而原生python的时间错表现不错，更加接近numpy。当然这个测试不完全是不同时间戳对象的大小不同，还包含了numpy 和 pandas 不同的实现消耗的内存。也许应该读取 `pymalloc_alloc` 函数调用内存更加准确，但是确实不变且影响较小。

从 `memray` 的测试结果看，`pd.Timestamp` 的内存分配次数也最高，因此运行速度最慢。

接下来我们测试如下，生成高频时间戳 18316800 个：

```python=
def generate_large_pd_index():

    func = inspect.stack()[0][3]
    with Tracker(f"{func}.bin", native_traces=True):
        index = pd.date_range('2022-01-01', '2022-08-01', freq='1s')

    print(f"Length of index: {len(index)}")
    return index


def generate_large_np_index():

    func = inspect.stack()[0][3]
    with Tracker(f"{func}.bin", native_traces=True):
        index = np.arange('2022-01-01', '2022-08-01', dtype='datetime64[s]')

    print(f"Length of index: {len(index)}")
    return index
```

结果表明，pandas 和 numpy 使用内存完全一致，说明 Pandas 后台应该就是调用了numpy 的函数。

![](https://i.imgur.com/9tPstpZ.png)


值得注意的是，`date_range` 生成的时间戳大小远远小于单独随机分配的对象大小。`date_range` 每一个时间戳大小为 8 字节（139.748 * 1024**2 / 18316800）。


该时间戳大小与 Rust 实现的 chrono 库一致（没有timezone信息）：

```rust=
pub struct NaiveDateTime {
    date: NaiveDate,
    time: NaiveTime,
}
// 这里 date 是 i32， time 也是 i32， 合计 8 字节。
```

【问题】这里我们做到了时间戳最小的内存消耗了吗？ 8 字节。

如果我们观察第一次的实验结果，`np.datetime64` 每一个对象的大小应该为 32 字节，而不是 8 字节。这应该与每一个对象的 Header 占用空间有关，当我们把时间戳放入一个固定的 array 里面， 8 字节应该是标准的时间戳大小。

【Take Away】`np.datetime64` 是最节约的时间戳，前提是把他们放入一个`ndarray`。

接下来我们看看时间戳的影响，

```python=
import inspect
import pandas as pd
import numpy as np
from datetime import datetime
import random
from memray import Tracker
import pytz

HK_TZ = pytz.timezone("Asia/Hong_Kong")


def generate_a_lot_datetime(n: int = 1_000_000, tz: bool=False):
    
    with Tracker("generate_a_lot_datetime.bin", native_traces=True):
        res = []   
        for i in range(n):
            if tz:
                res.append(datetime(2022, random.randint(1, 12), random.randint(1, 28), 1, 1, 1, i%1000, tzinfo=HK_TZ))
            else:
                res.append(datetime(2022, random.randint(1, 12), random.randint(1, 28), 1, 1, 1, i%1000))

    return res

```

运行结果表明，时间戳并没有增加额外的内存分配，说明他们都指向了同一个时间戳对象。

![相同的tz信息](https://i.imgur.com/DZvLCUQ.png)


## 参考

- [chrono - Rust datetime library](https://docs.rs/chrono/0.4.22/chrono/struct.DateTime.html)
- [numpy - datetime64](https://github.com/numpy/numpy/blob/v1.23.0/numpy/core/src/multiarray/datetime.c)
- [memray](https://github.com/bloomberg/memray)