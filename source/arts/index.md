---
title: arts
date: 2020-04-19 18:31:09
---

Art page....

![](https://i.imgur.com/H1BPsop.png)

Code:

```javascript=
var canvas = document.querySelector('canvas');
var context = canvas.getContext('2d');

var size = 320;
var step = 10;
var dpr = window.devicePixelRatio;
canvas.width = size * dpr;
canvas.height = size * dpr;
context.scale(dpr, dpr);

context.lineCap = 'square';
context.lineWidth = 1;

function draw(x, y, width, height) {
  var leftToRight = Math.random() >= 0.60;

  if(leftToRight) {
    context.moveTo(x, y);
    context.lineTo(x + width + leftToRight*3, y + height + leftToRight);    
  } else {
    context.moveTo(x + width+leftToRight, y);
    context.lineTo(x, y + height+leftToRight);
  }

  context.stroke();
}

for(var x = 0; x < size; x += step) {
  for(var y = 0; y < size; y+= step) {
    draw(x, y, step, step);    
  }
}
```