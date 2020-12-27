---
title: SICP
date: 2020-12-25
tags: [SICP]
categories: Computing
---
**SICP quick overview**

# Building Abstraction with Procedures

## The Elements of Programming

Three machanisms of powerful language:
- primitive expression, the simplest entities the language is concerned with
- means of combination, compound elements are built from simpler ones
- means of abstraction, compound elements can be named and manipulated as units

Two elements in programming (maybe just one): data and procedures.

`define` is the simplest means of abstraction. 

`environment` the memory to keep track name-value bindings.

### Evaluating Combinations

General rule of evaluation of combinations:
1. Evaluate the sub-expression of the combinations
2. Apply the procedure: value of leftmost sub-expression to the arguments that are the value s of the other sub-expressions

`(define x 3)` is not a combination, which is not handled by above.
These kind of exceptions are *special forms*. Special forms have their
own evaluation rules.

### Compound Procedures

`(define (square x) (* x x))` 
in the form of 
`(define (<name> <parameters>) (body))`

we can now compound to more complex procedures:
`(define (sum-of-square x y) (+ (square x) (square y)))`. 

From now on, compound procedures are as same as primitive procedures.

### Substitution Model for Procedure Application

The application process is:
> To apply a compound procedure to arguments, evaluate the body of the procedure with each formal parameter replaced by the corresponding argument.

This is the meaning of procedure application. **But this is not necessarily how the program is executed.**

(Applicative-order evaluation) The interpreter first evaluates the operator and operands and then applies the resulting procedure to the resulting arguments. 
(Normal-order evaluation) An alternative evaluation model would not evaluate the operands until their values were needed.

### Conditional Expressions

```clojure=
(define (abs x)
 (cond ((> x 0) x)
       ((= x 0) 0)
       ((< x 0) (- x)))
```

More examples:

```clojure=
(define (a-plus-abs-b a b) ((if (> b 0) + -) a b))
```


## Procedures and the Processes generated

> The ability to visualize the consequences of the actions under consideration is crucial to becoming an expert programmer

> A procedure is a pattern for the local evolution of a computational process.

```clojure=
(define (factorial n) 
 (if (= n 1)
     1
     (* n (factorial (- n 1)))))
```

vs 

```clojure=
(define (factorial n) (fact-iter 1 1 n))
(define (fact-iter product counter max-count) (if (> counter max-count)
product
(fact-iter (* counter product)
(+ counter 1) max-count)))
```

Here are some common pattern of computations.

### Linear Recursion and Iteration

The two procedures aim the same goal but the processes they generate 
have different evaluation shapes. One is a linear recursive process,
and one is a linear iterative process.

> The contrast between the two processes can be seen in another way. In the iterative case, the program variables provide a complete description of the state of the process at any point.

Note that, recursive procedure does not mean it will generate a recursive evaluation process (tail recursion for example). 
### Tree Recursion

Use transform can change a tree recursion to an iterative one.

### Order of Growth

Orders of growth provide only a crude description of the behavior of a process.

### Exponentiation

```clojure=
(define (expt b n)
  (if (= n 0)
      1
      (* b (expt b (- n 1)))))

(define (expt1 b n)
  (expt-iter b n 1))

(define (expt-iter b counter product)
  (if (= counter 0)
      product
      (expt-iter b
                 (- counter 1)
                 (* b product))))

(define (fast-expt b n)
  (cond ((= n 0) 1)
        ((even? n) (square (fast-expt b (/ n 2))))
        (else (* b (fast-expt b (- n 1))))))

(define (even? n)
(= (remainder n 2) 0))

(define (square n)
  (* n n))
```
## Formulating Abstractions with Higher-order Functions

Procedures are abstractions that describe compound operations.

### Procedures as Arguments

```clojure=
;; Procedures as Arguments
;; (define (inc n) (+ n 1))
(define (sum term a next b)
  (if (> a b)
      0
      (+ (term a)
         (sum term (next a) next b))))

(define (sum-iter term a next b)
  (define (iter a result)
    (if (> a b)
        result
        (iter (next a) (+ result (term a)))))
  (iter a 0))
```

`lambda` function is useful. `let` is useful to create local variables.

```clojure=
(let ((⟨var1⟩ ⟨exp1⟩) (⟨var2⟩ ⟨exp2⟩)
...
(⟨varn⟩ ⟨expn⟩)) ⟨body⟩)

```

### Procedures as General Methods


### Procedures as Return Values

Elements with the fewest restrictions are said to have first-class status. Some of the “rights and privileges” of first-class elements are:
- They may be named by variables.
- They may be passed as arguments to procedures.
- They may be returned as the results of procedures.
- They may be included in data structures.

# Building Abstractions with Data

After compound procedures, we build abstractions by compounding data.
> Just as the ability to define procedures enables us to deal with processes at a higher conceptual level than that of the primitive operations of the language, the ability to construct compound data objects enables us to deal with data at a higher conceptual level than that of the primitive data objects of the language.

The notion of `closure` is one of the key ideas dealing with compound 
data. Another idea is `conventional interfaces` to combine program module in mix-and-match ways. 

Data may be represented differently by different parts of program, this leads to `generic operations`. 

## Introduction of Data Abstraction

`selector` and `constructor` as interface of abstract data. 
Sometime, we also need `predicates`.

Example of rational number data abstraction: 

```clojure=
(define (make-rat n d) (cons n d))
(define (numer x) (car x))
(define (denom x) (cdr x))
(define (print-tar x)
  (newline)
  (display (numer x))
  (display "/")
  (display (denom x)))
```
The horizontal lines represent `abstraction barrier`.

![](https://i.imgur.com/jBwpFte.png)

### What is Meant by Data??

In general, we can think of data as defined by some collection of selectors and constructors, together with specified conditions that these procedures must fulfill in order to be a valid representation.

## Hierarchical Data and the Closure Property

THe ability to create pairs whose elements are pairs is the essence of list structure’s importance as a representational tool. This is called `closure property`: an operation for combining data objects satisfies the closure property if the results of combining things with that operation can themselves be combined using the same operation.

 >  very simplest programs rely on the fact that the elements of a combination can themselves be combinations.

With pairs we could build a lot of stuff.

### Sequences

```clojure=
;; Sequences
(define (list-ref items n)
  (if (= n 0)
      (car items)
      (list-ref (cdr items) (- n 1))))

(define (map proc items)
  (if (null? items)
      nil
      (cons (proc (car items))
            (map proc (cdr items)))))
```

### Hierarchical Structures

```clojure=
(define (count-leaves x)
  (cond ((null? x) 0)
        ((not (pair? x)) 1)
        (else (+ (count-leaves (car x))
                 (count-leaves (cdr x))))))
```

### Sequences as Conventional Interfaces

`Conventional Interfaces` is anther powerful design tool other than data abstraction. 

```clojure=
(define (enumerate-interval low high)
  (if (> low high)
      nil
      (cons low (enumerate-interval (+ low 1) high))))

(define (enumerate-tree tree)
  (cond ((null? tree) nil)
        ((not (pair? tree)) (list tree))
        (else (append (enumerate-tree (car tree))
                      (enumerate-tree (cdr tree))))))


(define (accumulate op initial sequence) (if (null? sequence)
      initial
      (op (car sequence)
          (accumulate op initial (cdr sequence)))))
```

### Example: the Picture Language

Good designs:
- Use data abstractions
- The means of combination satisfy the closure property
- With above, all the tools for abstracting procedures are available now
- complex system should be structured as a sequence of levels.

The language used at each level of a stratified design has primitives, means of combination, and means of abstraction appropriate to that level of detail. This is called `Stratified design`.


## Symbolic Data

Another type of data, Symbols, which is not numbers.
In order to manipulate symbols we need a new element in our language: the ability to `quote` a data object.

```clojure=
(list 'a 'b 'c)
(cdr '((x1 x2) (y1 y2)))
(cadr '((x1 x2) (y1 y2)))
(pair? (car '(a short list)))
```

### Example: Symbolic Differentiation

First, work out the data abstractions needed: `constructor`, `selector`, and `predicator`. 

Then define the procedure to do derive on above data abstraction.

```clojure=
(define (deriv exp var) (cond ((number? exp) 0)
((variable? exp) (if (same-variable? exp var) 1 0)) ((sum? exp) (make-sum (deriv (addend exp) var)
                              (deriv (augend exp) var)))
((product? exp) (make-sum
(make-product (multiplier exp)
(deriv (multiplicand exp) var))
(make-product (deriv (multiplier exp) var) (multiplicand exp))))
(else
(error "unknown expression type: DERIV" exp))))
```

## Multiple Representations for Abstract Data

There might be more than one useful representation for a data object, and we might like to design systems that can deal with multiple representations. 

So in addition to the data-abstraction barriers that isolate representation from use, we need abstraction barriers that isolate different design choices from each other and permit different choices to coexist in a single program. 

In addition, we need to make the system more additive.

To achieve above, we need a new tool `generic procedure`. Type tags and data-directed style enable this.

### Example: Complex-number 

![](https://i.imgur.com/08f8LQm.png)

But we soon realized that, using type tag make the system not additive!
And this kind of system is hard to maintain.

NOT A GOOD DESIGN!

Here is Table of operations for the complex-number system:

![](https://i.imgur.com/1UiVC6S.png)

Data-directed programming is the technique of designing programs to work with such a table directly. If we do this, then to add a new representation package to the system we need not change any existing procedures; we need only add new entries to the table.

```clojure=

(define (apply-generic op . args)
(let ((type-tags (map type-tag args)))
(let ((proc (get op type-tags))) (if proc
          (apply proc (map contents args))
          (error "No method for these types: APPLY-GENERIC"
(list op type-tags))))))
;; selectors with generics
(define (real-part z) (apply-generic 'real-part z))
(define (imag-part z) (apply-generic 'imag-part z)) 
(define (magnitude z) (apply-generic 'magnitude z)) 
(define (angle z)     (apply-generic 'angle z))
```

In effect, this decomposes the operation-and-type table into rows, with each generic operation procedure representing a row of the table.

An alternative implementation strategy is to decompose the table into columns. This style is called `message passing`.

## Systems with Generic Operations

### Generic Arithmetic Operations
![](https://i.imgur.com/Yf6vQCg.png)

The generic arithmetic procedures are defined as

```clojure=
(define (add x y) (apply-generic 'add x y))
(define (sub x y) (apply-generic 'sub x y))
(define (mul x y) (apply-generic 'mul x y))
(define (div x y) (apply-generic 'div x y))

;;
(define (install-scheme-number-package)
  (define (tag x) (attach-tag 'scheme-number x)) 
  (put 'add '(scheme-number scheme-number)
       (lambda (x y) (tag (+ x y))))
  (put 'sub '(scheme-number scheme-number)
       (lambda (x y) (tag (- x y))))
  (put 'mul '(scheme-number scheme-number)
       (lambda (x y) (tag (* x y))))
  (put 'div '(scheme-number scheme-number)
       (lambda (x y) (tag (/ x y))))
  (put 'make 'scheme-number (lambda (x) (tag x))) 'done)
```

In the end, we need a two level tag system for complex number.

### Combining Data of Different Types

We would like to introduce the cross-type operations in some carefully controlled way, so that we can support them without seriously violating our module boundaries.

One strategy could be making a type transfer of types if possible.

Or we could build a hierachies of type.

### Example: Symbolic Algebra

TODO.



# Modularity, Objects, and State

Procedure and Data abstractions are powerful tools to deal with complex systems, but not enough. We need organizational principles that can guide us in formulating the overall design of a program.

Two prominent organizational strategies: objects and streams.

With objects, we must be concerned with how a computational object can change and yet maintain its identity. The stream approach can be most fully exploited when we decouple simulated time in our model from the order of the events that take place in the computer during evaluation.This essentially a environmental model instead of substitution model.

**object**, viewing a large system as a collection of distinct objects whose behaviors may change over time. 

**stream**, viewing streams of information flow in the system. 

While using object to model state come with a price because it couples time and data at the same time. And `Stream` is a solution.

## Assignment and Local State

Two new operators are needed in order to mantain local state and assignment.
`(set! <name> <new-value>)` and `(begin <exp1> <exp1> ...)`. The value of `begin` is the value of last expression. The we can use `let` to create some local variable in the procedure:

```clojure=
(define new-withdraw 
  (let ((balance 100))
    (lambda (amount)
      (if (>= balance amount)
        (begin (set! balance (- balance amount)) balance)
        "Insufficient funds"))))
```

Then we can have a procedure to create objects:

```clojure=
(define (make-withdraw balance)
  (lambda (amount)
    (if (>= balance amount)
      (begin (set! balance (- balance amount))
             balance)
      "Insufficient funds")))

```

With these techniques, we can create complex objects with more methods and local variable:

```clojure=
(define (make-account balance) 
  (define (withdraw amount) 
    (if (>= balance amount)
      (begin (set! balance (- balance amount)) balance)
      "Insufficient funds"))
  (define (deposit amount)
    (set! balance (+ balance amount))
    balance)
  (define (dispatch m)
    (cond ((eq? m 'withdraw) withdraw)
          ((eq? m 'deposit) deposit)
          (else (error "Unknown request: MAKE-ACCOUNT"
                       m))))
  dispatch)
```

> Programming without any use of assignments, as we did throughout the first two chapters of this book, is accordingly known as functional programming. In contrast to functional programming, programming that makes ex- tensive use of assignment is known as imperative programming. 


As soon as we introduce assignment, a variable can no longer be simply a name. Now a variable somehow refers to a place where a value can be stored, and the value stored at this place can change. And the place is the environment.

A language that supports the concept that “equals can be substituted for equals” in an expression without changing the value of the expression is said to be referentially transparent. 





## Environment Model of Evaluation

An environment is a sequence of frames. Each frame is a table (possibly empty) of bindings, which associate variable names with their corresponding values.

In the environment model of evaluation, a procedure is always a pair consisting of some code and a pointer to an environment.

The environment model of procedure application can be summa- rized by two rules:
- apply rule,  is applied to a set of arguments by constructing a frame, binding the formal parameters of the procedure to the arguments of the call, and then evaluating the body of the proce- dure in the context of the new environment constructed
- creation rule, created by evaluating a λ-expression relative to a given environment.

## Modeling with Mutable Data

To model data that can change, we need not only `constructor` and `selector`, but also `moutator`. Data objects for which mutators are defined are known as mutable data objects.

We introduce two primitives, which are similar to `cons`, `car`, and `cdr`: `set-car!` and `set-cdr!`.

Just like pairs can be represented purely by procedures, mutation is just assignment.

### Example: Digital Circuits

TODO:

## Concurrency

Before we introduced assignment, all our programs were timeless, in the sense that any expression that has a value always has the same value.

So it is often natural to model systems as collections of computational processes that execute concurrently.
Just as we can make our programs modular by organizing models in terms of objects with separate local state, it is often appropriate to divide computational models into parts that evolve separately and concurrently.

One possible restriction on concurrency would stipulate that no two operations that change any shared state variables can occur at the same time. 
A less stringent restriction on concurrency would ensure that a concurrent system produces the same result as if the processes had run sequentially in some order.

### Mechanisms for Controlling Concurrency

We’ve seen that the difficulty in dealing with concurrent processes is rooted in the need to consider the interleaving of the order of events in the different processes. 

A more practical approach to the design of concurrent systems is to devise general mechanisms that allow us to constrain the interleaving of concurrent processes.

For example `serilizing`: Serialization implements the following idea: Processes will execute con- currently, but there will be certain collections of procedures that cannot be executed concurrently. We implement serializers in terms of a more primitive synchronization mechanism called a mutex.

> The complexities we encounter in dealing with time and state in our computational models may in fact mirror a fundamental complexity of the physical universe.


## Stream

### Streams Are Delayed Lists

Streams are a clever idea that allows one to use sequence manipulations without incurring the costs of manipulating sequences as lists.
The key modularity issue was that we wished to hide the internal state.


# Metalinguistic Abstraction

Establishing new languages is a powerful strategy for controlling complexity in engineering design; we can often enhance our ability to deal with a complex problem by adopting a new language that enables us to describe (and hence to think about) the problem in a different way, using primitives, means of combination, and means of abstraction that suitable to the problem at hand.

## The Metacircular Evaluator

An evaluator that is written in the same language that it evaluates is said to be metacircular.

Here we talk about a Scheme formulation of the environment model of evaulation. Recall that the model has two parts:

1. Evulation
2. Application

This is basically `eval` and `apply`. 

We will use **data abstraction** to make the evaluator independent of the representation of the language.

### The core of evaluator

**`eval`**: takes an expression and an environment.

Rules:
- Primitives expression
  * self-evaluting expression -> self
  * lookup value in the environment
- Special forms
  * quoted expression -> expression that was qouted 
  * assignment
  * if
  * lambda
  * begin
  * case
- Combinations
  * procedure application 

**`apply`**: takes a procedure and a list of argments.
- primitive procedures
- compound procedures

### Variations on a Scheme — Lazy Evaluation

#### Normal Order and Applicative Order



# Computing with Register Machines

> A more primitive level than Lisp itself.

