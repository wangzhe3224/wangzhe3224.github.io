---
title: arts
date: 2020-04-19 18:31:09
---

Art (???) page....

Julia fractal

![Julia fractal](https://i.imgur.com/uQFIKDV.png)


![hmmm](https://i.imgur.com/hTEM0Mu.png)

Code:

```javascript=
var canvas = document.querySelector('canvas');
var context = canvas.getContext('2d');

var size = 320;
var dpr = window.devicePixelRatio;
canvas.width = size * dpr;
canvas.height = size * dpr;
context.scale(dpr, dpr);
context.lineWidth = 7;
var step = size / 12;
var white = '#F2F5F1';
var colors = ['#D40920', '#1356A2', '#F7D842']

var squares = [{
    x: 0,
    y: 0,
    width: size,
    height: size
  }];

function splitSquaresWith(coordinates) {
  const { x, y } = coordinates;

  for (var i = squares.length - 1; i >= 0; i--) {
  const square = squares[i];

  if (x && x > square.x && x < square.x + square.width) {
      if(Math.random() > 0.5) {
        squares.splice(i, 1);
        splitOnX(square, x); 
      }
  }

  if (y && y > square.y && y < square.y + square.height) {
      if(Math.random() > 0.5) {
        squares.splice(i, 1);
        splitOnY(square, y); 
      }
  }
  }
}

function splitOnX(square, splitAt) {
  var squareA = {
    x: square.x,
    y: square.y,
    width: square.width - (square.width - splitAt + square.x),
    height: square.height
  };

  var squareB = {
  x: splitAt,
  y: square.y,
  width: square.width - splitAt + square.x,
  height: square.height
  };

  squares.push(squareA);
  squares.push(squareB);
}

function splitOnY(square, splitAt) {
  var squareA = {
    x: square.x,
    y: square.y,
    width: square.width,
    height: square.height - (square.height - splitAt + square.y)
  };

  var squareB = {
  x: square.x,
  y: splitAt,
  width: square.width,
  height: square.height - splitAt + square.y
  };

  squares.push(squareA);
  squares.push(squareB);
}

for (var i = 0; i < size; i += step) {
  splitSquaresWith({ y: i });
  splitSquaresWith({ x: i });
}

function draw() {
  for (var i = 0; i < colors.length; i++) {
    squares[Math.floor(Math.random() * squares.length)].color = colors[i];
  }
  for (var i = 0; i < squares.length; i++) {
    context.beginPath();
    context.rect(
      squares[i].x,
      squares[i].y,
      squares[i].width,
      squares[i].height
    );
    if(squares[i].color) {
      context.fillStyle = squares[i].color;
    } else {
      context.fillStyle = white
    }
    context.fill()
    context.stroke();
  }
}

draw()
```


![Circles...](https://i.imgur.com/X8SlatA.png)

![Trangle mesh](https://i.imgur.com/Pkg2Yzr.png)


![Cubic Disarray](https://i.imgur.com/Vifb2L0.png)


![Joy Division](https://i.imgur.com/S9IivKz.png)

Code:

```javascript=
var canvas = document.querySelector('canvas');
var context = canvas.getContext('2d');

var size = 320;
var dpr = window.devicePixelRatio;
canvas.width = size * dpr;
canvas.height = size * dpr;
context.scale(dpr, dpr);
context.lineWidth = 2;

var step = 7;
var lines = [];

// Create the lines
for(var i = step; i <= size - step; i += step) {
    
  var line = [];
  for(var j = step; j <= size - step; j+= step) {
    var distanceToCenter = Math.abs(j - size / 2);
    var variance = Math.max(size / 2 - 50 - distanceToCenter, 0);
    var random = Math.random() * variance / 2 * -1;
    var point = {x: j, y: i + random};
    line.push(point);
  } 
  lines.push(line);
}

// Do the drawing
for(var i = 5; i < lines.length; i++) {

  context.beginPath();
  context.moveTo(lines[i][0].x, lines[i][0].y);
  
  for(var j = 0; j < lines[i].length - 2; j++) {
    var xc = (lines[i][j].x + lines[i][j + 1].x) / 2;
    var yc = (lines[i][j].y + lines[i][j + 1].y) / 2;
    context.quadraticCurveTo(lines[i][j].x, lines[i][j].y, xc, yc);
  }

  context.quadraticCurveTo(lines[i][j].x, lines[i][j].y, lines[i][j + 1].x, lines[i][j + 1].y);
  context.save();
  context.globalCompositeOperation = 'destination-out';
  context.fill();
  context.restore();
  // set line color
  context.strokeStyle = '#30ACD1';
  context.stroke();
}

```


![Tiled Lines](https://i.imgur.com/H1BPsop.png)

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