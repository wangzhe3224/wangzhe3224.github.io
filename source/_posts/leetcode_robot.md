---
title: 874. Walking Robot Simulation
tags: [Dict]
categories: Leetcode
date: 2021-04-27
---

# 874. Walking Robot Simulation

- [874. Walking Robot Simulation](https://leetcode.com/problems/walking-robot-simulation/)

这是一个简单，但是设计的很好的面试题。并没有困难的算法，考验的是一个软件工程师能都写出清晰、简洁代码的能力，以及一些细节问题。

**问题**

```
A robot on an infinite XY-plane starts at point (0, 0) and faces north. The robot can receive one of three possible types of commands:

-2: turn left 90 degrees,
-1: turn right 90 degrees, or
1 <= k <= 9: move forward k units.
Some of the grid squares are obstacles. The ith obstacle is at grid point obstacles[i] = (xi, yi).

If the robot would try to move onto them, the robot stays on the previous grid square instead (but still continues following the rest of the route.)

Return the maximum Euclidean distance that the robot will be from the origin squared (i.e. if the distance is 5, return 25).

Note:

North means +Y direction.
East means +X direction.
South means -Y direction.
West means -X direction.
```

**例子**

```
Example 1:
Input: commands = [4,-1,3], obstacles = []
Output: 25
Explanation: The robot starts at (0, 0):
1. Move north 4 units to (0, 4).
2. Turn right.
3. Move east 3 units to (3, 4).
The furthest point away from the origin is (3, 4), which is 32 + 42 = 25 units away.

Example 2:
Input: commands = [4,-1,4,-2,4], obstacles = [[2,4]]
Output: 65
Explanation: The robot starts at (0, 0):
1. Move north 4 units to (0, 4).
2. Turn right.
3. Move east 1 unit and get blocked by the obstacle at (2, 4), robot is at (1, 4).
4. Turn left.
5. Move north 4 units to (1, 8).
The furthest point away from the origin is (1, 8), which is 12 + 82 = 65 units away.
```

**思路**

我是这样想这个题的，为了模拟机器人行动，我们需要一对坐标记录机器人的位置，需要一个方向状态跟踪路径，最后计算长度。首先肯定要遍历所有的指令，而指令分三种：前进、左转和右转。那么程序的基本架构如下：

```python=
def robotSim(self, commands: List[int], obstacles: List[List[int]]) -> int:
    
    x, y = 0, 0
    direction = 'n'  # 这里可一个是一个 Enum，分别代表四个方向
    
    for c in commands:
        if c == -2:  # 左转
           pass
        elif c == -1:  # 右转
           pass
        else:  # 前进
           pass
```

现在我们只需要分别应对三种不同的命令。对于，左右转我们需要弄清执行指令后的方向，即需要一个`(当前方向，行动) -> 新方向`的映射，我们可以写函数，或者直接用字典，总共是8中情况：

```python=
state = {
    ('n', 'l'): 'w',
    ('n', 'r'): 'e',
    ('s', 'l'): 'e',
    ('s', 'r'): 'w',
    ('e', 'l'): 'n',
    ('e', 'r'): 's',
    ('w', 'l'): 's',
    ('w', 'r'): 'n',
}
```

下一步就是前进的部分。这部分有两个问题：xy方向的变化，处理障碍物。xy的方向变化其实是一个`(方向) -> (dx, dy)`的映射：

```python=
step = {
    'n': (0, 1),
    's': (0, -1),
    'w': (-1, 0),
    'e': (1, 0)
}
```

而如果dx dy 让我们移动到了障碍物，则这个移动不能完成。

最终我们得到如下代码：

```python=
class Solution:
    def robotSim(self, commands: List[int], obstacles: List[List[int]]) -> int:
        x, y = 0, 0
        # 0. 
        direction = 'n' # s e w
        res = 0
        # 1.
        state = {
            ('n', 'l'): 'w',
            ('n', 'r'): 'e',
            ('s', 'l'): 'e',
            ('s', 'r'): 'w',
            ('e', 'l'): 'n',
            ('e', 'r'): 's',
            ('w', 'l'): 's',
            ('w', 'r'): 'n',
        }
        # 2.
        step = {
            'n': (0, 1),
            's': (0, -1),
            'w': (-1, 0),
            'e': (1, 0)
        }
        # 这个部分是为了增加检测存在的效率，使用set
        obstacles = set(map(tuple, obstacles))
        
        for c in commands:
            if c == -2:  # left turn
                direction = state[(direction, 'l')]
            elif c == -1: # right turn
                direction = state[(direction, 'r')]
            else: # move
                for m in range(c):
                    dx, dy = step[direction]
                    if (x+dx, y+dy) not in obstacles:
                        x += dx
                        y += dy
                        # 3. dont want to go back...
                        res = max(res, x*x+y*y)

        return res
```

###### tags: `Leetcode`