---
title: 重新认识 Python（7）CPython初探
date: 2021-03-20
tags: [Python, CPython]
categories: Coding
---

# 重新认识 Python（7）CPython初探

CPython 是 Python 社区的标准，其他版本的 Python，比如 pypy，都会遵行 CPython 的标准API实现。想要更深入的认识 Python，就需要了解 CPython 实现。这一期，我就带大家认识一下 CPython 源代码，为日后改造 Python 做准备。首先，展示如何本地编译最新的 CPython代码。然后，展示如何 debug 编译好的解释器。最后我们会利用 CPython 实现简单的函数调用。

本文会为你揭开 CPython 的面纱，带你进入 C + Python 的世界。文章的最后，你也会对 Python 中最重要的概念：一切皆对象（object）有更深刻的认识；你还会发现一点点线索，为什么Python用起来比其他语言，比如 C 慢很多。

请打开编辑器和命令行，我们开始。（本文主要使用MacOS，Windows 不一定可以直接实现）。

## 当我们再说 Python，我们在说什么？

在我还是小小白的时候，我经常会想：当我们说 Python 的时候，我们到底在说什么？后来当我学了编译原理，我变成了一个小白，我知道了，当我们说 Python 的时候，我们其实再说两个东西：语言的语法和语言的运行时。

语法主要规定了如何表达程序，比如我们写 `a = 1` 是合法的，且有语义；而当我写 `for i in 1:` 的时候，是不合法的，语义也就无法确定。运行时（run time）是指运行我们写好的代码的另一个“程序”。也就是当我们输入 `python test.py` 的时候，这里面的 python 就是我们的“程序”，这个运行时负责执行我们的代码。

而这个 runtime，可以有很多不同的实现，比如 CPython 实现就是一个用 C 语言实现运行时，而 pypy 则是用 RPython 实现的运行时等等。这个 runtime 可以理解我们写的 python 代码，并且把它编译成 python 的字节码，然后执行。比如：

```python
a = 1
print(a)
```

上面的代码在屏幕打印1。如何实现的呢？其实是我们的运行时“程序” `python` 实现的。首先，python 会把上面的源代码翻译成字节码：

```
import dis

dis.dis("a=1;print(1)")  # 这一行会把源代码编译成字节码，就是 python 认识的操作。

## 结果
  1           0 LOAD_CONST               0 (1)
              2 STORE_NAME               0 (a)
              4 LOAD_NAME                1 (print)
              6 LOAD_NAME                0 (a)
              8 CALL_FUNCTION            1
             10 POP_TOP
             12 LOAD_CONST               1 (None)
             14 RETURN_VALUE
```

上面的字节码，背后就是 python 程序提供的一些基本操作。比如 `LOAD_CONST`，加载常数 1 进入内存。你可以在[这里](https://github.com/python/cpython/blob/master/Include/opcode.h)找到所有的字节码。

一句话总结，`CPython` 就是一个可以执行你写的python代码的另一个由 C 语言写的程序。

## 编译 CPython

首先，我们要去 github fork CPython 的代码到自己的账户下：https://github.com/python/cpython 。然后我们作如下操作：

```bash 
xcode-select --install
brew install git
brew install openssl
brew install readline

# mac 需要 xcode 才能编译
git clone git@github.com:{你的账户。。}/cpython.git
cd cpython
git remote add upstream git@github.com:python/cpython.git
# 把原始仓库加入
# 编译 python，加入debug选项，方便我们后面进一步探索。
PKG_CONFIG_PATH="$(brew --prefix openssl)/lib/pkgconfig" \
CPPFLAGS="-I$(brew --prefix readline)/include" \
LDFLAGS="-L$(brew --prefix readline)/lib" \
./configure --with-pydebug \
&& make
```

很快编译就会成功，此时你的当前目录下会出现一个 `python.exe` 的可执行文件，这就是我们编译好的 Python！

输入 `./python.exe` 就会看见熟悉的python解释器了提示符了。
```
Python 3.10.0a6+ (heads/master:f00e82f8b8, Mar 13 2021, 23:26:48) [Clang 11.0.3 (clang-1103.0.32.59)] on darwin
Type "help", "copyright", "credits" or "license" for more information.
>>>
```

## Debug CPython

编译完成后，我们就可以来看看 CPython 内部的“秘密”了。这里我用的 `lldb` 因为 Mac 的安装 gdb 比较复杂。基本步骤是一样的。

输入 `lldb python.ext`。接下来，我们需要在 `Programs/python.c` 的 main 函数处设置一个断点。这个函数就整个解释器的入口。

```
(lldb) b main
Breakpoint 1: where = python.exe`main + 22 at python.c:15:25, address = 0x0000000100000856
(lldb) r
Process 43373 launched: '/Users/zhewang/Projects/cpython/python.exe' (x86_64)
Process 43373 stopped
* thread #1, queue = 'com.apple.main-thread', stop reason = breakpoint 1.1
    frame #0: 0x0000000100000856 python.exe`main(argc=1, argv=0x00007ffeefbff330) at python.c:15:25
   12  	int
   13  	main(int argc, char **argv)
   14  	{
-> 15  	    return Py_BytesMain(argc, argv);
   16  	}
   17  	#endif
```

好，现在我们就停留在了 CPython 世界的入口了！

## 简单的加法！

现在我们在 debug 环境下，用 CPython 来实现一个整数的加法。

首先，我们来看一下 int 这个 object。我把部分 int object 的代码放在下面。可以看出，python 里面连最基本的 int 对象都别有洞天！要知道python运行的时候，每一个整数在内存里其实都包含了下面结构体所有的变量。具体文件可以在 `Objects/longobject.c` 找到。

`PyVarObject_HEAD_INIT` 定义了 int 的类型，int 的类型其实叫 `PyLong_Type`，他的基类是一个叫 `PyType_Type` 的类型。比如在python中，`type(1)` 会返回 `int`，即下面的 tp_name，而 `type(type(1))` 则返回 `type`，即`PyType_Type`。当然 python 的整数做的这么复杂主要是为了保持所有对象类型协调统一，即无论是复杂的类型还是简单的类型，他们的内存结构都是样的！（ 这里插一嘴，python的int是long，也就是说可以是任意大的整数，不会溢出！）

```c
PyTypeObject PyLong_Type = {
    PyVarObject_HEAD_INIT(&PyType_Type, 0)
    "int",                                      /* tp_name */
    offsetof(PyLongObject, ob_digit),           /* tp_basicsize */
    sizeof(digit),                              /* tp_itemsize */
    0,                                          /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    long_to_decimal_string,                     /* tp_repr */
    &long_as_number,                            /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    (hashfunc)long_hash,                        /* tp_hash */
    0,                                          /* tp_call */
    0,                                          /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Py_TPFLAGS_DEFAULT | Py_TPFLAGS_BASETYPE |
        Py_TPFLAGS_LONG_SUBCLASS |
        _Py_TPFLAGS_MATCH_SELF,               /* tp_flags */
    long_doc,                                   /* tp_doc */
    0,                                          /* tp_traverse */
    0,                                          /* tp_clear */
    long_richcompare,                           /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    long_methods,                               /* tp_methods */
    0,                                          /* tp_members */
    long_getset,                                /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    0,                                          /* tp_descr_get */
    0,                                          /* tp_descr_set */
    0,                                          /* tp_dictoffset */
    0,                                          /* tp_init */
    0,                                          /* tp_alloc */
    long_new,                                   /* tp_new */
    PyObject_Del,                               /* tp_free */
};
```

我们现在在debug 环境里面可以尝试创造一个 int 对象！

```
(lldb) b pymain_import_readline
Breakpoint 1: where = python.exe`pymain_import_readline + 12 at main.c:205:9, address = 0x000000010032ad1c
(lldb) r
Process 54697 launched: '/Users/zhewang/Projects/cpython/python.exe' (x86_64)
Python 3.10.0a6+ (heads/master:f00e82f8b8, Mar 20 2021, 21:50:27) [Clang 11.0.3 (clang-1103.0.32.59)] on darwin
Type "help", "copyright", "credits" or "license" for more information.
Process 54697 stopped
* thread #1, queue = 'com.apple.main-thread', stop reason = breakpoint 1.1
    frame #0: 0x000000010032ad1c python.exe`pymain_import_readline(config=0x00000001007503d0) at main.c:205:9
   202 	static void
   203 	pymain_import_readline(const PyConfig *config)
   204 	{
-> 205 	    if (config->isolated) {
   206 	        return;
   207 	    }
   208 	    if (!config->inspect && config_run_code(config))
```

我们停在这里，Python已经完成一些初始化设置，但是还没有进入 >>> 交互环境。这时，我们使用 CPython 的底层函数创建两个 int 对象。

```
(lldb) call PyLong_FromLong(10)
(PyObject *) $0 = 0x00000001007a8500
(lldb) call PyLong_FromLong(20)
(PyObject *) $1 = 0x00000001007a8780
```

可以看到，返回的是一个指向 `PyObject` 的指针。其实这个就是一切皆对象中的对象啦，就是这个 `PyObject`，Python中所有类型实例化后都是这个这个 PyObject。来看一下这两对象的内存：

```
(lldb) p *$0
(PyObject) $2 = {
  ob_refcnt = 10
  ob_type = 0x00000001004936f0
}
(lldb) p *$1
(PyObject) $3 = {
  ob_refcnt = 8
  ob_type = 0x00000001004936f0
}
```

可以看到，他们有两个field，一个是 refcnt 用来管理垃圾回收，另一个是 ob_type 指向对象类型的内存。通过访问 ob_type 可以看到该类型的内存：

```
(lldb) p *$1->ob_type
(PyTypeObject) $5 = {
  ob_base = {
    ob_base = {
      ob_refcnt = 68
      ob_type = 0x000000010049a620
    }
    ob_size = 0
  }
  tp_name = 0x0000000100407b51 "int"
  tp_basicsize = 24
  tp_itemsize = 4
  tp_dealloc = 0x00000001001707c0 (python.exe`object_dealloc at typeobject.c:4062)
  tp_vectorcall_offset = 0
  。。。省略
```

接下来我们看看我们的 PyLong_Type 支持哪些运算：

```
(lldb) p *PyLong_Type->tp_as_number
(PyNumberMethods) $9 = {
  nb_add = 0x000000010011b180 (python.exe`long_add at longobject.c:3065)
  nb_subtract = 0x000000010011ae00 (python.exe`long_sub at longobject.c:3099)
  nb_multiply = 0x000000010011dac0 (python.exe`long_mul at longobject.c:3533)
  nb_remainder = 0x000000010011dda0 (python.exe`long_mod at longobject.c:3966)
  nb_divmod = 0x000000010011dee0 (python.exe`long_divmod at longobject.c:3982)
  nb_power = 0x000000010011e0b0 (python.exe`long_pow at longobject.c:4098)
  nb_negative = 0x000000010011aca0 (python.exe`long_neg at longobject.c:4318)
  nb_positive = 0x000000010011c570 (python.exe`long_long at longobject.c:4692)
  ...
```

我们来试一下加法！

```
(lldb) p *PyLong_Typp.tp_as_number->nb_add
(PyObject *(*)(PyObject *, PyObject *)) $10 = 0x000000010011b180 (python.exe`long_add at longobject.c:3065)
```

可以看到，加法的函数签名是：`(PyObject *(*)(PyObject *, PyObject *))`。

```
(lldb) p PyLong_Type.tp_as_number->nb_add((PyObject *) 0x00000001007a8500,(PyObject *) 0x00000001007a8780)
(PyObject *) $15 = 0x00000001007a8a00
```

我们得到了另一个 PyObject 的指针，0x00000001007a8a00。这个理论上就是 10+20 的结果，30。我们来验证一下。

```
(lldb) p *(PyLongObject *) 0x00000001007a8a00
(PyLongObject) $30 = {
  ob_base = {
    ob_base = {
      ob_refcnt = 8
      ob_type = 0x00000001004936f0
    }
    ob_size = 1
  }
  ob_digit = ([0] = 30)  # <--- 这里就是我们的答案。。
}
```

## 总结

这一篇 CPython 初探就到这里，我们学会了如何编译、debug我们的Python解释器，用CPython的API实现了简答的加法。有了这些基础知识我们就可以开始进一步探索CPython的世界了！
