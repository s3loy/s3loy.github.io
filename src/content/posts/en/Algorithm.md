---
title: Algorithm
published: 2025-10-29
tags:
  - python
  - golang
  - algorithm
lang: en
translationKey: algorithm
---

## 1. Go

### 1.1. Core Data Types

#### 1.1.1. Integers and Floating-Point Numbers

```go
var x int = 10
y := -5   
var big int64 = 1 << 62

pi := 3.14159     // float64

a := 5.0 
b := int(a)       // Explicit type conversion

```

Extreme values

```go
import "math"

const MaxInt = math.MaxInt
const MinInt = math.MinInt
const MaxFloat64 = math.MaxFloat64
```

#### 1.1.2. Strings & rune

Go strings are immutable byte slices. When handling strings that contain Chinese or special characters, use `rune`.

```go
s := "Hello 世界"
len(s)              // 12 (length in bytes; a Chinese character takes 3 bytes)
len([]rune(s))      // 8 (number of characters)

var ch byte = 'A'   // ASCII 
var r rune = '世'   // Unicode 

// String concatenation (use strings.Builder inside loops)
s = s + "!"
```

#### 1.1.3. Swapping Variables

```go
a, b = b, a
```

### 1.2. Core Data Structures

#### 1.2.1. Slices: Dynamic Arrays

##### 1.2.1.1. Creating a Slice

```go
nums := []int{1, 2, 3}

// make(type, len, cap)
ans := make([]int, 0)      // Empty slice
grid := make([][]int, n)   // Initializing a two-dimensional slice requires a loop
for i := range grid {
    grid[i] = make([]int, m)
}
```

##### 1.2.1.2. Access and Slicing

**Slicing creates a shallow copy**: modifying a subslice affects the original slice.

```go
val := nums[0]
sub := nums[1:3]  // [start:end], inclusive start and exclusive end: [start,end)
copySub := make([]int, len(sub))
copy(copySub, sub) // A deep copy requires an explicit copy
```

##### 1.2.1.3. Common Operations

```go
nums = append(nums, 4)
nums = append(nums, 5, 6)

n := len(nums)
c := cap(nums)
```

#### 1.2.2. map: Mappings and Hash Tables

Unordered key-value pairs

##### 1.2.2.1. Creation and Operations

```go
m := make(map[string]int)
m["age"] = 18

dict := map[string]int{
    "a": 1,
    "b": 2,
}
```

`map[keyType]valueType`
Use `keyType: valueType,` during initialization.

##### 1.2.2.2. Key Check

```go
val, ok := map["a"]

// Can be used with if
if val, ok := map["a"]; ok {
  pass
}
```

##### 1.2.2.3. Deletion and Iteration

```go
delete(map, "a")

// Iteration order is random
for k, v := range m {
    fmt.Println(k, v)
}

```

#### 1.2.3. Control Flow

##### 1.2.3.1. Conditional Statements: if

```go
if x := 10; x > 5 {
    // x is scoped to the if/else block
    fmt.Println(x)
} else if x == 5 {
    pass
} else {
    pass
}
```

##### 1.2.3.2. Loops: for

There is only `for`.

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

// Iterating with range
for i, v := range nums { ... }  // Iterate over a slice: index, value
for i := range nums { ... }     // Iterate over indices only
for _, v := range nums { ... }  // Iterate over values only
for k, v := range myMap { ... } // Iterate over a map
for i, ch := range str { ... }  // Iterate over a string: i is the byte index, ch is a rune
```

##### 1.2.3.3. switch

No `break` is needed by default.

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

### 1.3. Common Standard Libraries and Functions

#### 1.3.1. Sorting: sort

```go
import "sort"

nums := []int{3, 1, 2}

sort.Ints(nums)          // [1, 2, 3]
sort.Strings(strList)


sort.Slice(nums, func(i, j int) bool {
    return abs(nums[i]) > abs(nums[j])
})
```

#### 1.3.2. Math: math

Go's math package mainly works with float64. For int, Go 1.21 introduced the built-in min/max functions.

```go
import "math"
m := max(1, 5)
n := min(10, 2)

f := math.Abs(-5.2)
p := math.Pow(2, 10)
sq := math.Sqrt(16)

func abs(x int) int { if x < 0 { return -x }; return x }
```

#### 1.3.3. String Processing: strings / strconv

```go
import (
    "strings"
    "strconv"
)

arr := strings.Split("a,b,c", ",")     // -> []string{"a", "b", "c"}
s := strings.Join(arr, "-")            // -> "a-b-c"
idx := strings.Index("hello", "e")     // -> 1 (returns -1 if not found)
cnt := strings.Count("banana", "a")    // -> 3
has := strings.Contains("hello", "he") // -> true

// strconv (type conversion)
// String -> Int
num, err := strconv.Atoi("123")        // a 2 i
// Int -> String
str := strconv.Itoa(123)               // i 2 a
```

### 1.4. Common Algorithm Templates

#### 1.4.1. Stack

There is no built-in stack.

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

#### 1.4.2. Queue

Use a slice to simulate a queue. Dequeuing with nums = nums[1:] may cause a memory leak (the underlying array is not released), which can usually be ignored.

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

#### 1.4.3. Set

Go has no set type; use map[key]bool or map[key]struct{} to simulate one.

```go
set := make(map[int]struct{}) // An empty struct takes no memory

// Add
set[1] = struct{}{}    // Initialize struct{} as struct{}{}

// Contains
if _, ok := set[1]; ok { ... }

// Remove
delete(set, 1)
```

#### 1.4.4. ListNode: Linked Lists

```go
type ListNode struct {
    Val  int
    Next *ListNode
}

// Use a dummy node to handle the head boundary
dummy := &ListNode{Next: head}
cur := dummy
```

#### 1.4.5. TreeNode: Binary Trees

```go
type TreeNode struct {
    Val   int
    Left  *TreeNode
    Right *TreeNode
}
```

#### 1.4.6. Priority Queue / Heap

Implement the `heap.Interface` interface.

```go
import "container/heap"

type IntHeap []int

// Implement the three methods of sort.Interface
func (h IntHeap) Len() int           { return len(h) }
func (h IntHeap) Less(i, j int) bool { return h[i] < h[j] } // Min-heap: <; max-heap: >
func (h IntHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }

// Implement Push and Pop for the heap interface
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

// Usage
func main() {
    h := &IntHeap{2, 1, 5}
    heap.Init(h)                // Initialize: O(n)
    heap.Push(h, 3)             // Push onto the heap: O(log n)
    minVal := heap.Pop(h).(int) // Pop from the heap: O(log n)
}
```

#### 1.4.7. Bitwise Operations

```go
x & y   // AND
x | y   // OR
x ^ y   // XOR
x &^ y  // AND NOT (clear the bits in x where y has a 1)
x << n  // Left shift
x >> n  // Right shift
```

#### 1.4.8. Input and Output

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
    fmt.Fscan(in, &n) // Read input
    
    // ... logic ...
    
    fmt.Fprintln(out, n) // Write output
}

```

#### 1.4.9. Union-Find (DSU)

For connectivity problems

```go
parent := make([]int, n)
for i := range parent {
    parent[i] = i
}

// Find with path compression
var find func(int) int
find = func(x int) int {
    if parent[x] != x {
        parent[x] = find(parent[x])
    }
    return parent[x]
}

// Union
union := func(from, to int) {
    p1, p2 := find(from), find(to)
    if p1 != p2 {
        parent[p1] = p2
    }
}
```

#### 1.4.10. Graph Storage (Adjacency Lists)

Go commonly uses `[][]int` to represent a graph.

```go
// n nodes, edges = [[u, v], ...]
graph := make([][]int, n)
for _, e := range edges {
    u, v := e[0], e[1]
    graph[u] = append(graph[u], v)
    graph[v] = append(graph[v], u) // Undirected graph
}
```

#### 1.4.11. Trie (Prefix Tree)

For prefix problems

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

### 1.5. Common Algorithm Techniques

#### 1.5.1. Binary Search

Besides writing left <= right by hand, Go's standard library provides a powerful binary-search template.

```go
// Handwritten template: find the left boundary
l, r := 0, len(nums) 
for l < r {
    mid := int(uint(l+r) >> 1) // Prevent overflow
    if nums[mid] >= target {
        r = mid
    } else {
        l = mid + 1
    }
}
```

The standard library's `sort.Search`
`sort.Search(n, f)` returns the first index `i` in `[0, n)` for which `f(i) == true`. If none exists, it returns `n`.

```go
import "sort"

idx := sort.Search(len(nums), func(i int) bool {
    return nums[i] >= target
})

if idx < len(nums) && nums[idx] == target {
    fmt.Println("Found at", idx)
}
```

#### 1.5.2. Grid Traversal (Direction Arrays)

Search a two-dimensional grid with DFS/BFS.

```go
// Direction array: up, right, down, left
dirs := []struct{ x, y int }{ {-1, 0}, {1, 0}, {0, -1}, {0, 1} }

for _, d := range dirs {
    nx, ny := x + d.x, y + d.y
    if nx >= 0 && nx < n && ny >= 0 && ny < m {
        // ...
    }
}
```

## 2. Python

### 2.1. Core Data Types

#### 2.1.1. Integers (int)

x = 10, y = -5

#### 2.1.2. Floating-Point Numbers (float)

pi = 3.14

#### 2.1.3. Booleans (bool)

flag = True, flag = False

#### 2.1.4. Strings (str)

s = "hello world"

`a, b = b, a` swaps two variables.

### 2.2. Core Data Structures

#### 2.2.1. Lists

##### 2.2.1.1. Creating a List

```python
nums = [1, 2, 3, 4] 

ans = []
```

##### 2.2.1.2. Access

```python
first = nums[0] # Forward indexing starts at 0

last = nums[-1] # Negative indexing starts at -1
```

##### 2.2.1.3. Slicing

Create a sublist with the syntax [start:stop:step].

```python
copy = nums[:] # Create a shallow copy of the list

reverse = nums[::-1] # Reverse the list

```

##### 2.2.1.4. Common List Functions and Operations

```python
len(nums)          # Get the length
sum(nums)          # Sum a list of numbers
min(nums) / max(nums) # Find the minimum / maximum
sorted(nums)       # Return a new sorted list
value in nums      # Membership check (O(n))
```

##### 2.2.1.5. Common List Methods

```python
nums.append(value)   # Append to the end
nums.pop(index)      # Remove and return an element
nums.sort()          # Sort in place
nums.reverse()       # Reverse in place
nums.index(value)    # Find the index
```

#### 2.2.2. Dictionary / Hash Map

A dictionary is an unordered collection of key-value pairs (key: value). It is implemented with a hash table, with average O(1) time complexity for lookup, insertion, and deletion.

##### 2.2.2.1. Creating a Dictionary

```python
lookup = {'name': 'Alice', 'id': 123}
empty_dict = {}
```

##### 2.2.2.2. Operations

```python
name = lookup['name'] # Raises an error if the key does not exist
lookup['id'] = 456 # Add a new key-value pair

'id' in lookup # Check whether a key exists

del lookup['id'] # Delete a key-value pair

for key in lookup.keys() # Iterate over all keys

for value in lookup.values() # Iterate over all values

for key, value in lookup.items() # Iterate over keys and values together
```

#### 2.2.3. Sets

A set is an unordered collection of unique elements. It also uses a hash table underneath, so **checking whether an element exists** is very fast (O(1)).

##### 2.2.3.1. Creating a Set

```python
unique_nums = {1, 2, 3}
empty_set = set() # Do not use {}

from_list = set([1, 2, 2, 3, 1]) # -> {1, 2, 3} (duplicates are removed automatically)
```

##### 2.2.3.2. Operations

```python
unique_nums.add(4) # Add an element
unique_nums.remove(3) # Remove an element

3 in unique_nums # Check membership

set1 = {1, 2, 3}
set2 = {3, 4, 5}

# Intersection: elements present in both sets
intersection = set1 & set2  # -> {3}

# Union: all elements from both sets
union = set1 | set2         # -> {1, 2, 3, 4, 5}

# Difference: elements in set1 but not in set2
difference = set1 - set2    # -> {1, 2}
```

#### 2.2.4. Strings

Immutable sequences of text

##### 2.2.4.1. Operations

**Slicing and indexing** work exactly as they do for **lists**.

```python
new_str = str1 + str2

' '.join(['111', '222', '333']) # -> "111 222 333" (join a list into a string)

"a,b,c".split(',') # -> ['a', 'b', 'c'] (split a string into a list)

```

### 2.3. Control Flow and Logic

#### 2.3.1. Conditional Statements (if/elif/else)

```python
if score > 90:
    grade = 'A'
elif score > 80:
    grade = 'B'
else:
    grade = 'C'
```

**Ternary operator**: result = "Even" if num % 2 == 0 else "Odd"

#### 2.3.2. Loops

##### 2.3.2.1. for Loops

```python
for num in numbers:
    print(num)

# Use range() for a fixed number of iterations
for i in range(5): # Loop over 0, 1, 2, 3, 4
    print(i)

# Use enumerate
for index, value in enumerate(numbers):
    print(f"Index: {index}, Value: {value}")
```

##### 2.3.2.2. while Loops

```python
count = 5
while count > 0:
    print(count)
    count -= 1
```

#### 2.3.3. Functions

```python
def solve(parameter1, parameter2):
    # 1. Initialize variables
    result = 0
    
    # 2. Core logic
    # ... (use loops, conditionals, etc.)
    
    # 3. Return the result
    return result
```

### 2.4. General Built-in Functions

#### 2.4.1. len(obj)

```python
length = len([1, 5, 9])      # -> 3
str_len = len("hello")       # -> 5
dict_len = len({'a': 1, 'b': 2}) # -> 2
```

#### 2.4.2. sum(iterable)

```python
# Works with lists, tuples, etc. containing numbers
total = sum([10, 20, 30])    # -> 60
```

#### 2.4.3. min(iterable) / max(iterable)

```python
# Works with sequences of comparable elements
min_val = min([3, 1, 9, 2])  # -> 1
max_val = max([3, 1, 9, 2])  # -> 9
min_char = min("database")   # -> 'a' (alphabetical order)
```

#### 2.4.4. sorted(iterable)

```python
# Return a new sorted list without changing the original object
nums = [3, 1, 4, 2]
new_sorted_list = sorted(nums) # -> [1, 2, 3, 4]
# print(nums) is still [3, 1, 4, 2]

# Sorting a string produces a list of characters
sorted_chars = sorted("bca") # -> ['a', 'b', 'c']
```

#### 2.4.5. abs(x)

```python
num = abs(-5) # 5
```

#### 2.4.6. range(start, stop, step)

```python
# range(stop)
for i in range(3):
    print(i) # -> Prints 0, 1, 2 in order

# range(start, stop)
for i in range(1, 4):
    print(i) # -> Prints 1, 2, 3 in order

# range(start, stop, step)
for i in range(0, 5, 2):
    print(i) # -> Prints 0, 2, 4 in order
```

#### 2.4.7. Type Conversion Functions

##### 2.4.7.1. int(x)

```python
a=int("123") # -> 123 
```

##### 2.4.7.2. str(obj)

```python
a=str(123) # -> "123"
```

##### 2.4.7.3. list(iterable)

```python
ans=list(range(3)) # -> [0, 1, 2]
```

##### 2.4.7.4. set(iterable)

```python
new_set=set([1, 2, 2, 3]) # -> {1, 2, 3}
```

#### 2.4.8. enumerate(iterable)

```python
# The best way to get both indices and elements in a loop
letters = ['a', 'b', 'c']
for index, value in enumerate(letters):
    print(f"Index: {index}, Value: {value}")
# -> Index: 0, Value: a
# -> Index: 1, Value: b
# -> Index: 2, Value: c
```

#### 2.4.9. zip()

```python
# Pack multiple lists, tuples, etc. together and iterate in parallel
names = ['Alice', 'Bob']
scores = [95, 88]
for name, score in zip(names, scores):
    print(f"{name}: {score}")
# -> Alice: 95
# -> Bob: 88 
```

#### 2.4.10. map(function, iterable)

```python
# Apply a function to each element in a sequence and return an iterator
str_nums = ["1", "2", "3"]
# Use list() to obtain all results
int_nums = list(map(int, str_nums)) # -> [1, 2, 3]


line = "10 20 30"
nums = list(map(int, line.split())) # -> [10, 20, 30]
```

### 2.5. Core Data Type Methods

#### 2.5.1. Strings (str)

##### 2.5.1.1. str.split(sep)

```python
s = "hello world"
words = s.split(' ')     # -> ['hello', 'world']

csv = "a,b,c"
items = csv.split(',')   # -> ['a', 'b', 'c']
```

##### 2.5.1.2. sep.join(list)

```python
words = ['hello', 'world']
s = " ".join(words)      # -> "hello world"

chars = ['p', 'y']
result = "-".join(chars) # -> "p-y"
```

##### 2.5.1.3. str.find(sub)

```python
s = "banana"
# Returns -1 if not found
index1 = s.find('na')    # -> 2 (position of the first occurrence)
index2 = s.find('z')     # -> -1
```

##### 2.5.1.4. str.count(sub)

```python
s = "banana"
count = s.count('a')     # -> 3
```

##### 2.5.1.5. str.strip()

```python
s = "  hello  "
clean_s = s.strip()      # -> "hello"
```

##### 2.5.1.6. str.isdigit()

```python
s1 = "123"
s2 = "a123"
print(s1.isdigit())      # -> True
print(s2.isdigit())      # -> False
```

#### 2.5.2. Lists (list)

##### 2.5.2.1. list.index(x[, start[, end]])

```python
aList = [123, 'xyz', 'runoob', 'abc']  
  
index1 = aList.index( 'xyz' )   # 1
index2 = aList.index( 'runoob', 1, 3 ) # 2
```

##### 2.5.2.2. list.append(x)

```python
nums = [1, 2]
nums.append(3)           # nums becomes [1, 2, 3]
```

##### 2.5.2.3. list.pop(i)

The time complexity is O(n); using a list to simulate a queue is inefficient.

```python
nums = [10, 20, 30]
last = nums.pop()        # -> 30, nums becomes [10, 20]
# Remove and return the element at the specified index
first = nums.pop(0)      # -> 10, nums becomes [20]
```

##### 2.5.2.4. list.sort(cmp=None, key=None, reverse=False)

```python
nums = [3, 1, 4, 2]
nums.sort()              # nums itself becomes [1, 2, 3, 4]

# Sort in descending order
nums.sort(reverse=True)  # nums becomes [4, 3, 2, 1]

# Get the second element of a list
def takeSecond(elem):
    return elem[1]
random = [(2, 2), (3, 4), (4, 1), (1, 3)]
# Sort by the second element
random.sort(key=takeSecond) # Sorted list: [(4, 1), (2, 2), (1, 3), (3, 4)]

```

##### 2.5.2.5. list.reverse()

```python
nums = [1, 2, 3]
nums.reverse()           # nums becomes [3, 2, 1]
```

##### 2.5.2.6. list.remove(obj)

Remove the first match.

```python
list1 = ['Google', 'Runoob', 'Taobao', 'Baidu']  
list1.remove('Taobao')  # ['Google', 'Runoob', 'Baidu']
list1.remove('Baidu')   # ['Google', 'Runoob']
```

#### 2.5.3. Dictionaries (dict)

##### 2.5.3.1. dict.get(key, default)

```python
counts = {'a': 2, 'b': 1}
# Get the value of key 'b'
val1 = counts.get('b', 0)  # -> 1
# Get the value of key 'c'; since it does not exist, return the default value 0
val2 = counts.get('c', 0)  # -> 0
```

##### 2.5.3.2. dict.keys()

```python
counts = {'a': 2, 'b': 1}
for key in counts.keys():
    print(key) # -> Prints 'a', 'b' in order

sorted_keys = sorted(counts.keys()) # -> ['a', 'b']
```

##### 2.5.3.3. dict.values()

```python
counts = {'a': 2, 'b': 1}
for value in counts.values():
    print(value) # -> Prints 2, 1 in order

values_list = list(counts.values()) # -> [2, 1]
```

##### 2.5.3.4. dict.items()

```python
counts = {'a': 2, 'b': 1}
for key, value in counts.items():
    print(f"{key}: {value}")
# -> a: 2
# -> b: 1
```

### 2.6. Collections

#### 2.6.1. defaultdict

When using a dict, referencing a missing key raises a KeyError. Use `defaultdict` if you want a default value returned when the key does not exist.

```python
dd = defaultdict(lambda: 'N/A')
```

Use `lambda` to create a default value.
Otherwise, the default is 0.

### 2.7. Input and Output Templates

#### 2.7.1. Basic Input

```python
# Read a line of text
s = input().strip()

# Read an integer
n = int(input())

# Read several integers on one line
a, b, c = map(int, input().split())

# Read a variable-length list of integers on one line
nums = list(map(int, input().split()))
```

#### 2.7.2. Reading Multiple Lines (Known Line Count)

```python
n = int(input())
arr = []
for _ in range(n):
    line = list(map(int, input().split()))
    arr.append(line)

# Or use a list comprehension
arr = [list(map(int, input().split())) for _ in range(n)]
```

#### 2.7.3. Reading Until EOF (End of File)

```python
import sys

# Method 1: read line by line
for line in sys.stdin:
    a, b = map(int, line.split())
    # ... processing logic

# Method 2: read everything, then process it
data = sys.stdin.read().strip().split()
# data is a list of all whitespace-separated strings
it = iter(data)
n = int(next(it))
nums = [int(next(it)) for _ in range(n)]
```

#### 2.7.4. T Test Cases

```python
T = int(input())
for _ in range(T):
    n = int(input())
    nums = list(map(int, input().split()))
    # ... logic for each case
    print(solve(n, nums))
```

#### 2.7.5. Output Formatting

```python
# Print a single value
print(ans)

# Print a list separated by spaces
print(' '.join(map(str, nums)))

# Print multiple lines
for x in ans:
    print(x)

# No trailing space
print(*nums)  # Automatically separates values with spaces
```

#### 2.7.6. Faster Input

```python
import sys
# Rebind input to a faster reader
input = sys.stdin.readline

n = int(input())
nums = list(map(int, input().split()))

# strip() still works after rebinding input()
s = input().strip()
```

>This section is still waiting for updates.
>Really, I just kept solving problems and felt it was time to summarize what I had learned before I forgot it.
