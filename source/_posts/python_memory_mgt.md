---
title: 重新认识 Python（2）内存管理
date: 2021-02-18
tags: [Python, CPython]
categories: Coding
---

# 重新认识 Python（2）：内存管理

理解内存管理需要知道通常内存使用的基本规则。一般来说，一个进程的内存会被划分成两个部分，堆（heap）和栈（stack）。栈的结构相对简单，本质上就是一个先进后出队列，所有被分配在栈上的值必须是确定大小的、静态的。栈的功能主要是临时存储函数运行时的参数、临时变量和结果。显然，在程序运行的时候，我们需要产生许多大小不固定且动态的值，比如对象、列表、字典等等，这些数据结构不能直接分配到栈上，因此我们需要堆来存放这些值。相应的，堆的内存空间往往比栈大的多。

而我们通常将的内存管理，本质上是堆管理，不是栈管理。

## 对象，Object

Python的内存管理主要是针对“一切皆对象”这个设计理念设计的（这里我们仅针对CPython实现展开说明。）。什么是对象，Object？在Python的世界里对象就是任何分配在堆中的值。

在CPython实现中，对象是struct, `PyObject`，包含四个部分：

- 指向其他对象的指针(用来找到其他的对象)
- 对象的引用计数器
- 类型指针
- 对象的大小（对于大小可变的对象）

```c=
#define _PyObject_HEAD_EXTRA            \
    struct _object *_ob_next;           \
    struct _object *_ob_prev;

typedef struct _object {
    _PyObject_HEAD_EXTRA
    Py_ssize_t ob_refcnt;
    PyTypeObject *ob_type;
} PyObject;

typedef struct {
    PyObject ob_base;
    Py_ssize_t ob_size; /* Number of items in variable part */
} PyVarObject;
```

类型对象也是一个对象，类型对象的类型指针指向他自己。对象一旦分配，他的的类型、size、地址就不能再改变。对于一些size会改变的对象，比如list或者dict，他们实现大小可变的方法是通过指针指向其他对象。

## 内存管理架构

CPython的内存管理是层状的，主要分成3层：
- object-specific memory
- object memory
- raw memory

raw memory以下的内存就脱离了Python的控制，移交操作系统控制，如下图：

```
    Object-specific allocators
    _____   ______   ______       ________
   [ int ] [ dict ] [ list ] ... [ string ]       Python core         |
+3 | <----- Object-specific memory -----> | <-- Non-object memory --> |
    _______________________________       |                           |
   [   Python's object allocator   ]      |                           |
+2 | ####### Object memory ####### | <------ Internal buffers ------> |
    ______________________________________________________________    |
   [          Python's raw memory allocator (PyMem_ API)          ]   |
+1 | <----- Python memory (under PyMem manager's control) ------> |   |
    __________________________________________________________________
   [    Underlying general-purpose allocator (ex: C library malloc)   ]
 0 | <------ Virtual memory allocated for the python process -------> |
   =========================================================================
    _______________________________________________________________________
   [                OS-specific Virtual Memory Manager (VMM)               ]
-1 | <--- Kernel dynamic storage allocation & management (page-based) ---> |
    __________________________________   __________________________________
   [                                  ] [                                  ]
-2 | <-- Physical memory: ROM/RAM --> | | <-- Secondary storage (swap) --> |
```

因为Python的runtime会存在成千上万个Object，但是这些对象通常非常的小，比如int object，runtime必须减少小对象的内存分配代价。基本原理就是通过提前申请，且不轻易交回内存，反复利用已经申请到的内存。对于比较大的对象，超过512kb的对象，Python会直接调用C的内存分配器，直接在堆上申请内存。

下面我们主要介小于512kb的对象的内存管理。

## 小对象的内存管理

对于小对象内存，Python主要提供了三类对象进行管理：`arena`, `pool`, `block`。

- block, 最小内存分配单位，每一个block的大小以8byte为单位，划分为64个组。
- pool, 是相同大小block的集合
- arena, 每一个大小为256kb，包含64个pool

### block

Block是Python对象内存分配的最小单位，从8byte(或者16byte)到512byte不等。

```
 * Request in bytes     Size of allocated block      Size class idx
 * ----------------------------------------------------------------
 *        1-8                     8                       0
 *        9-16                   16                       1
 *       17-24                   24                       2
 *       25-32                   32                       3
 *       33-40                   40                       4
 *       41-48                   48                       5
 *       49-56                   56                       6
 *       57-64                   64                       7
 *       65-72                   72                       8
 *        ...                   ...                     ...
 *      497-504                 504                      62
 *      505-512                 512                      63
```

### pool

`pool` 是相同分组（大小） `block` 的集合。一般，pool的大小为4kb（内存分页的大小），这主要是为了方便处理内存的fragmentation。如果一个对象被回收了，内存管理器可以再次利用这部分内存存储其他合适大小的对象。pool的结构如下：

```c=
/* Pool for small blocks. */
struct pool_header {
    union { block *_padding;
            uint count; } ref;          /* number of allocated blocks    */
    block *freeblock;                   /* pool's free list head         */
    struct pool_header *nextpool;       /* next pool of this size class  */
    struct pool_header *prevpool;       /* previous pool       ""        */
    uint arenaindex;                    /* index into arenas of base adr */
    uint szidx;                         /* block size class index        */
    uint nextoffset;                    /* bytes to virgin block         */
    uint maxnextoffset;                 /* largest valid nextoffset      */
};
```

可以看到，每一个pool通过双链表连接在一起，`szidx` 记录了这个pool下面的block的size，`ref.count` 记录了已经被使用的blocks，`arenaindex` 则记录了这个pool所属的 `arena` 地址。`freeblock` 是当前可用的第一个block的地址。值得注意的是，如果一个block是空的，那么它会存储下一个空block的地址，这样方便寻址。

每一个pool包含三个状态：
- used，部分被使用
- full，全部被使用
- empty，空

为了提高寻址效率，Python还维护一个array `usedpools`, 存储不同分组的pool的头地址。如下：

![](https://i.imgur.com/Hg7D3Rl.png)

另外，block和pool不会直接分配内存，他们只是维护内存的数据结构，内存是由 `arena` 进行分配的。

### Arena

`Arena` 代表了一片大小为256kb的在堆上的内存空间，每一个 arena 包含 64 个pool。arena的结构如下：

```c=
struct arena_object {
    uintptr_t address;
    block* pool_address;
    uint nfreepools;
    uint ntotalpools;
    struct pool_header* freepools;
    struct arena_object* nextarena;
    struct arena_object* prevarena;
};
```

同样，arena也是被双链表连接在一起，`ntotalpools`和`nfreepool`记录了目前可用的pool的信息。

## 内存使用

Python很少会把已经申请的小内存交还给操作系统，而是反复利用已经拥有的内存，以提高内存管理效率。通常一个 `arena` 只有在其全部pool均为空的情况下，才会被系统回收。这种情况可能发生，比如当你申请了大量小且短命的对象时候，垃圾回收后可能会出现这种完全空的 `arena`。

另一个角度说，Python进程可能会长期占有一些它不直接需要的内存。

内存使用状况可以通过：`sys._debugmallocstats()` 查询。

比如：
```
Small block threshold = 512, in 32 size classes.

class   size   num pools   blocks in use  avail blocks
-----   ----   ---------   -------------  ------------
    0     16           6            1484            34
    1     32          58            7247            61
    2     48         175           14654            46
    3     64        1171           73721            52
    4     80        1542           75259          1841
    5     96         478           19851           225
    6    112         184            6554            70
    7    128         154            4766             8
    8    144         950           26272           328
    9    160          75            1812            63
   10    176         405            9183           132
   11    192          45             916            29
   12    208          35             651            14
   13    224          34             603             9
   14    240         118            1876            12
   15    256          29             402            33
   16    272          26             357             7
   17    288          20             277             3
   18    304         157            2034             7
   19    320          18             211             5
   20    336          22             254            10
   21    352          17             181             6
   22    368          15             157             8
   23    384          15             147             3
   24    400          15             143             7
   25    416          21             185             4
   26    432          38             340             2
   27    448          50             446             4
   28    464          45             354             6
   29    480          35             275             5
   30    496          36             279             9
   31    512          47             324             5

# arenas allocated total           =                  167
# arenas reclaimed                 =                   69
# arenas highwater mark            =                   98
# arenas allocated current         =                   98
98 arenas * 262144 bytes/arena     =           25,690,112

# bytes in allocated blocks        =           23,843,888
# bytes in available blocks        =              323,536
236 unused pools * 4096 bytes      =              966,656
# bytes lost to pool headers       =              289,728
# bytes lost to quantization       =              266,304
# bytes lost to arena alignment    =                    0
Total                              =           25,690,112

       3 free PyCFunctionObjects * 48 bytes each =                  144
           27 free PyDictObjects * 48 bytes each =                1,296
           7 free PyFloatObjects * 24 bytes each =                  168
          5 free PyFrameObjects * 368 bytes each =                1,840
           72 free PyListObjects * 40 bytes each =                2,880
         31 free PyMethodObjects * 40 bytes each =                1,240
 102 free 1-sized PyTupleObjects * 32 bytes each =                3,264
1998 free 2-sized PyTupleObjects * 40 bytes each =               79,920
 128 free 3-sized PyTupleObjects * 48 bytes each =                6,144
   4 free 4-sized PyTupleObjects * 56 bytes each =                  224
  25 free 5-sized PyTupleObjects * 64 bytes each =                1,600
  25 free 6-sized PyTupleObjects * 72 bytes each =                1,800
   3 free 7-sized PyTupleObjects * 80 bytes each =                  240
   1 free 8-sized PyTupleObjects * 88 bytes each =                   88
   0 free 9-sized PyTupleObjects * 96 bytes each =                    0
 0 free 10-sized PyTupleObjects * 104 bytes each =                    0
 0 free 11-sized PyTupleObjects * 112 bytes each =                    0
 0 free 12-sized PyTupleObjects * 120 bytes each =                    0
 0 free 13-sized PyTupleObjects * 128 bytes each =                    0
 0 free 14-sized PyTupleObjects * 136 bytes each =                    0
 0 free 15-sized PyTupleObjects * 144 bytes each =                    0
 1 free 16-sized PyTupleObjects * 152 bytes each =                  152
 0 free 17-sized PyTupleObjects * 160 bytes each =                    0
 1 free 18-sized PyTupleObjects * 168 bytes each =                  168
 0 free 19-sized PyTupleObjects * 176 bytes each =                    0
```


## 参考

- https://github.com/python/cpython/blob/cc54001c2eb3b14320c1667b22602d69c90d5865/Objects/object.c
- https://github.com/python/cpython/blob/master/Include/object.h
- https://github.com/python/cpython/blob/ad051cbce1360ad3055a048506c09bc2a5442474/Objects/obmalloc.c#L534
- https://rushter.com/blog/python-memory-managment/