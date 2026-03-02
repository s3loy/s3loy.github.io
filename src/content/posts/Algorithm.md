---
title: Algorithm
published: 2025-10-29
tags:
  - python
  - golang
  - algorithm
---
<details>
  <summary>索引</summary>

- [1. Go](#1-go)
  - [1.1. 核心数据类型](#11-核心数据类型)
    - [1.1.1. 整数和浮点数](#111-整数和浮点数)
    - [1.1.2. 字符串 \& rune](#112-字符串--rune)
    - [1.1.3. 变量交换](#113-变量交换)
  - [1.2. 核心数据结构](#12-核心数据结构)
    - [1.2.1. 切片 动态数组](#121-切片-动态数组)
      - [1.2.1.1. 创建](#1211-创建)
      - [1.2.1.2. 访问与切片](#1212-访问与切片)
      - [1.2.1.3. 常用操作](#1213-常用操作)
    - [1.2.2. map 映射 哈希表](#122-map-映射-哈希表)
      - [1.2.2.1. 创建 操作](#1221-创建-操作)
      - [1.2.2.2. Key Check](#1222-key-check)
      - [1.2.2.3. 删除 遍历](#1223-删除-遍历)
    - [1.2.3. 控制流](#123-控制流)
      - [1.2.3.1. 条件判断 if](#1231-条件判断-if)
      - [1.2.3.2. 循环 for](#1232-循环-for)
      - [1.2.3.3. switch](#1233-switch)
  - [1.3. 常用内置库与函数](#13-常用内置库与函数)
    - [1.3.1. 排序 sort](#131-排序-sort)
    - [1.3.2. 数学 math](#132-数学-math)
    - [1.3.3. 字符串处理 strings / strconv](#133-字符串处理-strings--strconv)
  - [1.4. 常见算法模板实现](#14-常见算法模板实现)
    - [1.4.1. stack 栈](#141-stack-栈)
    - [1.4.2. Queue 队列](#142-queue-队列)
    - [1.4.3. Set 集合](#143-set-集合)
    - [1.4.4. ListNode 链表](#144-listnode-链表)
    - [1.4.5. TreeNode 二叉树](#145-treenode-二叉树)
    - [1.4.6. 优先队列 / 堆 Priority Queue](#146-优先队列--堆-priority-queue)
    - [1.4.7. 位运算](#147-位运算)
    - [1.4.8. 输入输出](#148-输入输出)
    - [1.4.9. 并查集 Union-Find (DSU)](#149-并查集-union-find-dsu)
    - [1.4.10. 图的存储 (邻接表)](#1410-图的存储-邻接表)
    - [1.4.11. 字典树 Trie (前缀树)](#1411-字典树-trie-前缀树)
  - [1.5. 常用算法技巧](#15-常用算法技巧)
    - [1.5.1. 二分查找](#151-二分查找)
    - [1.5.2. 网格遍历 (方向数组)](#152-网格遍历-方向数组)
- [2. Python 部分](#2-python-部分)
  - [2.1. 核心数据类型](#21-核心数据类型)
    - [2.1.1. 整数 (int)](#211-整数-int)
    - [2.1.2. 浮点数 (float)](#212-浮点数-float)
    - [2.1.3. 布尔值 (bool)](#213-布尔值-bool)
    - [2.1.4. 字符串 (str)](#214-字符串-str)
  - [2.2. 核心数据结构](#22-核心数据结构)
    - [2.2.1. 列表 (List)](#221-列表-list)
      - [2.2.1.1. 创建](#2211-创建)
      - [2.2.1.2. 访问](#2212-访问)
      - [2.2.1.3. 切片](#2213-切片)
      - [2.2.1.4. 列表的常用函数和操作](#2214-列表的常用函数和操作)
      - [2.2.1.5. 列表的常用方法](#2215-列表的常用方法)
    - [2.2.2. 字典 (Dictionary / Hash Map)](#222-字典-dictionary--hash-map)
      - [2.2.2.1. 创建](#2221-创建)
      - [2.2.2.2. 操作](#2222-操作)
    - [2.2.3. 集合 (Set)](#223-集合-set)
      - [2.2.3.1. 创建](#2231-创建)
      - [2.2.3.2. 操作](#2232-操作)
    - [2.2.4. 字符串 (String)](#224-字符串-string)
      - [2.2.4.1. 操作](#2241-操作)
  - [2.3. 控制流与逻辑](#23-控制流与逻辑)
    - [2.3.1. 条件判断 (if/elif/else)](#231-条件判断ifelifelse)
    - [2.3.2. 循环](#232-循环)
      - [2.3.2.1. for循环](#2321-for循环)
      - [2.3.2.2. while 循环](#2322-while循环)
    - [2.3.3. 函数](#233-函数)
  - [2.4. 通用内置函数](#24-通用内置函数)
    - [2.4.1. len(obj)](#241-lenobj)
    - [2.4.2. sum(iterable)](#242-sumiterable)
    - [2.4.3. min(iterable) / max(iterable)](#243-miniterablemaxiterable)
    - [2.4.4. sorted(iterable)](#244-sortediterable)
    - [2.4.5. abs(x)](#245-absx)
    - [2.4.6. range(start, stop, step)](#246-rangestart-stop-step)
    - [2.4.7. 类型转换函数](#247-类型转换函数)
      - [2.4.7.1. int(x)](#2471-intx)
      - [2.4.7.2. str(obj)](#2472-strobj)
      - [2.4.7.3. list(iterable)](#2473-listiterable)
      - [2.4.7.4. set(iterable)](#2474-setiterable)
    - [2.4.8. enumerate(iterable)](#248-enumerateiterable)
    - [2.4.9. zip()](#249-zip)
    - [2.4.10. map(function, iterable)](#2410-mapfunction-iterable)
  - [2.5. 核心数据类型方法](#25-核心数据类型方法)
    - [2.5.1. 字符串 (str)](#251-字符串-str)
      - [2.5.1.1. str.split(sep)](#2511-strsplitsep)
      - [2.5.1.2. sep.join(list)](#2512-sepjoinlist)
      - [2.5.1.3. str.find(sub)](#2513-strfindsub)
      - [2.5.1.4. str.count(sub)](#2514-strcountsub)
      - [2.5.1.5. str.strip()](#2515-strstrip)
      - [2.5.1.6. str.isdigit()](#2516-strisdigit)
    - [2.5.2. 列表 (list)](#252-列表-list)
      - [2.5.2.1. list.index(x\[, start\[, end\]\])](#2521-listindexx-start-end)
      - [2.5.2.2. list.append(x)](#2522-listappendx)
      - [2.5.2.3. list.pop(i)](#2523-listpopi)
      - [2.5.2.4. list.sort(cmp=None, key=None, reverse=False)](#2524-listsortcmpnone-keynone-reversefalse)
      - [2.5.2.5. list.reverse()](#2525-listreverse)
      - [2.5.2.6. list.remove(obj)](#2526-listremoveobj)
    - [2.5.3. 字典 (dict)](#253-字典-dict)
      - [2.5.3.1. dict.get(key, default)](#2531-dictgetkey-default)
      - [2.5.3.2. dict.keys()](#2532-dictkeys)
      - [2.5.3.3. dict.values()](#2533-dictvalues)
      - [2.5.3.4. dict.items()](#2534-dictitems)
  - [2.6. Collections](#26-collections)
    - [2.6.1. defaultdict](#261-defaultdict)


</details>



# 1. Go
## 1.1. 核心数据类型
### 1.1.1. 整数和浮点数
```go
var x int = 10
y := -5   
var big int64 = 1 << 62

pi := 3.14159     // float64

a := 5.0 
b := int(a)       // 类型显式转换

```
极值
```go
import "math"

const MaxInt = math.MaxInt
const MinInt = math.MinInt
const MaxFloat64 = math.MaxFloat64
```
### 1.1.2. 字符串 & rune
Go 的字符串是不可变的字节切片，处理包含中文或特殊字符的字符串时，必须使用 `rune`

```go
s := "Hello 世界"
len(s)              // 12 (字节长度，中文占3字节)
len([]rune(s))      // 8 (字符数量)

var ch byte = 'A'   // ASCII 
var r rune = '世'   // Unicode 

// 字符串拼接 (在循环中建议使用 strings.Builder)
s = s + "!"
```
### 1.1.3. 变量交换
```go
a, b = b, a
```
## 1.2. 核心数据结构
### 1.2.1. 切片 动态数组
#### 1.2.1.1. 创建
```go
nums := []int{1, 2, 3}

// make(type, len, cap)
ans := make([]int, 0)      // 空切片
grid := make([][]int, n)   // 二维切片初始化需要循环
for i := range grid {
    grid[i] = make([]int, m)
}
```
#### 1.2.1.2. 访问与切片
**切片是浅拷贝**，修改子切片会影响原切片
```go
val := nums[0]
sub := nums[1:3]  // [start:end], 左闭右开 [start,end)
copySub := make([]int, len(sub))
copy(copySub, sub) // 深拷贝必须手动 copy
```
#### 1.2.1.3. 常用操作
```go
nums = append(nums, 4)
nums = append(nums, 5, 6)

n := len(nums)
c := cap(nums)
```
### 1.2.2. map 映射 哈希表
无序键值对
#### 1.2.2.1. 创建 操作
```go
m := make(map[string]int)
m["age"] = 18

dict := map[string]int{
    "a": 1,
    "b": 2,
}
```
`map[keyType]valueType`
在初始化的时候使用`keyType: valueType,`

#### 1.2.2.2. Key Check
```go
val, ok := map["a"]

// 可以配合if使用
if val, ok := map["a"]; ok {
  pass
}
```

#### 1.2.2.3. 删除 遍历
```go
delete(map, "a")

// 遍历 顺序随机
for k, v := range m {
    fmt.Println(k, v)
}

```
### 1.2.3. 控制流
#### 1.2.3.1. 条件判断 if

```go
if x := 10; x > 5 {
    // x 的作用域仅限于 if/else 块内
    fmt.Println(x)
} else if x == 5 {
    pass
} else {
    pass
}
```
#### 1.2.3.2. 循环 for
有且仅有 `for`

```go
for i := 0; i < 5; i++ {
  pass
}

i := 0
for i < 5 {
    i++
}

for {
    break
}

// range 遍历
for i, v := range nums { ... }  // 遍历切片 索引, 值
for i := range nums { ... }     // 仅遍历索引
for _, v := range nums { ... }  // 仅遍历值
for k, v := range myMap { ... } // 遍历 Map
for i, ch := range str { ... }  // 遍历字符串  i是字节索引, ch是rune
```
#### 1.2.3.3. switch
默认不需要`break`
```go
switch score / 10 {
case 10, 9:
    fmt.Println("A")
case 8:
    fmt.Println("B")
default:
    fmt.Println("C")
}
```
## 1.3. 常用内置库与函数
### 1.3.1. 排序 sort
```go

import "sort"

nums := []int{3, 1, 2}

sort.Ints(nums)          // [1, 2, 3]
sort.Strings(strList)


sort.Slice(nums, func(i, j int) bool {
    return abs(nums[i]) > abs(nums[j])
})
```
### 1.3.2. 数学 math
Go 的 math 库主要针对 float64。对于 int，Go 1.21 引入了内置 min/max
```go
import "math"
m := max(1, 5)
n := min(10, 2)

f := math.Abs(-5.2)
p := math.Pow(2, 10)
sq := math.Sqrt(16)

func abs(x int) int { if x < 0 { return -x }; return x }
```
### 1.3.3. 字符串处理 strings / strconv
```go
import (
    "strings"
    "strconv"
)

arr := strings.Split("a,b,c", ",")     // -> []string{"a", "b", "c"}
s := strings.Join(arr, "-")            // -> "a-b-c"
idx := strings.Index("hello", "e")     // -> 1 (不存在返回 -1)
cnt := strings.Count("banana", "a")    // -> 3
has := strings.Contains("hello", "he") // -> true

// strconv (类型转换)
// String -> Int
num, err := strconv.Atoi("123")        // a 2 i
// Int -> String
str := strconv.Itoa(123)               // i 2 a
```
## 1.4. 常见算法模板实现
### 1.4.1. stack 栈
没有内置栈
```go
stack := []int{}

// Push
stack = append(stack, 1)

// Top
top := stack[len(stack)-1]

// Pop 
val := stack[len(stack)-1]
stack = stack[:len(stack)-1]

// Empty
isEmpty := len(stack) == 0
```
### 1.4.2. Queue 队列
用切片模拟，出队操作如果是 nums = nums[1:] 可能会导致内存泄漏（底层数组未释放），通常可以忽略
```go
queue := []int{}

// Enqueue
queue = append(queue, 1)

// Dequeue
val := queue[0]
queue = queue[1:]

// Empty
isEmpty := len(queue) == 0
```
### 1.4.3. Set 集合
Go 没有 set 类型，使用 map[key]bool 或 map[key]struct{} 模拟
```go
set := make(map[int]struct{}) // 空结构体不占内存

// Add
set[1] = struct{}{}    // 对struct{} 初始化 -> struct{}{}

// Contains
if _, ok := set[1]; ok { ... }

// Remove
delete(set, 1)
```
### 1.4.4. ListNode 链表
```go
type ListNode struct {
    Val  int
    Next *ListNode
}

// Dummy Node 处理头节点边界
dummy := &ListNode{Next: head}
cur := dummy
```
### 1.4.5. TreeNode 二叉树
```go
type TreeNode struct {
    Val   int
    Left  *TreeNode
    Right *TreeNode
}
```
### 1.4.6. 优先队列 / 堆 Priority Queue
需要实现 `heap.Interface` 接口
```go
import "container/heap"

type IntHeap []int

// 实现 sort.Interface 三个方法
func (h IntHeap) Len() int           { return len(h) }
func (h IntHeap) Less(i, j int) bool { return h[i] < h[j] } // 小顶堆 <, 大顶堆 >
func (h IntHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }

// 实现 heap 接口的 Push 和 Pop
func (h *IntHeap) Push(x interface{}) {
    *h = append(*h, x.(int))
}
func (h *IntHeap) Pop() interface{} {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[0 : n-1]
    return x
}

// 使用方法
func main() {
    h := &IntHeap{2, 1, 5}
    heap.Init(h)                // 初始化 O(n)
    heap.Push(h, 3)             // 入堆 O(log n)
    minVal := heap.Pop(h).(int) // 出堆 O(log n)
}
```
### 1.4.7. 位运算
```go
x & y   // AND
x | y   // OR
x ^ y   // XOR
x &^ y  // AND NOT (将 x 中 y 为 1 的位清零)
x << n  // 左移
x >> n  // 右移
```
### 1.4.8. 输入输出
```go
import (
    "bufio"
    "fmt"
    "os"
)

func main() {
    in := bufio.NewReader(os.Stdin)
    out := bufio.NewWriter(os.Stdout)
    defer out.Flush()

    var n int
    fmt.Fscan(in, &n) // 读取
    
    // ... 逻辑 ...
    
    fmt.Fprintln(out, n) // 输出
}

```
### 1.4.9. 并查集 Union-Find (DSU)
处理连通性问题
```go
parent := make([]int, n)
for i := range parent {
    parent[i] = i
}

// 查找 路径压缩
var find func(int) int
find = func(x int) int {
    if parent[x] != x {
        parent[x] = find(parent[x])
    }
    return parent[x]
}

// 合并
union := func(from, to int) {
    p1, p2 := find(from), find(to)
    if p1 != p2 {
        parent[p1] = p2
    }
}
```
### 1.4.10. 图的存储 (邻接表)
Go 通常用 `[][]int` 表示图
```go
// n 个节点，edges = [[u, v], ...]
graph := make([][]int, n)
for _, e := range edges {
    u, v := e[0], e[1]
    graph[u] = append(graph[u], v)
    graph[v] = append(graph[v], u) // 无向图
}
```
### 1.4.11. 字典树 Trie (前缀树)
前缀问题
```go
type Trie struct {
    children [26]*Trie
    isEnd    bool
}

func (t *Trie) Insert(word string) {
    node := t
    for _, ch := range word {
        idx := ch - 'a'
        if node.children[idx] == nil {
            node.children[idx] = &Trie{}
        }
        node = node.children[idx]
    }
    node.isEnd = true
}
```

// To be continued

## 1.5. 常用算法技巧
### 1.5.1. 二分查找
除了手写 left <= right，Go 标准库提供了非常强大的二分模板
```go
// 手写模板 找左边界
l, r := 0, len(nums) 
for l < r {
    mid := int(uint(l+r) >> 1) // 防止溢出
    if nums[mid] >= target {
        r = mid
    } else {
        l = mid + 1
    }
}
``` 
标准库 `sort.Search`
`sort.Search(n, f)` 返回` [0, n) `中第一个满足 `f(i) == true` 的索引 `i`。如果都不满足，返回 `n`
```go
import "sort"

idx := sort.Search(len(nums), func(i int) bool {
    return nums[i] >= target
})

if idx < len(nums) && nums[idx] == target {
    fmt.Println("Found at", idx)
}
```
### 1.5.2. 网格遍历 (方向数组)
DFS/BFS 搜索二维网格
```go
// 方向数组：上右下左
dirs := []struct{ x, y int }{ {-1, 0}, {1, 0}, {0, -1}, {0, 1} }

for _, d := range dirs {
    nx, ny := x + d.x, y + d.y
    if nx >= 0 && nx < n && ny >= 0 && ny < m {
        // ...
    }
}
```

# 2. Python 部分
## 2.1. 核心数据类型

### 2.1.1. 整数 (int)
x = 10, y = -5
### 2.1.2. 浮点数 (float)
pi = 3.14
### 2.1.3. 布尔值 (bool)
flag = True, flag = False
### 2.1.4. 字符串 (str)
s = "hello world"

`a, b = b, a` 交换变量

## 2.2. 核心数据结构

### 2.2.1. 列表 (List)
#### 2.2.1.1. 创建
```python
nums = [1, 2, 3, 4] 

ans = []
```
#### 2.2.1.2. 访问
```python
first = nums[0] # 正向索引，从0开始

last = nums[-1] # 反向索引，从-1开始
```
#### 2.2.1.3. 切片
创建子列表，语法 [start:stop:step]
```python
copy = nums[:] # 创建列表浅拷贝

reverse = nums[::-1] # 翻转列表

```
#### 2.2.1.4. 列表的常用函数和操作
```python
len(nums)          # 获取长度
sum(nums)          # 对数字列表求和
min(nums) / max(nums) # 求最值
sorted(nums)       # 返回一个排好序的新列表
value in nums      # 成员检查 (O(n))
```
#### 2.2.1.5. 列表的常用方法
```python
nums.append(value)   # 在末尾添加
nums.pop(index)      # 删除并返回元素
nums.sort()          # 原地排序
nums.reverse()       # 原地反转
nums.index(value)    # 查找索引
```
### 2.2.2. 字典 (Dictionary / Hash Map)
字典是无序的键值对 (key: value) 集合。它通过哈希表实现，查找、插入、删除的平均时间复杂度为 O(1)
#### 2.2.2.1. 创建
```python
lookup = {'name': 'Alice', 'id': 123}
empty_dict = {}
```
#### 2.2.2.2. 操作
```python
name = lookup['name'] # 不存在会报错
lookup['id'] = 456 # 添加新的键值对

'id' in lookup # 检查键是否存在

del lookup['id'] # 删除键值对

for key in lookup.keys() # 遍历所有键

for value in lookup.values() # 遍历所有值

for key, value in lookup.items() # 同时遍历键和值
```
### 2.2.3. 集合 (Set)
集合是无序、不重复的元素集合。其底层也是哈希表，因此**检查一个元素是否存在**的速度极快 (O(1))
#### 2.2.3.1. 创建
```python
unique_nums = {1, 2, 3}
empty_set = set() # 不可以使用{}

from_list = set([1, 2, 2, 3, 1]) # -> {1, 2, 3} (天然去重)
```
#### 2.2.3.2. 操作
```python
unique_nums.add(4) # 添加元素
unique_nums.remove(3) # 删除元素

3 in unique_nums # 检查成员是否存在

set1 = {1, 2, 3}
set2 = {3, 4, 5}

# 交集 (intersection) - 两个集合中都有的元素
intersection = set1 & set2  # -> {3}

# 并集 (union) - 两个集合中所有的元素
union = set1 | set2         # -> {1, 2, 3, 4, 5}

# 差集 (difference) - 在 set1 中但不在 set2 中的元素
difference = set1 - set2    # -> {1, 2}
```

### 2.2.4. 字符串 (String)
不可变的文本序列
#### 2.2.4.1. 操作
**切片和索引**与**列表**完全相同
```python
new_str = str1 + str2

' '.join(['111', '222', '333']) # -> "111 222 333" (将列表连接成字符串)

"a,b,c".split(',') # -> ['a', 'b', 'c'] (将字符串分割成列表)

```

## 2.3. 控制流与逻辑
### 2.3.1. 条件判断 (if/elif/else)
```python
if score > 90:
    grade = 'A'
elif score > 80:
    grade = 'B'
else:
    grade = 'C'
```

**三元运算符 (Ternary Operator)**: result = "Even" if num % 2 == 0 else "Odd"
### 2.3.2. 循环
#### 2.3.2.1. for循环
```python
for num in numbers:
    print(num)

# 使用 range() 进行固定次数的循环
for i in range(5): # 循环 0, 1, 2, 3, 4
    print(i)

# 使用 enumerate
for index, value in enumerate(numbers):
    print(f"Index: {index}, Value: {value}")
```
#### 2.3.2.2. while 循环
```python
count = 5
while count > 0:
    print(count)
    count -= 1
```
### 2.3.3. 函数
```python
def solve(parameter1, parameter2):
    # 1. 初始化变量
    result = 0
    
    # 2. 核心逻辑
    # ... (使用循环、判断等)
    
    # 3. 返回结果
    return result
```

## 2.4. 通用内置函数
### 2.4.1. len(obj)
```python
length = len([1, 5, 9])      # -> 3
str_len = len("hello")       # -> 5
dict_len = len({'a': 1, 'b': 2}) # -> 2
```
### 2.4.2. sum(iterable)
```python
# 适用于数字组成的列表、元组等
total = sum([10, 20, 30])    # -> 60
```
### 2.4.3. min(iterable) / max(iterable)
```python
# 适用于可比较元素组成的序列
min_val = min([3, 1, 9, 2])  # -> 1
max_val = max([3, 1, 9, 2])  # -> 9
min_char = min("database")   # -> 'a' (按字母序)
```
### 2.4.4. sorted(iterable)
```python
# 返回一个全新的排好序的列表，不改变原对象
nums = [3, 1, 4, 2]
new_sorted_list = sorted(nums) # -> [1, 2, 3, 4]
# print(nums) 仍然是 [3, 1, 4, 2]

# 对字符串排序会得到字符列表
sorted_chars = sorted("bca") # -> ['a', 'b', 'c']
```
### 2.4.5. abs(x)
```python
num = abs(-5) # 5
```
### 2.4.6. range(start, stop, step)
```python
# range(stop)
for i in range(3):
    print(i) # -> 依次输出 0, 1, 2

# range(start, stop)
for i in range(1, 4):
    print(i) # -> 依次输出 1, 2, 3

# range(start, stop, step)
for i in range(0, 5, 2):
    print(i) # -> 依次输出 0, 2, 4
```
### 2.4.7. 类型转换函数
#### 2.4.7.1. int(x)
```python
a=int("123") # -> 123 
```
#### 2.4.7.2. str(obj)
```python
a=str(123) # -> "123"
```
#### 2.4.7.3. list(iterable)
```python
ans=list(range(3)) # -> [0, 1, 2]
```
#### 2.4.7.4. set(iterable)
```python
new_set=set([1, 2, 2, 3]) # -> {1, 2, 3}
```
### 2.4.8. enumerate(iterable)
```python
# 在循环中同时需要下标和元素的最佳方式
letters = ['a', 'b', 'c']
for index, value in enumerate(letters):
    print(f"Index: {index}, Value: {value}")
# -> Index: 0, Value: a
# -> Index: 1, Value: b
# -> Index: 2, Value: c
```
### 2.4.9. zip()
```python
# 将多个列表/元组等并行打包遍历
names = ['Alice', 'Bob']
scores = [95, 88]
for name, score in zip(names, scores):
    print(f"{name}: {score}")
# -> Alice: 95
# -> Bob: 88 
```
### 2.4.10. map(function, iterable)
```python
# 将函数应用于序列的每个元素，返回一个迭代器
str_nums = ["1", "2", "3"]
# 需要用 list() 来获取所有结果
int_nums = list(map(int, str_nums)) # -> [1, 2, 3]


line = "10 20 30"
nums = list(map(int, line.split())) # -> [10, 20, 30]
```

## 2.5. 核心数据类型方法
### 2.5.1. 字符串 (str)
#### 2.5.1.1. str.split(sep)
```python
s = "hello world"
words = s.split(' ')     # -> ['hello', 'world']

csv = "a,b,c"
items = csv.split(',')   # -> ['a', 'b', 'c']
```
#### 2.5.1.2. sep.join(list)
```python
words = ['hello', 'world']
s = " ".join(words)      # -> "hello world"

chars = ['p', 'y']
result = "-".join(chars) # -> "p-y"
```
#### 2.5.1.3. str.find(sub)
```python
s = "banana"
# 找不到时返回 -1
index1 = s.find('na')    # -> 2 (首次出现的位置)
index2 = s.find('z')     # -> -1
```
#### 2.5.1.4. str.count(sub)
```python
s = "banana"
count = s.count('a')     # -> 3
```
#### 2.5.1.5. str.strip()
```python
s = "  hello  "
clean_s = s.strip()      # -> "hello"
```
#### 2.5.1.6. str.isdigit()
```python
s1 = "123"
s2 = "a123"
print(s1.isdigit())      # -> True
print(s2.isdigit())      # -> False
```

### 2.5.2. 列表 (list)
#### 2.5.2.1. list.index(x[, start[, end]])
```python
aList = [123, 'xyz', 'runoob', 'abc']  
  
index1 = aList.index( 'xyz' )   # 1
index2 = aList.index( 'runoob', 1, 3 ) # 2
```
#### 2.5.2.2. list.append(x)
```python
nums = [1, 2]
nums.append(3)           # nums 变为 [1, 2, 3]
```
#### 2.5.2.3. list.pop(i)
时间复杂度为O(n),list模拟队列效率很低
```python
nums = [10, 20, 30]
last = nums.pop()        # -> 30, nums 变为 [10, 20]
# 删除并返回指定索引的元素
first = nums.pop(0)      # -> 10, nums 变为 [20]
```
#### 2.5.2.4. list.sort(cmp=None, key=None, reverse=False)

```python
nums = [3, 1, 4, 2]
nums.sort()              # nums 本身变为 [1, 2, 3, 4]

# 降序排序
nums.sort(reverse=True)  # nums 变为 [4, 3, 2, 1]

# 获取列表的第二个元素
def takeSecond(elem):
    return elem[1]
random = [(2, 2), (3, 4), (4, 1), (1, 3)]
# 指定第二个元素排序
random.sort(key=takeSecond) # 排序列表： [(4, 1), (2, 2), (1, 3), (3, 4)]

```
#### 2.5.2.5. list.reverse()
```python
nums = [1, 2, 3]
nums.reverse()           # nums 变为 [3, 2, 1]
```
#### 2.5.2.6. list.remove(obj)
删掉第一个匹配的
```python
list1 = ['Google', 'Runoob', 'Taobao', 'Baidu']  
list1.remove('Taobao')  # ['Google', 'Runoob', 'Baidu']
list1.remove('Baidu')   # ['Google', 'Runoob']
```
### 2.5.3. 字典 (dict)
#### 2.5.3.1. dict.get(key, default)
```python
counts = {'a': 2, 'b': 1}
# 获取键 'b' 的值
val1 = counts.get('b', 0)  # -> 1
# 获取键 'c' 的值，因不存在，返回默认值 0
val2 = counts.get('c', 0)  # -> 0
```
#### 2.5.3.2. dict.keys()
```python
counts = {'a': 2, 'b': 1}
for key in counts.keys():
    print(key) # -> 依次输出 'a', 'b'

sorted_keys = sorted(counts.keys()) # -> ['a', 'b']
```
#### 2.5.3.3. dict.values()
```python
counts = {'a': 2, 'b': 1}
for value in counts.values():
    print(value) # -> 依次输出 2, 1

values_list = list(counts.values()) # -> [2, 1]
```
#### 2.5.3.4. dict.items()
```python
counts = {'a': 2, 'b': 1}
for key, value in counts.items():
    print(f"{key}: {value}")
# -> a: 2
# -> b: 1
```

## 2.6. Collections
### 2.6.1. defaultdict
使用dict时，如果引用的Key不存在，就会抛出KeyError。如果希望key不存在时，返回一个默认值，就可以用`defaultdict`

```python
dd = defaultdict(lambda: 'N/A')
```
使用`lambda` 可创建默认值 
否则的话默认是0


>这边还在等待更新中
>其实是刷题刷着刷着觉得应该开始总结经验还有防止忘记