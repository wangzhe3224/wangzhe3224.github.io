---
title: MIT6828 lab 1
tags: Operating System
categories: Coding
date: 2020-10-10
---

## Part 1
First thing, what does it mean by saying `cs:ip`?
This is a old but still being used memory addressing method. `Segment: Offfset`. The absolute memory addres = (Segment * 16) + Offset. For example, `F000:FFFD` means address `FFFFD`. This strange way of expressing address is due to the fact that in the old days, CPU's regeisters are only 16bit, which can only address a memeory address of 2^16 (which is 64KiB memory). This is even too small at that age. So CPU manufacturers combines two regiesters to express larger address, which is this `segment: offset` thing. 
`cs` means "code segment" and `ip` means "instruction pointer". The combination represents the location where CPU is currently fetching instructions to execute.

```
/\/\/\/\/\/\/\/\/\/\
|                  |
|      Unused      |
|                  |
+------------------+  <- depends on amount of RAM
|                  |
|                  |
| Extended Memory  |
|                  |
|                  |
+------------------+  <- 0x00100000 (1MB)                 [Intel 8088]
|     BIOS ROM     |
+------------------+  <- 0x000F0000 (960KB)
|  16-bit devices, |
|  expansion ROMs  |
+------------------+  <- 0x000C0000 (768KB)
|   VGA Display    |
+------------------+  <- 0x000A0000 (640KB)
|                  |
|    Low Memory    |                                      [Conventional Memory]
|                  |
+------------------+  <- 0x00000000
```
### Exercise 2: debug boot
``` 
 [CS:IP]    address: command  args
[f000:fff0]    0xffff0: ljmp   $0xf000,$0xe05b   # goto 0xfe05b
[f000:e05b]    0xfe05b: cmpl   $0x0,%cs:0x6c48
[f000:e062]    0xfe062: jne    0xfd2e1
[f000:e066]    0xfe066: xor    %dx,%dx
[f000:e068]    0xfe068: mov    %dx,%ss
[f000:e06a]    0xfe06a: mov    $0x7000,%esp
[f000:e070]    0xfe070: mov    $0xf3691,%edx
[f000:e076]    0xfe076: jmp    0xfd165
[f000:d165]    0xfd165: mov    %eax,%ecx
[f000:d168]    0xfd168: cli
[f000:d169]    0xfd169: cld
[f000:d16a]    0xfd16a: mov    $0x8f,%eax
[f000:d170]    0xfd170: out    %al,$0x70
[f000:d172]    0xfd172: in     $0x71,%al
[f000:d174]    0xfd174: in     $0x92,%al
[f000:d176]    0xfd176: or     $0x2,%al
[f000:d178]    0xfd178: out    %al,$0x92
[f000:d17a]    0xfd17a: lidtw  %cs:0x6c38
[f000:d180]    0xfd180: lgdtw  %cs:0x6bf4
[f000:d186]    0xfd186: mov    %cr0,%eax
[f000:d189]    0xfd189: or     $0x1,%eax
[f000:d18d]    0xfd18d: mov    %eax,%cr0
[f000:d190]    0xfd190: ljmpl  $0x8,$0xfd198
=> 0xfd198:     mov    $0x10,%eax
=> 0xfd19d:     mov    %eax,%ds
=> 0xfd19f:     mov    %eax,%es
=> 0xfd1a1:     mov    %eax,%ss
```

## Part 2 Boot Loader

BIOS handle control to boot loader by loading boot loader into memory and jump instruction pointer to `0x7C00`, where boot
 loader code started.

### Exercise 3

- At what point does the processor start executing 32-bit code? What exactly causes the switch from 16- to 32-bit mode?

`[   0:7c1e] => 0x7c1e:  lgdtw  0x7c64`. Here starting using GDT, Global Descriptor Table.
Then mark control regesiter, `cr0`. 

```
[   0:7c23] => 0x7c23:  mov    %cr0,%eax
[   0:7c26] => 0x7c26:  or     $0x1,%eax
[   0:7c2a] => 0x7c2a:  mov    %eax,%cr0
[   0:7c2d] => 0x7c2d:  ljmp   $0x8,$0x7c32   # <-- Jump to next instruction, which in 32-bit code segment.
=> 0x7c32:      mov    $0x10,%ax   # notice that the address format changed.
```

In `boot.S` source code, one can see `.code16` as a sign of 16-bit mode, and `.code32` as 32-bit mode.

- What is the last instruction of the boot loader executed, and what is the first instruction of the kernel it just loaded?
```
=> 0x7c40:      mov    $0x7c00,%esp # setup stack pointer to call boot/main.c
=> 0x7c45:      call   0x7d15
=> 0x7d15:      push   %ebp # here we move to `main.c`. boot.S hands over control to main.c 
=> 0x7d6b:      call   *0x10018       # this is the last instruction from boot loader
=> 0x10000c:    movw   $0x1234,0x472  # this is the first instruction from the kernel.
```

- Where is the first instruction of the kernel? `0x10000c`
- How does the boot loader decide how many sectors it must read in order to fetch the entire kernel from disk? Where does it find this information?  The boot loader find sector number from 

Notes:
`x/i $pc`: show current instruction (content that program counter, `pc`, pointed to)
`si`: execute current instruction
`c`: execute until next break point
`b *address`: set a break point at address

### Exercise 4

- Understand `pointer.c`. Read K&R Ch5.1 - 5.5.

Note:
- Unary operators like * and ++ associate right to left. `++*p` and `(*p)++` and `*p++`.
- (int *) ((char *) c) makes the trick, char is 1 byte long whereas int is 4 bytes.

### Exercise 5

The first instruction that would break will be `ljmp $PORT_MODE_CSEG, $protcseg`, `$protcseg` is part of 
.text segment, and the segement is assumed to be loaded at `0x7c00`. 

### Exercise 6
Breakpoint 0x7c00

```
[   0:7c00] => 0x7c00:  cli
Breakpoint 1, 0x00007c00 in ?? ()
(gdb) x/8x 0x00100000
0x100000:       0x00000000      0x00000000      0x00000000      0x00000000
0x100010:       0x00000000      0x00000000      0x00000000      0x00000000

(gdb) c
=> 0x10000c:    movw   $0x1234,0x472
Breakpoint 2, 0x0010000c in ?? ()
0x100000:       0x1badb002      0x00000000      0xe4524ffe      0x7205c766
0x100010:       0x34000004      0x0000b812      0x220f0011      0xc0200fd8
```

## Part 3: The Kernel

### Exercise 7

this bit code activate page:

```
# Turn on paging.
movl    %cr0, %eax
orl $(CR0_PE|CR0_PG|CR0_WP), %eax
movl    %eax, %cr0
```

Set the breakpoint at 0x00100025 (this is the pysical address of movl %eax, %cr0). We can see:

```
(gdb) x/8x 0x00100000
0x100000:       0x1badb002      0x00000000      0xe4524ffe      0x7205c766
0x100010:       0x34000004      0x2000b812      0x220f0011      0xc0200fd8
(gdb) x/8x 0xf0100000
0xf0100000 <_start+4026531828>: 0x00000000      0x00000000      0x00000000      0x00000000
0xf0100010 <entry+4>:   0x00000000      0x00000000      0x00000000      0x00000000
```

After execute this line, we can see that both 100000 and f0100000 hold same content. 
 Memory is mapped.

```
(gdb) x/8x 0x00100000
0x100000:       0x1badb002      0x00000000      0xe4524ffe      0x7205c766
0x100010:       0x34000004      0x2000b812      0x220f0011      0xc0200fd8
(gdb) x/8x 0xf0100000
0xf0100000 <_start+4026531828>: 0x1badb002      0x00000000      0xe4524ffe      0x7205c766
0xf0100010 <entry+4>:   0x34000004      0x2000b812      0x220f0011      0xc0200fd8
```

The next instruction need the virtual memeory setup, otherwise it cannot find the right memory address.
 0xf010002f.

`f0100028:   b8 2f 00 10 f0          mov    $0xf010002f,%eax`

### Exercise 8

The code is similar to unsigned int, just change base to 8:

```
num = getuint(&ap, lflag);
base = 8;
goto number;
```

**Explain the interface between printf.c and console.c. Specifically, what function does console.c export?**
**How is this function used by printf.c?**

`putch()` function in printf.c calls `cputchar()` in console.c to show chars in concole.

the following code will give a new page when screen is full.
```
if (crt_pos >= CRT_SIZE) {
    int i;
        memmove(crt_buf, crt_buf + CRT_COLS, (CRT_SIZE - CRT_COLS) * sizeof(uint16_t));
            for (i = CRT_SIZE - CRT_COLS; i < CRT_SIZE; i++)
                    crt_buf[i] = 0x0700 | ' ';
                        crt_pos -= CRT_COLS;
                        
}
```

### Exercies 9: The Stack

> Determine where the kernel initializes its stack, and exactly where in memory its stack is located. How does the kernel reserve space for its stack? And at which "end" of this reserved area is the stack pointer initialized to point to?

The kernel initialized stack pointer in line 76 of `kern/entry.S` with `movl $(bootstacktop), %esp`.
By looking at `obj/kern/kernel.asm` line 57, we know that stack pointer is pointing to `0xf0110000`
 which is right after the 1MB kernel space.

`f0100034:   bc 00 00 11 f0          mov    $0xf0110000,%esp`

### Exercise 10

```c=
int
mon_backtrace(int argc, char **argv, struct Trapframe *tf)
{
    uint32_t *ebp = (uint32_t *)read_ebp();
    cprintf("Stack backtrace:\n");
    while (ebp != 0){
        uint32_t eip = ebp[1];
        cprintf("  ebp %08x  eip %08x  args %08x %08x %08x %08x %08x\n", ebp, eip, ebp[2], ebp[3], ebp[4], ebp[5], ebp[6]);
        struct Eipdebuginfo info;
        if (debuginfo_eip(eip, &info) == 0) {
            cprintf("         %s:%d: %.*s+%d\n", info.eip_file, info.eip_line, info.eip_fn_namelen, info.eip_fn_name, eip - info.eip_fn_addr);
        }
        ebp = (uint32_t *)(*ebp);
    }
    return 0;
}
```

## Reference
- [Solution](https://qiita.com/kagurazakakotori/items/b092fc0dbe3c3ec09e8e)
- [Call stack video](https://www.youtube.com/watch?v=Q2sFmqvpBe0)
- [Details in stack and register](https://www.youtube.com/watch?v=XbZQ-EonR_I)
