---
title: Vim增加定制帮助文件
date: 2020-11-18
tags: [VIM]
categories: Coding
---

# Vim增加自定义帮助文件

首先，准备一份帮助文件，文件名必须是 `*.txt`，然后该文件必须存放在vim的`runtimepath`。可以通过 `:echo &runtimepath` 查看，通常就是在 
`~/.vim/doc` 或者 如果是 neovim 在 `~/.config/nvim/`。

帮助文件的首行第一个字符必须是 `*`，文件的其余部分不限。但是文件中所有
包含在`**`内部的单词，都会被检索。所以应该注意不要与其他部分冲突。

一个帮助文件例子：

```vim
*tidal.txt* Tidal documentation

this file is a consolidation of the official tidalCycles documentation : https://tidalcycles.org/index.php/Userbase

type Time = Rational

## CORE

*(<~)*:: Pattern Time -> Pattern a -> Pattern a
<~ is an operator that shifts a pattern backward in time, by the given amount.
For example, to shift a pattern by a quarter of a cycle, every fourth cycle:
d1 $ every 4 (0.25 <~) $ sound ("arpy arpy:1 arpy:2 arpy:3")
Or to alternate between different shifts:
d1 $ "<0 0.5 0.125>" <~ sound ("arpy arpy:1 arpy:2 arpy:3")
```

这里面的 `tidal.txt` 和 `(<~)` 将来都会被检索。

完成上述后，运行 `:helptags ~/.vim/doc`，这样就会为新的帮助文件生成Tag检索。

检索完成后，就可以运行 `:h tidal.txt` 来显示对应的帮助文件定位了，同时也支持
自动补全，在 intert 模式下， `C-N` 就可以进行补全。

也可以增加如下段落在 `.vimrc`里面支持 K 键 阅读文件：

```vim
nnoremap <silent> K :call <SID>show_documentation()<CR>

function! s:show_documentation()
  if (index(['vim','help', 'tidal'], &filetype) >= 0)
    execute 'h '.expand('<cword>')
  else
    call CocAction('doHover')
  endif
endfunction 
```