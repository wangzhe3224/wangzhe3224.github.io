---
title: 重新认识 Python（8）PyObject
date: 2021-03-20
tags: [Python, CPython]
categories: Coding
---

# 重新认识 Python（8）PyObject

> 开发环境设置和入门请看：https://zhuanlan.zhihu.com/p/358690339

本片主要介绍 Python 对象的内存构成，以及如何组织对象的方法。更多内容可以看： https://wangzhe3224.github.io/

## `PyObject` 和 `PyTypeObject`

`PyObject` 可说是 CPython 最核心的数据结构了，在 Python 的世界里，几乎任何元素都是 PyObject 的指针（注意这里是指针，不是实际内存空间）。

```c 
// Include/object.h
/* Define pointers to support a doubly-linked list of all live heap objects. */
#define _PyObject_HEAD_EXTRA            \
    struct _object *_ob_next;           \
    struct _object *_ob_prev;
    
typedef struct _object {
    _PyObject_HEAD_EXTRA
    Py_ssize_t ob_refcnt;
    PyTypeObject *ob_type;
} PyObject;
```

所有分配在堆内存中的python对象都具有上述结构：
- `_PyObject_HEAD_EXTRA` 包含两个指向前后对象的指针，这样堆内存中的对象就会连接成为链表，以便进行内存管理。
- `ob_refcnt` 是对象的引用计数器，是GC的一部分，refcnt归零，该对象内存被回收。`Py_INCREF` 和 `Py_DECREF` 两个宏操作。
- `*ob_type` 是对象的类型指针，决定了这个对象是什么类型，比如 int 或者 其他自定义类型。

实际上，**所有** Python 在内存中的头部都是一个 `PyObject` 结构，如下图所示。

![对象的内存分布](https://i.imgur.com/qBt3pvW.png)

让我们继续看 `PyTypeObject` 这个结构体，内部定义了类型支持的操作的*指针*。举个例子，`*tp_as_number` 是一个指向 `PyNumberMethod` 结构体的指针。这个结构体包含了一系列函数指针，这些函数就是数字类型支持的计算，比如 `nb_add`, `nb_and` 等等。这里也包含了指向魔法函数的指针，比如 `tp_new` 指向的就是 `__new__` 的函数代码。这个类型结构体囊括了python类型可能支持的所有功能，其中有些其他类型是强制必须实现的，比如 `tp_new`，有些则是可选的，比如 `tp_init` 。

```c 
// Include/cpython/object.h
struct _typeobject {
    PyObject_VAR_HEAD
    const char *tp_name; /* For printing, in format "<module>.<name>" */
    Py_ssize_t tp_basicsize, tp_itemsize; /* For allocation */

    destructor tp_dealloc;
    Py_ssize_t tp_vectorcall_offset;
    getattrfunc tp_getattr;
    setattrfunc tp_setattr;
    PyAsyncMethods *tp_as_async; /* formerly known as tp_compare (Python 2)
                                    or tp_reserved (Python 3) */
    reprfunc tp_repr;
    
    PyNumberMethods *tp_as_number;
    PySequenceMethods *tp_as_sequence;
    PyMappingMethods *tp_as_mapping;

    hashfunc tp_hash;
    ternaryfunc tp_call;
    reprfunc tp_str;
    getattrofunc tp_getattro;
    setattrofunc tp_setattro;
    //。。。
    //此处省略
    };
    
typedef struct {
    binaryfunc nb_add;
    binaryfunc nb_subtract;
    binaryfunc nb_multiply;
    binaryfunc nb_remainder;
    binaryfunc nb_divmod;
    ternaryfunc nb_power;
    //。。。。
    //此处省略
    } PyNumberMethods;
```

你可能已经发现，`PyTypeObject` 其实就是定义一个接口，所有对象必须满足这个接口。其中有几个值得注意的子接口：
- `PyNumberMethods`，定义了数字相关的结构，比如 +,-,>，等等。换句话说，一个类型要向支持这些运算符，就必须实现这个接口
- `PySequenceMethods`，定义了序列相关的函数，比如 len, in 等等
- `PyMappingMethods`，定义了一些字典类的函数

总结一下 Python 内存中的对都拥有类似的头部和组织结构：

![](https://i.imgur.com/D3euvFc.png)


## `tuple` 类

我们来看一个具体的例子，`tuple`。这里先介绍语言的内建类型，对于自定义类型（自己写的类）的说明，放在后面说。

`PyTuple_Type` 就是 `PyTypeObject` 的一个实例：

首先，第一个 field 是 tuple 的基类：`PyType_Type`，其实在 python 解释器中就是 `type` 。第二个 field 是这个类打印出来的名字，这里就是 tuple，也就是解释器中 `type(a_tuple)` 的返回值。接下来就是tuple对象的大小和其内部元素的大小。注意到其中很多 0，这就表示这个类型没有实现哪些接口。

```c 
PyTypeObject PyTuple_Type = {
    PyVarObject_HEAD_INIT(&PyType_Type, 0)
    "tuple",
    sizeof(PyTupleObject) - sizeof(PyObject *),
    sizeof(PyObject *),
    (destructor)tupledealloc,                   /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    (reprfunc)tuplerepr,                        /* tp_repr */
    0,                                          /* tp_as_number */
    &tuple_as_sequence,                         /* tp_as_sequence */
    &tuple_as_mapping,                          /* tp_as_mapping */
    (hashfunc)tuplehash,                        /* tp_hash */
    0,                                          /* tp_call */
    0,                                          /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Py_TPFLAGS_DEFAULT | Py_TPFLAGS_HAVE_GC |
        Py_TPFLAGS_BASETYPE | Py_TPFLAGS_TUPLE_SUBCLASS |
        _Py_TPFLAGS_MATCH_SELF,               /* tp_flags */
    tuple_new__doc__,                           /* tp_doc */
    (traverseproc)tupletraverse,                /* tp_traverse */
    0,                                          /* tp_clear */
    tuplerichcompare,                           /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    tuple_iter,                                 /* tp_iter */
    0,                                          /* tp_iternext */
    tuple_methods,                              /* tp_methods */
    0,                                          /* tp_members */
    0,                                          /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    0,                                          /* tp_descr_get */
    0,                                          /* tp_descr_set */
    0,                                          /* tp_dictoffset */
    0,                                          /* tp_init */
    0,                                          /* tp_alloc */
    tuple_new,                                  /* tp_new */
    PyObject_GC_Del,                            /* tp_free */
    .tp_vectorcall = tuple_vectorcall,
};
```




## 实例化 type 

接下来我们看当我们在python里创建一个 tuple 的时候发生了什么？构造函数会被调用，比如 `tuple_new`。也就是 pytype 里面的 `tp_new` 指针指向的函数。

```c 
// Objects/tupleobject.c
static PyObject *
tuple_new(PyTypeObject *type, PyObject *args, PyObject *kwargs)
{
    PyObject *return_value = NULL;
    PyObject *iterable = NULL;

    if ((type == &PyTuple_Type) &&
        !_PyArg_NoKeywords("tuple", kwargs)) {
        goto exit;
    }
    if (!_PyArg_CheckPositional("tuple", PyTuple_GET_SIZE(args), 0, 1)) {
        goto exit;
    }
    if (PyTuple_GET_SIZE(args) < 1) {
        goto skip_optional;
    }
    iterable = PyTuple_GET_ITEM(args, 0);
skip_optional:
    return_value = tuple_new_impl(type, iterable);

exit:
    return return_value;
}
```

而这个构造函数会返回一个 `PyTupleObject`，正是这个结构包含了一个指向 tuple 内部真正元素的指针。

```c 
typedef struct {
    PyObject_VAR_HEAD
    /* ob_item contains space for 'ob_size' elements.
       Items must normally not be NULL, except during construction when
       the tuple is not yet visible outside the function that builds it. */
    PyObject *ob_item[1];
} PyTupleObject;
```

**这里需要注意**：`PyTupleObject` 是实际被分配在堆内存的对象，我们可以创建很多对象，但是他们对应的函数都被包含在 `PyTuple_Type` 中，而这个对象是唯一的，所有 tuple 对象都会指向他。

![](https://i.imgur.com/LxvTRK4.png)


## 实例化自定义类型

那么当我们实例化自定义类型的时候，发生了什么？

```python 
class A:
    pass
    
a = A()
```

这里 A 是我们的自定义类，它默认继承了 `type`。当我们写 `()` 这个语法的时候，实际上会触发 `tp_call` 指向的函数，即 type 的 call 方法。

```c 
static PyObject *
type_call(PyTypeObject *type, PyObject *args, PyObject *kwds)
{
    PyObject *obj;
    PyThreadState *tstate = _PyThreadState_GET();

    // 省略代码

    obj = type->tp_new(type, args, kwds);  // 注意这里调用了 new 方法
    obj = _Py_CheckFunctionResult(tstate, (PyObject*)type, obj, NULL);
    if (obj == NULL)
        return NULL;

    /* If the returned object is not an instance of type,
       it won't be initialized. */
    if (!PyType_IsSubtype(Py_TYPE(obj), type))
        return obj;

    type = Py_TYPE(obj);
    if (type->tp_init != NULL) {
        int res = type->tp_init(obj, args, kwds);
        if (res < 0) {
            assert(_PyErr_Occurred(tstate));
            Py_DECREF(obj);
            obj = NULL;
        }
        else {
            assert(!_PyErr_Occurred(tstate));
        }
    }
    return obj;
}
```