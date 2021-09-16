---
title: CSAPP 2 信息的表达和操作
date: 2021-04-09
tags: CSAPP
categories: Computing
---

# CSAPP 2 信息的表达和操作

目前的计算机技术存储信息是二进制的，我们用0和1表达信息。最基本的信息有两种：整数和浮点数。字符串也会被编码成整数表达。从根本上说，我们规定了一些规则（向下文）来解释这些0和1。通过基本的代数法则就可以实现运算了。

为了方便人类阅读，常用的编码进制包括8进制和16进制。

## Code

```c=
#include "csapp.h"
#include <stdio.h>

void print_int(int x) { printf("int: %d\n", x); }
void print_dbl(double x) { printf("double: %g\n", x); }
void print_int_arr(int a[]) {
    int i;
    printf("int array: [");
    for (i=0;i<=(sizeof(a))/sizeof(a[0]); i++) {
        printf("%d, ", a[i]);
    }
    printf("]\n");
}
void print_default() { puts("unknown argument"); }
#define print(X) _Generic((X), \
        int: print_int, \
        double: print_dbl, \
        int*: print_int_arr, \
        default: print_default)(X)

#define problem(x) printf("\n * Problem %s: \n", x)
#define comment(x) printf("%s\n", x)

typedef unsigned char *byte_pointer;

void show_bytes(byte_pointer start, int len) {
    int i;
    for (i=0; i<len; i++) {
        printf(" %.2x", start[i]);
    }
    printf("\n");
}

void show_int(int x) {
    show_bytes((byte_pointer) &x, sizeof(int));
}

void show_float(float x) {
    show_bytes((byte_pointer) &x, sizeof(float));
}

void show_pointer(void* x) {
    show_bytes((byte_pointer) &x, sizeof(void *));
}

void swap(int *x, int *y) {
    *y = *x^*y;
    *x = *x^*y; /*Step2*/
    *y = *x^*y; /*Step3*/
}

void reverse_array(int a[], int cnt) {
    // 1,2,3  -> 3,2,1
    int first, last;
    for (first=0, last=cnt-1;
        first < last;
        first++, last--) {
            swap(&a[first], &a[last]);
        };
}

int main()
{
    int x = 1;
    float y = 1.0;
    show_int(x);
    show_float(y);
    show_pointer(&x);
    printf("Sizeof float is %lu \n", sizeof(float));
    printf("Sizeof int is %lu \n", sizeof(int));
    // Problem 2.6
    problem("2.6");
    int a = 3510593;
    int b = 3510593.0;
    show_int(b);   // ? why this shows as same as a?
    show_int(a);   //        1101011001000101000001
    show_float(b); // 1001010010101100100010100000100
    // Problem 2.7
    const char *s = "abcdef";
    show_bytes((byte_pointer)s, strlen(s)); //  61 62 63 64 65 66

    /*
    a = 110
    b = 001

    b = a ^ b  -> b = 110 ^ 001 = 111
    a = a ^ b  -> a = 110 ^ 111 = 001
    b = a ^ b  -> b = 001 ^ 111 = 110
    */
    problem("2.10");
    int aa = 1;
    int bb = 2;
    swap(&aa, &bb);
    print(aa);
    print(bb);

    problem("2.11");
    comment("Note that a ^ a = 0");
    int a2[] = {1, 2, 3};
    print(a2);
    reverse_array(a2, 3);
    print(a2);

    problem("2.12");
    int x12 = 0x87654321;
    printf("%x\n", x12 & 0xFF);
    printf("%x\n", ~( x12 ^ 0xFF ));
    printf("%x\n", x12 | 0xFF);
    printf("%x\n", ~( 0x11 ^ 0xFF ));
}
```