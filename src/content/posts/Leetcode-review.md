---
title: LeetCode Review
published: 2026-03-02T15:45:00
tags:
  - algorithm
  - golang
  - python
---

题单为leetcode经典150
## 数组 / 字符串
### 68. 文本左右对齐

[68. 文本左右对齐 - 力扣（LeetCode）](https://leetcode.cn/problems/text-justification/description/)

```python
class Solution:
  def fullJustify(self, words: List[str], maxWidth: int) -> List[str]:
    ans=[]
    word_list=[]
    cur_len = 0
    for word in words:
      if cur_len + len(word) + len(word_list) > maxWidth:
        spaces = maxWidth - cur_len
        gaps = len(word_list) - 1
        if gaps == 0:
          line = word_list[0] + ' ' * spaces
        else:
          average,left = divmod(spaces,gaps)
          line = ''
          for i in range(gaps):
            line += word_list[i]
            line += average* ' '
            if i<left:
              line +=' '
          line += word_list[-1]
        ans.append(line)
        #initialize
        word_list = []
        cur_len = 0
      word_list.append(word)
      cur_len += len(word)
    #最后一行
    line = ' '.join(word_list)
    spaces = maxWidth - len(line)
    line += ' ' * spaces
    ans.append(line)
    
    return ans
```

一开始先写了处理溢出的情况，不过中间还需要先存储那些可以的word再合成一个line

思路就是一行一行读一行一行造，里面有一个问题是在这里

```python
for i in range(gaps):
  line += word_list[i]
  line += average* ' '
  if i<left:
    line +=' '
```

这个`i<left`我想了很久

left是余数，i是中间有的空格-1，这边要的效果是把余数在前面的空里面填满

那假设有3个要填的，有四个空格，要填的i是0，1，2，此时left=3

5个要填的，有七个空格，要填的i是0，1，2，3，4，此时left=5

那很明显可以用i<left来限制

然后就造吧


### [392. 判断子序列](https://leetcode.cn/problems/is-subsequence/)

```python
class Solution:
  def isSubsequence(self, s: str, t: str) -> bool:
    it = iter(t)
    return all(c in it for c in s)
```

迭代器神力，同时判断是不是在里面
同时使用`all( )`


### [1312. 让字符串成为回文串的最少插入次数](https://leetcode.cn/problems/minimum-insertion-steps-to-make-a-string-palindrome/)

```python
class Solution:
  def minInsertions(self, s: str) -> int:
    re_str=s[::-1]
    def longestCommonSubsequence(text1: str, text2: str) -> int:
      m = len(text1)
      n = len(text2)

      dp = [[0] * (n + 1) for _ in range(m + 1)]
      for i in range(1, m + 1):
        for j in range(1, n + 1):
          if text1[i - 1] == text2[j - 1]:
            dp[i][j] = dp[i - 1][j - 1] + 1
          else:
            dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
      return dp[m][n]

    return len(s)-longestCommonSubsequence(s,re_str)
```

套用了另外一道简单题目`lcs`，第一次涉及`dp`
#### 如何求lcs

```python
def longestCommonSubsequence(text1: str, text2: str) -> int:
  m = len(text1)
  n = len(text2)

  dp = [[0] * (n + 1) for _ in range(m + 1)]
  for i in range(1, m + 1):
    for j in range(1, n + 1):
      if text1[i - 1] == text2[j - 1]:
        dp[i][j] = dp[i - 1][j - 1] + 1
      else:
        dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
  return dp[m][n]
```

m = `"abccdca"`
n = `"adcaab" 
lcs = `"aca"`


**情况一：两个字符串的最后一个字符相等**
如果 `text1[i-1] == text2[j-1]`
- 这意味着我们找到了一个公共字符！这个字符**必然**可以作为它们公共子序列的一部分。
- 那么，text1 的前 i 个字符和 text2 的前 j 个字符的LCS，就等于它们**各自去掉最后一个字符**后的LCS长度再**加1**。
- 用 dp 数组来表示就是：`dp[i][j] = dp[i-1][j-1] + 1`

**举例：** 求 "ab**c**" 和 "ad**c**" 的LCS。因为最后一个字符 'c' 相等，问题就转化为求 "ab" 和 "ad" 的LCS长度，然后加1。

**情况二：两个字符串的最后一个字符不相等**
如果 `text1[i-1] != text2[j-1]`
- 这意味着这两个不同的字符**不可能同时**出现在LCS的末尾。
- 那么，我们就要在两种可能性中取一个较大值：
  1. text1 的前 i 个字符和 text2 的前 j-1 个字符的LCS长度（相当于把 text2 的最后一个字符扔掉，看看结果）。这个值就是 `dp[i][j-1]`。
  2. text1 的前 i-1 个字符和 text2 的前 j 个字符的LCS长度（相当于把 text1 的最后一个字符扔掉，看看结果）。这个值就是 `dp[i-1][j]`。
- 我们取这两者中的最大值，因为它代表了更长的公共子序列。
- 用 dp 数组来表示就是：`dp[i][j] = max(dp[i-1][j], dp[i][j-1])`

这题看题解去吧,俺也懵懵的

### [3354. 使数组元素等于零 - 力扣（LeetCode）](https://leetcode.cn/problems/make-array-elements-equal-to-zero/)
```python
class Solution:
  def countValidSelections(self, nums: List[int]) -> int:
    num_sum= sum(nums)
    left_sum = 0
    ans = 0
    right_sum = num_sum
    for num in nums:
      if num == 0:
        if left_sum == right_sum:
          ans+=2
        elif left_sum - right_sum == 1 or right_sum - left_sum == 1:
          ans+=1
      else:
        left_sum+=num
        right_sum=num_sum-left_sum
    return ans


```
思路非常简单，发现题目根本没必要使用动态的想法
## 双指针
### [167. 两数之和 II - 输入有序数组 - 力扣（LeetCode）](https://leetcode.cn/problems/two-sum-ii-input-array-is-sorted/)

```python
class Solution:
  def twoSum(self, numbers: List[int], target: int) -> List[int]:
    index1=0
    index2=0
    for index,num in enumerate(numbers):
      requirement=target-num
      if requirement in numbers:
        index1=index+1
        if num == requirement:
          index2 = numbers.index(requirement, index1) + 1
          return [index1, index2]
        else:
          index2 = numbers.index(requirement) +1
          return [index1,index2]
```

这是第一次ac代码，执行用时分布 5813ms 击败5.20%
没错高贵的O(n^2),那可得好好优化一下了

在这应该使用`双指针`来快速查找,避免多次遍历
```python
class Solution:
  def twoSum(self, numbers: List[int], target: int) -> List[int]:
    left=0
    right=len(numbers)-1
    while left < right:
      cur_sum=numbers[left]+numbers[right]
      if cur_sum==target:
        return [left+1,right+1]
      elif cur_sum < target:
        left+=1
      else:
        right-=1
```
该方法时间复杂度为O(n)  执行用时分布 4ms 击败50.86%
~~奇怪，为什么一样的算法他们能跑到0ms的，是我没充钱吗？~~

### [11. 盛最多水的容器 - 力扣（LeetCode）](https://leetcode.cn/problems/container-with-most-water/)

贪心双指针一遍过
```python
class Solution:
  def maxArea(self, height: List[int]) -> int:
    max_volume=0
    left=0
    right=len(height)-1
    while(left!=right):
      x=right-left
      y=min(height[left],height[right])
      v=x*y
      if v>max_volume:
        max_volume=v
      if height[left]>=height[right]:
        right-=1
      else:
        left+=1
    return max_volume
```

### [15. 三数之和 - 力扣（LeetCode）](https://leetcode.cn/problems/3sum/)
这是第一版🔟山,最后tle了
```python
class Solution:
  def threeSum(self, nums: List[int]) -> List[List[int]]:
    if len(nums) < 3:
      return []
    sorted_nums = sorted(nums)
    count = 0
    for num in sorted_nums:
      if num < 0:
        count += 1
    nums1 = sorted_nums[:count]
    nums2 = sorted_nums[count:]
    if not nums1 or not nums2:
      if sorted_nums.count(0) >= 3:
        return [[0, 0, 0]]
      return []
    ans = []
    seen = []
    for i in nums1:
      for j in nums2:
        k = -i - j
        if k not in sorted_nums:
          continue
        if [i, j, k].count(i) > sorted_nums.count(i):
          continue
        if [i, j, k].count(j) > sorted_nums.count(j):
          continue
        if [i, j, k].count(k) > sorted_nums.count(k):
          continue

        triple = sorted([i, j, k])
        if triple not in seen:
          seen.append(triple)
          ans.append(triple)

    if sorted_nums.count(0) >= 3:
      ans.append([0, 0, 0])
    return ans
```

这是高贵的O(n^3)算法，暴力的后果还是被卡了啊，同时内存也多到爆炸，于是想到三指针

```python
class Solution:
  def threeSum(self, nums: List[int]) -> List[List[int]]:
    ans=[]
    nums.sort()
    n=len(nums)
    for i in range(n-2):
      if i > 0 and nums[i]==nums[i-1]:
        continue
      left=i+1
      right=n-1
      while left < right:
        s = nums[i]+nums[left]+nums[right]
        if s==0:
          ans.append([nums[i],nums[left],nums[right]])
          while left < right and nums[left]==nums[left+1]:
            left+=1
          while left < right and nums[right]==nums[right-1]:
            right-=1
          left+=1
          right-=1
        elif s<0:
          left+=1
        else:
          right-=1
    return ans
```
## 滑动窗口
### [209. 长度最小的子数组 - 力扣（LeetCode）](https://leetcode.cn/problems/minimum-size-subarray-sum/)
滑动窗口初尝试，好像不难，和双指针很像了
```python
class Solution:
  def minSubArrayLen(self, target: int, nums: List[int]) -> int:
    n=len(nums)
    ans=n+1
    s=0
    left=0
    for right,num in enumerate(nums):
      s+=num
      while s>=target:
        ans=min(ans,right-left+1)
        s-=nums[left]
        left+=1
    if ans==n+1:return 0
    return ans 
```

### [3. 无重复字符的最长子串 - 力扣（LeetCode）](https://leetcode.cn/problems/longest-substring-without-repeating-characters/)
滑动窗口+hashmap
```python
class Solution:
  def lengthOfLongestSubstring(self, s: str) -> int:
    start = 0
    seen = set()
    maxlen = 0

    for end in range(len(s)):
      while s[end] in seen:
        seen.remove(s[start])
        start += 1
      seen.add(s[end])
      maxlen = max(maxlen, end - start + 1)
  
    return maxlen
```
和[LCR 167. 招式拆解 I - 力扣（LeetCode）](https://leetcode.cn/problems/zui-chang-bu-han-zhong-fu-zi-fu-de-zi-zi-fu-chuan-lcof/)是一样的，因此一起过了

### [30. 串联所有单词的子串 - 力扣（LeetCode）](https://leetcode.cn/problems/substring-with-concatenation-of-all-words/)
一开始思路不好，神秘的O(n!xn)算法
```python
class Solution:
  def generate_permutations(self,words:str) -> List[str]:
    if len(words) == 1:
      return words
    res = []
    for i in range(len(words)):
      first = words[i]
      rest = words[:i] + words[i+1:]
      for sub in self.generate_permutations(rest):
        res.append(first + sub)
    return res

  def findSubstring(self, s: str, words: List[str]) -> List[int]:
    sub_words = set(self.generate_permutations(words))
    l=len(s)
    window = len(words[0]) * len(words)
    if window > len(s): return []
    ans=[]
    for start in range(0, len(s) - window + 1): 
      if s[start : start + window] in sub_words:
        ans.append(start)
    return ans

    
  
```

124 / 182 个通过的测试用例
提交于 2025.10.30 21:35
`s ="fffffffffffffffffffffffffffffffff"`
`words =["a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a"]`
很明显会因为生成子串的过程太长导致tle
所以换一个思路，把words用键值对一一对应

```python
class Solution:
  def findSubstring(self, s: str, words: List[str]) -> List[int]:
    if not s or not words:
      return []
    word_len = len(words[0]) 
    total_len = word_len * len(words)
    word_map = {w: words.count(w) for w in words} 
    ans = []
    n = len(s)
    for i in range(0, n - total_len + 1):
      seen = {}
      j = 0    
      while j < len(words):
        word_start = i + j * word_len
        word_end = word_start + word_len
        word = s[word_start:word_end]
        if word not in word_map:
          break
        seen[word] = seen.get(word, 0) + 1
        if seen[word] > word_map[word]:
          break
        j += 1
      if j == len(words):
        ans.append(i)
    return ans

```
[30. 串联所有单词的子串 - 力扣（LeetCode）](https://leetcode.cn/problems/substring-with-concatenation-of-all-words/submissions/674785574)
这测试点诗人啊
181 / 182 个通过的测试用例


ac代码
```python
class Solution:
  def findSubstring(self, s: str, words: List[str]) -> List[int]:
    if not s or not words:
      return []
    word_len = len(words[0])
    total_len = word_len * len(words)
    word_map = {w: words.count(w) for w in words}
    ans = []
    n = len(s)
    for offset in range(word_len):
      left = offset
      seen = {}
      count = 0
      for right in range(offset, n - word_len + 1, word_len):
        word = s[right:right+word_len]
        if word in word_map:
          seen[word] = seen.get(word, 0) + 1
          count += 1
          while seen[word] > word_map[word]:
            left_word = s[left:left+word_len]
            seen[left_word] -= 1
            left += word_len
            count -= 1
          if count == len(words):
            ans.append(left)
        else:
          seen.clear()
          count = 0
          left = right + word_len
    return ans

```


最快的方法
```python
class Solution:
  def findSubstring(self, s: str, words: List[str]) -> List[int]:
    n = len(s)
    step = len(words[0])
    total_len = step * len(words)
    res = []
    for i in range(step):
      map_word_cnt = {}
      for word in words:
        if word not in map_word_cnt:
          map_word_cnt[word] = 1
        else:
          map_word_cnt[word] += 1
      match_cnt = len(words)
      right = i
      while right + step - 1 < n:
        left = right + step - total_len
        left_out = left - step
        if left_out >= 0:
          w_left_out = s[left_out:left_out+step]
          if w_left_out in map_word_cnt:
            map_word_cnt[w_left_out] += 1
            if map_word_cnt[w_left_out] > 0:
              match_cnt += 1
        w_right = s[right:right+step]
        if w_right in map_word_cnt:
          map_word_cnt[w_right] -= 1
          if map_word_cnt[w_right] >= 0:
            match_cnt -= 1
        if left >= 0 and match_cnt == 0:
          res.append(left)
        right += step
    return res

```
### [76. 最小覆盖子串 - 力扣（LeetCode）](https://leetcode.cn/problems/minimum-window-substring/)
滑动窗口 哈希表
> 如果min_len=len(s)会导致维护出错

使用哈希表还是不熟练
.items()忘了
 
还有一个注意点是切片，切片左闭右开 `[left , right + 1)` 老记错
`right-left+1` 是长度

滑动窗口从窗口为零开始，向右扩张，同时维护`window_counts` ，一边向右添加一边保持左边没有额外的字符
就这样遍历，复杂度O(N) 600ms 击败44.06%
```python
class Solution:
  def count(self, t: str) -> dict:
    t_count = {}
    for char in t:
      if char in t_count:
        t_count[char] += 1
      else:
        t_count[char] = 1
    return t_count

  def check(self, current_dict: dict, t_count: dict) -> bool:
    for char, required_count in t_count.items():
      if current_dict.get(char, 0) < required_count:
        return False
    return True

  def minWindow(self, s: str, t: str) -> str:
    t_count = self.count(t)
    window_counts = {}
    left = 0
    min_len = len(s) + 1
    result = ""

    for right in range(len(s)):
      char_in = s[right]
      window_counts[char_in] = window_counts.get(char_in, 0) + 1

      while self.check(window_counts, t_count):
        current_len = right - left + 1
        if current_len < min_len:
          min_len = current_len
          result = s[left : right + 1]

        char_out = s[left]
        window_counts[char_out] -= 1

        if window_counts[char_out] == 0:
          del window_counts[char_out]

        left += 1
    return result

```
这次想法里面的问题所在是这块
```python
def check(self, current_dict: dict, t_count: dict) -> bool:
  for char, required_count in t_count.items(): 
    if current_dict.get(char, 0) < required_count:
      return False
  return True
```
这个循环的次数取决于 t 中有多少个 不重复 的字符
但是如果字典有27个字符的时候就很明显不合理了
而且check了非常非常多次，也浪费了很多的时间
看看这个代码
```python
class Solution:
  def minWindow(self, s: str, t: str) -> str:
    need=defaultdict(int)
    for c in t:
      need[c]+=1
    needCnt=len(t)
    i=0
    res=(0,float('inf'))
    for j,c in enumerate(s):
      if need[c]>0:
        needCnt-=1
      need[c]-=1
      if needCnt==0:
        while True:
          c=s[i]
          if need[c]==0:
            break
          need[c]+=1
          i+=1
        if j-i<res[1]-res[0]:
          res=(i,j)
        need[s[i]]+=1
        needCnt+=1
        i+=1
    return ''if res[1]>len(s) else s[res[0]:res[1]+1]
```

在这边发现了defaultdict，这才知道leetcode已经import过了collections
那这块内容需要好好学一学,写到Python-algorithm去
## 矩阵
### [36. 有效的数独 - 力扣（LeetCode）](https://leetcode.cn/problems/valid-sudoku/)
这题只要判断是否合理，不需要解出来数独其实还好
一次遍历就行了
用set来创建集合
```python
class Solution:
  def isValidSudoku(self, board: List[List[str]]) -> bool:
    rows = [set() for _ in range(9)]
    cols = [set() for _ in range(9)]
    boxes = [set() for _ in range(9)]
        
    for i in range(0,9):
      for j in range(0,9):
        num = board[i][j]
        if num == '.':
          continue
        if num in rows[i]:
          return False
        rows[i].add(num)
        if num in cols[j]:
          return False
        cols[j].add(num)

        box_index = (i // 3) * 3 + (j // 3)
        if num in boxes[box_index]:
          return False
        boxes[box_index].add(num)
    return True
```

### [54. 螺旋矩阵 - 力扣（LeetCode）](https://leetcode.cn/problems/spiral-matrix/)

我的思路是用上下左右限制，有点复杂，维护起来也好累。。
```python
class Solution:
  def spiralOrder(self, matrix: List[List[int]]) -> List[int]:
    if not matrix or not matrix[0]:
      return []
    ans = []
    num_rows = len(matrix)
    num_cols = len(matrix[0])

    left, right = 0, num_cols - 1
    top, bottom = 0, num_rows - 1

    while left <= right and top <= bottom:
      for col in range(left, right + 1):
        ans.append(matrix[top][col])
      top += 1
      for row in range(top, bottom + 1):
        ans.append(matrix[row][right])
      right -= 1
      if not (left <= right and top <= bottom):
        break
      for col in range(right, left - 1, -1):
        ans.append(matrix[bottom][col])
      bottom -= 1
      for row in range(bottom, top - 1, -1):
        ans.append(matrix[row][left])
      left += 1
    return ans

```

但看官方第二种解法是这样的
对于每层，从左上方开始以顺时针的顺序遍历所有元素。假设当前层的左上角位于 (top,left)，右下角位于 (bottom,right)，按照如下顺序遍历当前层的元素。

从左到右遍历上侧元素，依次为 (top,left) 到 (top,right)。

从上到下遍历右侧元素，依次为 (top+1,right) 到 (bottom,right)。

如果 left<right 且 top<bottom，则从右到左遍历下侧元素，依次为 (bottom,right−1) 到 (bottom,left+1)，以及从下到上遍历左侧元素，依次为 (bottom,left) 到 (top+1,left)。

遍历完当前层的元素之后，将 left 和 top 分别增加 1，将 right 和 bottom 分别减少 1，进入下一层继续遍历，直到遍历完所有元素为止。

### [48. 旋转图像 - 力扣（LeetCode）](https://leetcode.cn/problems/rotate-image/)
想法很多都不好实现。
没写，但是看到了一个逆天答案
```python
class Solution:
  def rotate(self, matrix: List[List[int]]) -> None:
    matrix[:] = list(map(list, zip(*matrix)))
    for row in matrix: row.reverse()
```

### [73. 矩阵置零 - 力扣（LeetCode）](https://leetcode.cn/problems/set-matrix-zeroes/)
思路非常简单，找到0的位置，然后直接改，这题目凭什么是中档题？

```python
class Solution:
  def setZeroes(self, matrix: List[List[int]]) -> None:
    """
    Do not return anything, modify matrix in-place instead.
    """
    rows = len(matrix)
    cols = len(matrix[0])
    temp = []
    for i in range(rows):
      for j in range(cols):
        if matrix[i][j] == 0:
          temp.append([i, j])

    for r, c in temp:
      for j in range(cols):
        matrix[r][j] = 0
      for i in range(rows):
        matrix[i][c] = 0
```

但由于使用了temp存储，导致空间复杂度为O(M+N)

```python
class Solution:
  def setZeroes(self, matrix: List[List[int]]) -> None:
    m, n = len(matrix), len(matrix[0])
    flag_col0 = False
    
    for i in range(m):
      if matrix[i][0] == 0:
        flag_col0 = True
      for j in range(1, n):
        if matrix[i][j] == 0:
          matrix[i][0] = matrix[0][j] = 0
    
    for i in range(m - 1, -1, -1):
      for j in range(1, n):
        if matrix[i][0] == 0 or matrix[0][j] == 0:
          matrix[i][j] = 0
      if flag_col0:
        matrix[i][0] = 0
```
这个是leetcode官方给出的空间复杂度为O(1)的算法
如果` matrix[i][j]`是 0，它就把这个信息记录在 `matrix[i][0]`和 `matrix[0][j]` 上，将它们也设置为 0。 
这样一来，`matrix[i][0]`就成了第 i 行是否需要置零的标记位。
同理，`matrix[0][j]`就成了第 j 列是否需要置零的标记位。
很巧妙的直接使用原矩阵在不破坏的情况下标记并且置零，不额外开空间

### [289. 生命游戏 - 力扣（LeetCode）](https://leetcode.cn/problems/game-of-life/)
充满小巧思了
第一个小巧思是使用元组来传neighbor,然后python会自动解包，写起来好看
第二个小巧思是要判断当前状态：状态 1 和 2 都代表“原来是活的”，状态 0 和 3 都代表“原来是死的”
这样区分避免出现在修改过程中误判的情况，最后第二次遍历把状态再修正
和官方第二个题解差不多，但是官方只用到2
```python
class Solution:
  def gameOfLife(self, board: List[List[int]]) -> None:
    """
    Do not return anything, modify board in-place instead.
    """
    m, n = len(board), len(board[0])
    neighbors = [(1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (1, -1), (-1, 1), (-1, -1)]
    for i in range(m):
      for j in range(n):
        alive = 0
        for dx, dy in neighbors:
          r, c = i + dx, j + dy
          if 0 <= r < m and 0 <= c < n:
            if board[r][c] == 1 or board[r][c] == 2:
              alive += 1
        if board[i][j] == 1 and (alive < 2 or alive > 3):
          board[i][j] = 2 
        elif board[i][j] == 0 and alive == 3:
          board[i][j] = 3
    
    for i in range(m):
      for j in range(n):
        if board[i][j] == 2:
          board[i][j] = 0
        elif board[i][j] == 3:
          board[i][j] = 1
```
## 哈希表
### [383. 赎金信 - 力扣（LeetCode）](https://leetcode.cn/problems/ransom-note/)
用Counter自动计数
然后直接在本体上操作就行
```python
class Solution:
  def canConstruct(self, ransomNote: str, magazine: str) -> bool:
    if len(ransomNote) > len(magazine):
      return False
    magazine_counts = Counter(magazine)
    
    for char in ransomNote:
      if magazine_counts[char] > 0:
        magazine_counts[char] -= 1
      else:
        return False
        
    return True
```

这样写也可以
```python
class Solution:
  def canConstruct(self, ransomNote: str, magazine: str) -> bool:
    if len(ransomNote)>len(magazine) or len(set(magazine)) < len(set(ransomNote)):
      return False
    count = {}
    for i in magazine:
      count[i] = count.get(i,0)+1
    for i in ransomNote:
      if count.get(i, 0) == 0:
        return False
      count[i] -= 1
    return True
```
### [205. 同构字符串 - 力扣（LeetCode）](https://leetcode.cn/problems/isomorphic-strings/)


```python
class Solution:
  def isIsomorphic(self, s: str, t: str) -> bool:
    if len(s)!=len(t):
      return False
    s2tdict={}
    t2sdict={}
    for sstr,tstr in zip(s,t):
      if sstr in s2tdict and s2tdict[sstr]!=tstr:
        return False
      if tstr in t2sdict and t2sdict[tstr]!=sstr:
        return False
      s2tdict[sstr]=tstr
      t2sdict[tstr]=sstr
    return True
```

但是zip()用法太别致了吧
```python
class Solution:
  def isIsomorphic(self, s: str, t: str) -> bool:
    return len(set(s)) == len(set(t)) == len(set(zip(s, t)))
```

被吓哭了
也许应该复习一下set()和zip()
set(t)创建的是t中所有**不重复**字符的集合
zip(s, t) 会生成一系列的配对元组（tuple）： 
('p', 't'), ('a', 'i'), ('p', 't'), ('e', 'l'), ('r', 'e') 
这些配对就代表了 s 到 t 的映射关系。例如，第一个 'p' 映射到 't'，'a' 映射到 'i'，第二个 'p' 也映射到 't'。
因此映射和set()长度相同的情况下就可以得出结论

### [290. 单词规律 - 力扣（LeetCode）](https://leetcode.cn/problems/word-pattern/)
和上一题同一个道理
```python
class Solution:
  def wordPattern(self, pattern: str, s: str) -> bool:
    s2list=s.split(" ")
    p2list=list(pattern)
    return len(s2list)==len(p2list) and len(set(zip(s2list,p2list)))==len(set(s2list))==len(set(p2list))
```

思路：`s2list`和`p2list`
首先两个长度要相等
然后要保证set出来的长度也相同
eg:
"abba""wow mom mom wow"
set(list("abba"))={"a","b"}
set(list("wow mom mom wow".split(" ")))={"wow","mom"}
set(zip(s2list,p2list))={("a","wow"),("b","mom")}

### [242. 有效的字母异位词 - 力扣（LeetCode）](https://leetcode.cn/problems/valid-anagram/)

```python
class Solution:
  def isAnagram(self, s: str, t: str) -> bool:
    s2list=list(s)
    t2list=list(t)
    scounter=Counter(s2list)
    tcounter=Counter(t2list)
    if scounter==tcounter:
      return True
    return False
```
其实"str"可以直接到Counter里面去使用
直接`return Counter(t)==Counter(s)`就结束了
或者也可以使用sorted(),`return sorted(t)==sorted(s)`

### [49. 字母异位词分组 - 力扣（LeetCode）](https://leetcode.cn/problems/group-anagrams/)
```python
class Solution:
  def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
    anagram_map = defaultdict(list)
    for s in strs:
      sorted_s=str(sorted(s))
      anagram_map[sorted_s].append(s)
      
    return list(anagram_map.values())
```
复杂度是O(Nklogk)，有点高了
```python
class Solution:
  def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
    if len(strs) == 1:
      return [strs]
    ans= {}
    for ss in strs:
      s = str(sorted(ss))
      if s not in ans : 
        ans[s] = [ss]
      else :
        ans[s].append(ss)

    return list(ans.values())
```
这样一个道理
```python
class Solution:
  def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
    mp = collections.defaultdict(list)

    for str in strs:
      key=''.join(sorted(str))
      mp[key].append(str)

    return list(mp.values())
```

### [1. 两数之和 - 力扣（LeetCode）](https://leetcode.cn/problems/two-sum/)
哈希
```python
class Solution:
  def twoSum(self, nums: List[int], target: int) -> List[int]:
    num_map = {}
    for i, num in enumerate(nums):
      complement = target - num
      if complement in num_map:
        return [num_map[complement], i]
      num_map[num] = i
    return []Q
```

### [202. 快乐数 - 力扣（LeetCode）](https://leetcode.cn/problems/happy-number/)
第一版
371 / 420 个通过的测试用例
```python
class Solution:
  def isHappy(self, n: int) -> bool:
    while n/10>1:
      if n==1:
        return True
      sum=0
      n2str=str(n)
      for num in n2str:
        sum+=(int(num))**2
      n=sum
      if n==1:
        return True
    return False
```

while那边的判断条件写错了，看到测试用例7,在一开始就返回false了，但是迭代到最后是可以到1的

第二版
```python
class Solution:
  def isHappy(self, n: int) -> bool:
    seen = set()
    while n != 1 and n not in seen:
      seen.add(n)

      total_sum = 0
      n2str = str(n)
      for digit in n2str:
        total_sum += int(digit) ** 2

      n = total_sum

    return n==1
```
时间复杂度O(Log(N))，7ms在这个题目里算最慢的一档了
```python
class Solution:
  def isHappy(self, n: int) -> bool:
    result = []
    while n not in result:
      result.append(n)
      s = 0
      for i in str(n):
        s+=int(i)**2
      if s == 1:
        return True
      n = s
    return False
```
4ms
稍微快了一些

### [219. 存在重复元素 II - 力扣（LeetCode）](https://leetcode.cn/problems/contains-duplicate-ii/)
思路：用map存，时间复杂度O(N)，
```python
class Solution:
  def containsNearbyDuplicate(self, nums: List[int], k: int) -> bool:
    num_map={}
    for i, num in enumerate(nums):
      if num in num_map and i - num_map[num] <= k:
        return True
      num_map[num] = i
    return False
```
官方第二个滑动窗口
思路是维护k+1大小的set
```python
class Solution:
  def containsNearbyDuplicate(self, nums: List[int], k: int) -> bool:
    s = set()
    for i, num in enumerate(nums):
      if i > k:
        s.remove(nums[i - k - 1])
      if num in s:
        return True
      s.add(num)
    return False

```

### [128. 最长连续序列 - 力扣（LeetCode）](https://leetcode.cn/problems/longest-consecutive-sequence/)
思路：去重，然后迭代，哈希表
```python
class Solution:
  def longestConsecutive(self, nums: List[int]) -> int:
    num_set = set(nums)
    longest_streak = 0
    for num in num_set:
      if num - 1 not in num_set:
        current_num = num
        current_streak = 1
        while current_num + 1 in num_set:
          current_num += 1
          current_streak += 1
        longest_streak = max(longest_streak, current_streak)
    return longest_streak
```
## 数学
### [9. 回文数 - 力扣（LeetCode）](https://leetcode.cn/problems/palindrome-number/)
```go
func isPalindrome(x int) bool {
  if x < 0 || (x % 10 == 0 && x != 0){
    return false
  }
  revertedNum := 0
  for x > revertedNum {
    revertedNum = revertedNum * 10 + x % 10
    x /= 10
  }

  return x == revertedNum || x == revertedNum / 10
}
```

### [66. 加一 - 力扣（LeetCode）](https://leetcode.cn/problems/plus-one/)

```go
func plusOne(digits []int) []int {
  n := len(digits)
  for i := n - 1; i >= 0; i--{
    if digits[i] != 9{
      digits[i]++
      for j:= i+1; j <= n - 1;j++{
        digits[j] = 0
      }
      return digits
    }
  }

  digits = make([]int,n+1)
  digits[0] = 1
  return digits
}
```

### [172. 阶乘后的零 - 力扣（LeetCode）](https://leetcode.cn/problems/factorial-trailing-zeroes/)
```go
func trailingZeroes(n int) int {
  ans := 0
  for i := 5; i <= n; i += 5 {
    for x := i; x % 5 == 0; x /= 5 {
      ans++
    }
  }
  return ans 
}
```

### [69. x 的平方根 - 力扣（LeetCode）](https://leetcode.cn/problems/sqrtx/)
二分查找

```go
func mySqrt(x int) int {
  l, r := 0, x
  ans := -1
  for l <= r {
    mid := l + (r - l) / 2
    if mid * mid <= x {
      ans = mid
      l = mid + 1
    } else {
      r = mid -1
    }
  }
  return ans
}
```

### [50. Pow(x, n) - 力扣（LeetCode）](https://leetcode.cn/problems/powx-n/)

初版 TLE 代码

```go
func myPow(x float64, n int) float64 {
  var ans float64 = x 
  if n > 0 {
    for i := n - 1; i > 0; i-- {
      ans *= x
    }
  } else if n < 0 {
   for i := n; i <= 0; i++ {
    ans /= x
    }
  } else {
    ans = 1.0
  }
  return ans
}
```

AC

快速幂+递归

```go
func myPow(x float64, n int) float64 {
  if n >= 0 {
    return quickMul(x,n)
  }
  return 1.0 / quickMul(x, -n)
}

func quickMul(x float64, n int) float64 {
  if n == 0 {
    return 1
  }
  y := quickMul(x, n /2)
  if n % 2 == 0 {
    return y * y
  }
  return y * y * x
}
```

### [149. 直线上最多的点数 - 力扣（LeetCode）](https://leetcode.cn/problems/max-points-on-a-line)
真恶心，谁面试出这题目我就敢光速跑路

```go
func maxPoints(points [][]int) (ans int) {
  for i, p := range points { 
    x, y := p[0], p[1]
    cnt := map[float64]int{}
    for _, q := range points[i+1:] {
      dx, dy := q[0]-x, q[1]-y
      k := math.MaxFloat64
      if dx != 0 {
        k = float64(dy) / float64(dx)
      }
      cnt[k]++
      ans = max(ans, cnt[k])
    }
  }
  return ans + 1
}

```
## 区间
### [56. 合并区间 - 力扣（LeetCode）](https://leetcode.cn/problems/merge-intervals/)

```go
func merge(intervals [][]int) [][]int {
  if (len(intervals) == 1) {
    return intervals
  }
  sort.Slice(intervals, func(i, j int) bool {
    return intervals[i][0] < intervals[j][0]
  })
  res := make([][]int, 0)
  res = append(res, intervals[0])
  for i := 1; i < len(intervals); i++ {
    if (res[len(res)-1][1] >= intervals[i][0]) {
      res[len(res)-1][1] = max(res[len(res)-1][1], intervals[i][1])
    } else {
      res = append(res, intervals[i])
    }
  }
  return res
}
```

### [57. 插入区间 - 力扣（LeetCode）](https://leetcode.cn/problems/insert-interval/)

```go
func insert(intervals [][]int, newInterval []int) [][]int {
  res := make([][]int, 0)
  i := 0
  n := len(intervals)

  for i < n && newInterval[0] > intervals[i][1] {
    res = append(res, intervals[i])
    i++
  }

  for i < n && intervals[i][0] <= newInterval[1] {
    newInterval[0] = min(newInterval[0], intervals[i][0])
    newInterval[1] = max(newInterval[1], intervals[i][1])
    i++
  }
  res = append(res, newInterval)
  for i < n {
    res = append(res, intervals[i])
    i++
  }
  return res
}
```

### [452. 用最少数量的箭引爆气球 - 力扣（LeetCode）](https://leetcode.cn/problems/minimum-number-of-arrows-to-burst-balloons/)
贪心

```go
func findMinArrowShots(points [][]int) int {
  res := 1
  sort.Slice(points, func(i, j int) bool{
    return points[i][1] < points[j][1]
  })
  arr := points[0][1]
  for i := 1; i < len(points); i++ {
    if points[i][0] > arr {
      res += 1
      arr = points[i][1]
    }
  } 

  return res
}
```
## 栈
### [20. 有效的括号 - 力扣（LeetCode）](https://leetcode.cn/problems/valid-parentheses/)

栈入门

golang里面没用自带的栈

因此使用切片来模拟栈

就是当动态数组用了

```go
func isValid(s string) bool {
  n := len(s)
  if n % 2 == 1 {
    return false
  }

  pairs := map[byte] byte {
    ')': '(',
    ']': '[',
    '}': '{',
  }
  stack := []byte{}
  for i := 0; i < n; i++ {
    if pairs[s[i]] > 0 {
      if len(stack) == 0 || stack[len(stack)-1] != pairs[s[i]] {
        return false
      }
      stack = stack[:len(stack)-1]
    } else {
      stack = append(stack, s[i])
    }
  }
  return len(stack) == 0
}
```

### [71. 简化路径 - 力扣（LeetCode）](https://leetcode.cn/problems/simplify-path/)

栈继续尝试

```go
func simplifyPath(path string) string {
  parts := strings.Split(path, "/")

  stack := []string{}

  for _ , part := range parts {
    if part == "" || part == "." {
      continue
    }
    if part == ".." {
      if len(stack) > 0 {
        stack = stack[:len(stack)-1]
      } 
    } else {
      stack = append(stack, part)
    }
  }
  return "/" + strings.Join(stack, "/")
}
```

### [155. 最小栈 - 力扣（LeetCode）](https://leetcode.cn/problems/min-stack/)

```go
type MinStack struct {
  stack  []int
  minStack []int
}


func Constructor() MinStack {
  return MinStack {
    stack:  []int{},
    minStack: []int{},
  }
}


func (this *MinStack) Push(val int) {
  this.stack = append(this.stack, val)
  if len(this.minStack) == 0 {
    this.minStack = append(this.minStack, val)
  } else {
    curMin := this.minStack[len(this.minStack)-1]
    if val < curMin {
      this.minStack = append(this.minStack, val)
    } else {
      this.minStack = append(this.minStack, curMin)
    }
  }
}


func (this *MinStack) Pop() {
  this.stack = this.stack[:len(this.stack)-1]
  this.minStack = this.minStack[:len(this.minStack)-1]
}


func (this *MinStack) Top() int {
  return this.stack[len(this.stack)-1]
}


func (this *MinStack) GetMin() int {
  return this.minStack[len(this.stack)-1]
}


/**
 * Your MinStack object will be instantiated and called as such:
 * obj := Constructor();
 * obj.Push(val);
 * obj.Pop();
 * param_3 := obj.Top();
 * param_4 := obj.GetMin();
 */
```

### [150. 逆波兰表达式求值 - 力扣（LeetCode）](https://leetcode.cn/problems/evaluate-reverse-polish-notation/)

```go
func evalRPN(tokens []string) int {
  stack := []int{}

  for _ , token := range tokens {
    if token == "+" {
      b := stack[len(stack)-1]
      a := stack[len(stack)-2]
      stack = stack[:len(stack)-2]
      stack = append(stack, a + b)
    } else if token == "-" {
      b := stack[len(stack)-1]
      a := stack[len(stack)-2]
      stack = stack[:len(stack)-2]
      stack = append(stack, a - b)
    } else if token == "*" {
      b := stack[len(stack)-1]
      a := stack[len(stack)-2]
      stack = stack[:len(stack)-2]
      stack = append(stack, a * b)
    } else if token == "/" {
      b := stack[len(stack)-1]
      a := stack[len(stack)-2]
      stack = stack[:len(stack)-2]
      stack = append(stack, a / b)
    } else {
      num , _ := strconv.Atoi(token)
      stack = append(stack, num)
    }
  }
  return stack[0]
}
```

看了一下官方解法确实好很多，不看我都忘记switch了

```go
func evalRPN(tokens []string) int {
  stack := []int{}
  for _, token := range tokens {
    val, err := strconv.Atoi(token)
    if err == nil {
      stack = append(stack, val)
    } else {
      num1, num2 := stack[len(stack)-2], stack[len(stack)-1]
      stack = stack[:len(stack)-2]
      switch token {
      case "+":
        stack = append(stack, num1+num2)
      case "-":
        stack = append(stack, num1-num2)
      case "*":
        stack = append(stack, num1*num2)
      default:
        stack = append(stack, num1/num2)
      }
    }
  }
  return stack[0]
}
```

### [224. 基本计算器 - 力扣（LeetCode）](https://leetcode.cn/problems/basic-calculator/)
不想写栈了，好烦

这题没想出来，`hard` 还是你 `hard`

```go
func calculate(s string) int {
  stack := []int{}
  var ans int = 0
  var num int = 0
  var op int = 1

  stack = append(stack, op)

  for _, st := range s {
    if st == ' ' {
      continue
    }
    // 判断数字字符
    if st >= '0' && st <= '9' {
      // 类型转换：rune -> int
      num = num*10 + int(st-'0')
    } else {
      // 遇到运算符或括号，先把之前的数字结算到 ans
      ans += op * num
      num = 0
      if st == '+' {
        op = stack[len(stack)-1]
      } else if st == '-' {
        op = -stack[len(stack)-1]
      } else if st == '(' {
        // ( 号：将当前的 op 压入栈，作为括号内新的环境符号
        stack = append(stack, op)
      } else if st == ')' {
        // ) 号：出栈，回到上一层环境
        stack = stack[:len(stack)-1]
      }
    }
  }
  return ans + op*num
}
```
## 链表
### [141. 环形链表 - 力扣（LeetCode）](https://leetcode.cn/problems/linked-list-cycle/)
第一种，哈希表去存储路过的所有结点

```go
/**
 * Definition for singly-linked list.
 * type ListNode struct {
 *   Val int
 *   Next *ListNode
 * }
 */
func hasCycle(head *ListNode) bool {
  seen := map[*ListNode]struct{}{}
  for head != nil {
    if _, ok := seen[head]; ok {
      return true
    }
    seen[head] = struct{}{}
    head = head.Next
  }
  return false
}
```

但是这边用法好多，需要慢慢理解

-  `head *ListNode` 很明显就是`指针`

-  `map[*ListNode]struct{}{}`:
  -  `Go`内部没有`Set()`集合，要用`Map`映射来模拟集合
  -  `map[keyType]valueType` 所以这边`key`是`*ListNode`,`value`是`struct{}`这样一个空结构体,**0字节**
  -  弄好这样一个`map`之后要初始化
-  `nil` == `None`
-  map查找 (comma-ok idiom)
  -  `if _ , ok := map[fuck]; ok { }` 
-  `seen[head] = struct{}{}`
-  这边还是用`.`来选结构体内部内容

题目问有没有空间为O(1)的算法，这也就说明不能去用哈希表存了，理论上也在只能用指针那种，那当然就是了

**快慢指针**
「Floyd 判圈算法」

```go
func hasCycle(head *ListNode) bool {
  if head == nil || head.Next == nil {
    return false
  }
  slow := head
  fast := head

  for fast != nil && fast.Next != nil {
    slow = slow.Next
    fast = fast.Next.Next

    if slow == fast {
      return true
    }
  }
  return false
}
```

好吧官方题解给的更精简一点

```go
func hasCycle(head *ListNode) bool {
  if head == nil || head.Next == nil {
    return false
  }
  slow, fast := head, head.Next
  for fast != slow {
    if fast == nil || fast.Next == nil {
      return false
    }
    slow = slow.Next
    fast = fast.Next.Next
  }
  return true
}
```

然后起点有那么点不一样罢了，反正最后套圈就能套回来

### [2. 两数相加 - 力扣（LeetCode）](https://leetcode.cn/problems/add-two-numbers/)
*梦开始的地方到梦结束的地方一站式服务喵*

这是我们leetcode第二题

```go
func addTwoNumbers(l1 *ListNode, l2 *ListNode) *ListNode {
  var tail *ListNode
  head := tail
  carry := 0
  for l1 != nil || l2 != nil {
    n1, n2 := 0, 0
    if l1 != nil {
      n1 = l1.Val
      l1 = l1.Next
    }
    if l2 != nil {
      n2 = l2.Val
      l2 = l2.Next
    }
    sum := n1 + n2 + carry
    sum, carry = sum % 10, sum / 10
    if head == nil {
      head = &ListNode{Val: sum}
      tail = head
    } else {
      tail.Next = &ListNode{Val: sum}
      tail = tail.Next
    }
  }
  if carry > 0 {
    tail.Next = &ListNode{Val: carry}
  }
  return head
}
```

先来理思路吧，创建了一个新的链表`tail`,`head`是它的头结点

加法变成`carry*10+sum`，然后其实就结束了，不过我没用过这里的链表，这边这个链表的创建确实把我难住了

先创建头结点，头节点是`一个地址+Val`所以直接对`ListNode{Val: sum}`取地址存起来就行了

`tail.Next = &ListNode{Val: sum}`

**三件事，创建ListNode,ListNode的Val设成sum，tail.Next指向该地址**

Q：我有一个问题，如果`ListNode{Val: sum}`里面东西一样的时候，他们地址还一样吗？

A：不一样，它会在堆(heap)上再开一个空间

当然啦，还可以有更好的写法

**虚拟头节点**

```go
func addTwoNumbers(l1 *ListNode, l2 *ListNode) *ListNode {
  dummy := &ListNode{Val: 0}
  tail := dummy
  carry := 0

  for l1 != nil || l2 != nil || carry > 0 {
    n1, n2 := 0, 0

    if l1 != nil {
      n1 = l1.Val
      l1 = l1.Next
    }
    if l2 != nil {
      n2 = l2.Val
      l2 = l2.Next
    }
    sum := n1 + n2 + carry
    sum, carry = sum % 10, sum / 10

    newNode := &ListNode{Val: sum}
    tail.Next = newNode
    tail = tail.Next
  }
  return dummy.Next
}
```

可以看到我们把很多个判断条件省略了，不需要考虑太多可读性也很好zwz

但是还是想吐槽，链表写起来没用理解起来方便，太需要大脑和操作了
### [21. 合并两个有序链表 - 力扣（LeetCode）](https://leetcode.cn/problems/merge-two-sorted-lists/)
```go
/**
 * Definition for singly-linked list.
 * type ListNode struct {
 *   Val int
 *   Next *ListNode
 * }
 */
func mergeTwoLists(list1 *ListNode, list2 *ListNode) *ListNode {
  dummy := &ListNode{Val: 0}
  tail := dummy

  for list1 != nil || list2 != nil {
    n1, n2 := 101, 101
    if list1 == nil {
      n1 = 101
      n2 = list2.Val
    } else if list2 == nil {
      n1 = list1.Val
      n2 = 101
    } else if list1 != nil && list2 != nil {
      n1 = list1.Val
      n2 = list2.Val
    }
    if n1 <= n2 {
      tail.Next = list1
      tail = tail.Next
      list1 = list1.Next
    } else {
      tail.Next = list2
      tail = tail.Next
      list2 = list2.Next
    }
  }
  return dummy.Next
}
```

过了，但是可以做得更好，里面的101很明显是看数据给到100就这样用的，顺便优化一下写法和算法

不能忘记了链表的特色，一串直接用了

```go
func mergeTwoLists(list1 *ListNode, list2 *ListNode) *ListNode {
  dummy := &ListNode{Val: 0}
  tail := dummy

  for list1 != nil && list2 != nil {
    if list1.Val <= list2.Val {
      tail.Next = list1
      list1 = list1.Next
    } else {
      tail.Next = list2
      list2 = list2.Next
    }
    tail = tail.Next
  }

  if list1 != nil {
    tail.Next = list1 
  } else {
    tail.Next = list2
  }
  return dummy.Next
}
```

### [138. 随机链表的复制 - 力扣（LeetCode）](https://leetcode.cn/problems/copy-list-with-random-pointer/)
看哭了，但是其实意思就是**深拷贝**

那要怎么办呢，有random甚至会导致遍历的时候出现环的情况，所以完全不能这样

那怎么办呢，我抄你的码

抄都抄不明白

那就只能好好看看了

```go
/**
 * Definition for a Node.
 * type Node struct {
 *   Val int
 *   Next *Node
 *   Random *Node
 * }
 */
var cachedNode map[*Node]*Node

func deepCopy(node *Node) *Node {
  if node == nil {
    return nil
  }
  if n, ok := cachedNode[node]; ok {
    return n
  }
  newNode := &Node{Val: node.Val}
  cachedNode[node] = newNode
  newNode.Next = deepCopy(node.Next)
  newNode.Random = deepCopy(node.Random)
  return newNode
}

func copyRandomList(head *Node) *Node {
  cachedNode = map[*Node]*Node{}
  return deepCopy(head)
}
```

这是官方的第一种解法，官方说是**回溯 + 哈希表**

但不如说是**DFS 深度优先搜索+ 哈希表**

`var cachedNode map[*Node]*Node`全局变量

其实就是*map[原链表地址]新创建的对应链表的地址*



```go
func copyRandomList(head *Node) *Node {
  cachedNode = map[*Node]*Node{}
  return deepCopy(head)
}
```

初始化`cachedNode`，递归

```go
if node == nil {
  return nil
}
```

空就别复制了

```go
if n, ok := cachedNode[node]; ok {
  return n
}
```

创建过对应关系的两个节点就直接用，不能再创

```go
newNode := &Node{Val: node.Val}
cachedNode[node] = newNode
```

创建对应关系

当然还有别的方法

// ToDo
### [206. 反转链表 - 力扣（LeetCode）](https://leetcode.cn/problems/reverse-linked-list/)
你好

```go
/**
 * Definition for singly-linked list.
 * type ListNode struct {
 *   Val int
 *   Next *ListNode
 * }
 */
func reverseList(head *ListNode) *ListNode {
  if head == nil {
    return nil
  }
  if head.Next == nil {
    return head
  }
  next := head.Next
  var prev *ListNode = nil
  for next != nil {
    next = head.Next
    head.Next = prev
    prev = head
    head = next
  }
  return prev
}
```

写的有点好笑，`return head` return半天大脑没褶皱了,不过进步的地方是至少能写出来了:cry:

可以稍微优化一下，前面判断条件实际上可以在下面优化

```go
/**
 * Definition for singly-linked list.
 * type ListNode struct {
 *   Val int
 *   Next *ListNode
 * }
 */
func reverseList(head *ListNode) *ListNode {
	var prev *ListNode = nil
  curr := head // 去用curr来存当前的地方就不会因为head而乱七八糟的了
  
  for curr != nil { // curr没遍历完的时候
    next := curr.Next // 下一个目的地 ，如果curr.Next == nil的时候也考虑好了
    curr.Next = prev // 反向
    prev = curr    // 准备移动，所以同步往前一步prev和curr
    curr = next
  }
  return prev
}
```
### [92. 反转链表 II - 力扣（LeetCode）](https://leetcode.cn/problems/reverse-linked-list-ii/)
哈哈我不适合做链表，做玉玉了

```go
/**
 * Definition for singly-linked list.
 * type ListNode struct {
 *   Val int
 *   Next *ListNode
 * }
 */
func reverseBetween(head *ListNode, left int, right int) *ListNode {
  dummy := &ListNode{Val: 0, Next: head}
  preLeft := dummy

  for i := 0; i < left - 1; i++ {
    preLeft = preLeft.Next
  }
  curr := preLeft.Next
  leftPtr := curr 

  var prev *ListNode = nil
  for i := 0; i < right - left + 1; i++ {
    next := curr.Next
    curr.Next = prev
    prev = curr
    curr = next
  } 

  preLeft.Next = prev
  leftPtr.Next = curr
  return dummy.Next
}
```
### [25. K 个一组翻转链表 - 力扣（LeetCode）](https://leetcode.cn/problems/reverse-nodes-in-k-group/)
第一次ac代码

执行用时分布 3ms 击败1.36%

```go
/**
 * Definition for singly-linked list.
 * type ListNode struct {
 *   Val int
 *   Next *ListNode
 * }
 */

func reverseKGroup(head *ListNode, k int) *ListNode {
  dummy := &ListNode{Val: 0, Next: head}
  curr := head
  n := 0
  for curr != nil {
    n++
    curr = curr.Next
  }
  count := n / k

  pre := dummy
  curr = head
  for i := 0; i < count; i++ {
    groupTail := curr

    var prev *ListNode = nil 
    for j := 0; j < k ; j++ {
      next := curr.Next
      curr.Next = prev
      prev = curr 
      curr = next
    } 
    pre.Next = prev
    groupTail.Next = curr

    pre = groupTail
  }
  return dummy.Next
}
```


### 19. 删除链表的倒数第 N 个结点

https://leetcode.cn/problems/remove-nth-node-from-end-of-list/

唯一注意点 最后返回的不是`head`而是`dummy.Next` ,因为`head`节点有可能被删除，然后就导致出问题了

```go
func removeNthFromEnd(head *ListNode, n int) *ListNode {
  curr := head
  l := 1 
  for curr.Next != nil {
    l++
    curr = curr.Next
  }
  curr = head
  count := 0
  dummy := &ListNode{Val:0,Next:head}
  prev := dummy
  for count != l-n {
    prev = prev.Next
    curr = curr.Next
    count++
  }
  prev.Next = curr.Next
  return dummy.Next
}
```

### 82. 删除排序链表中的重复元素 II

https://leetcode.cn/problems/remove-duplicates-from-sorted-list-ii/

```go
func deleteDuplicates(head *ListNode) *ListNode {
  dummy := &ListNode{ Val: 0, Next: head}
  curr := dummy
  for curr.Next != nil && curr.Next.Next != nil {
    if curr.Next.Val == curr.Next.Next.Val {
      currSameVal := curr.Next.Val

      for curr.Next != nil && curr.Next.Val == currSameVal {
        curr.Next = curr.Next.Next
      } 
    } else {
      curr = curr.Next
    }
  }
  return dummy.Next
}
```



### 61. 旋转链表

https://leetcode.cn/problems/rotate-list/

把链表变成环形链表去做手术就行了

```go
func rotateRight(head *ListNode, k int) *ListNode {
  curr := head
  n := 1
  if head == nil {
    return head
  }
  for curr.Next != nil {
    curr = curr.Next
    n++
  }
  if n == 1 || k == 0 {
    return head
  }
  dummy := &ListNode{Val: 0, Next:head}
  req := k % n 
  curr.Next = head

  count := 0
  for count != n - req {
    curr = curr.Next
    count++
  }
  dummy.Next = curr.Next
  curr.Next = nil
  return dummy.Next
}
```

官方解法也是这样，但是看起来挺优雅的，放过来看看

```go
func rotateRight(head *ListNode, k int) *ListNode {
  if k == 0 || head == nil || head.Next == nil {
    return head
  }
  n := 1
  iter := head
  for iter.Next != nil {
    iter = iter.Next
    n++
  }
  add := n - k%n
  if add == n {
    return head
  }
  iter.Next = head
  for add > 0 {
    iter = iter.Next
    add--
  }
  ret := iter.Next
  iter.Next = nil
  return ret
}
```

哦其实就是不同的迭代方式，这种挺好理解的



### 86. 分隔链表

https://leetcode.cn/problems/partition-list/

踩到的坑：

-  如果`big.Next`不设置成`nil`，会导致内存过多，这啥原理
  -  哦，原来`big.Next`仍然指向原链表要往后走的位置，导致如果出现环了就开始转圈圈了
-  如果不写`bigDummy.Next`会把`bigDummy`自带的初始化的0加进去了

```go
func partition(head *ListNode, x int) *ListNode {
  smallDummy := &ListNode{}
  bigDummy := &ListNode{}

  small := smallDummy
  big := bigDummy

  curr := head

  for curr != nil {
    if curr.Val < x {
      small.Next = curr
      small = small.Next
    } else {
      big.Next = curr
      big = big.Next
    }
    curr = curr.Next
  }
  big.Next = nil
  small.Next = bigDummy.Next
  
  return smallDummy.Next
}
```

### 146. LRU 缓存

https://leetcode.cn/problems/lru-cache/

你确定这是中档题吗

好吧我们需要好好好好复盘一下了

用双向链表来存储前面使用过的，然后去处理就行了，思路其实还挺简单

就是代码要动点脑子

```go
type Node struct {
  key, Value int
  Prev, Next *Node
}

type LRUCache struct {
  capacity int
  cache   map[int]*Node
  head   *Node
  tail   *Node
}

func Constructor(capacity int) LRUCache {
  head := &Node{0,0,nil,nil}
  tail := &Node{0,0,nil,nil}

  head.Next = tail
  tail.Prev = head
  return LRUCache {
    capacity: capacity,
    cache:   make(map[int]*Node),
    head:   head,
    tail:   tail,
  }
}

func (this *LRUCache) Get(key int) int {
  if node, ok := this.cache[key]; ok {
    this.moveToHead(node)
    return node.Value
  } else {
    return -1
  }
}

func (this *LRUCache) Put(key int, value int) {
  if node, ok := this.cache[key] ; ok {
    node.Value = value
    this.moveToHead(node)
  } else {
    node := &Node{key,value,nil,nil}
    this.cache[key] = node
    this.addToHead(node)
    if len(this.cache) > this.capacity {
      removed := this.removeTail()
      delete(this.cache, removed.key)
    }
  }
}

func (this *LRUCache) addToHead(node *Node) {
  node.Next = this.head.Next
  node.Prev = this.head

  this.head.Next.Prev = node
  this.head.Next = node
  
}

func (this *LRUCache) removeNode(node *Node) {
  node.Prev.Next = node.Next 
  node.Next.Prev = node.Prev 
}

func (this *LRUCache) moveToHead(node *Node) {
  this.removeNode(node)
  this.addToHead(node)
}

func (this *LRUCache) removeTail() *Node {
  node := this.tail.Prev
  this.removeNode(node)
  return node
}
/**
 * Your LRUCache object will be instantiated and called as such:
 * obj := Constructor(capacity);
 * param_1 := obj.Get(key);
 * obj.Put(key,value);
 */
```



## 二叉树

### 144. 二叉树的前序遍历

https://leetcode.cn/problems/binary-tree-preorder-traversal/

学习数据结构中，前序就是 根左右 

```go
func preorderTraversal(root *TreeNode) []int {
  var res []int

  var dfs func(node *TreeNode)

  dfs = func(node *TreeNode) {
    if node == nil {
      return
    }

    res = append(res, node.Val) 
    dfs(node.Left)
    dfs(node.Right) 
  }

  dfs(root)
  
  return res
}
```

### 104. 二叉树的最大深度

https://leetcode.cn/problems/maximum-depth-of-binary-tree/

DFS 深度优先搜索

```go
func maxDepth(root *TreeNode) int {
  if root == nil {
    return 0
  }
  return max(maxDepth(root.Left),maxDepth(root.Right)) + 1
}
```

BFS 广度优先搜索

就是把要查个遍的用队列存存存，然后就完全遍历了

```go
func maxDepth(root *TreeNode) int {
  if root == nil {
    return 0
  }
  queue := []*TreeNode{}
  queue = append(queue, root)
  ans := 0
  for len(queue) > 0 {
    sz := len(queue)
    for sz > 0 {
      node := queue[0]
      queue = queue[1:]
      if node.Left != nil {
        queue = append(queue, node.Left)
      }
      if node.Right != nil {
        queue = append(queue, node.Right)
      }
      sz--
    }
    ans++
  }
  return ans
}
```

### 100. 相同的树

https://leetcode.cn/problems/same-tree/

左半边比比右半边比比

```go
func isSameTree(p *TreeNode, q *TreeNode) bool {
  if p == nil && q == nil {
    return true
  }
  if p == nil || q == nil {
    return false
  }
  if p.Val != q.Val {
    return false
  }
  return isSameTree(p.Left,q.Left) && isSameTree(p.Right,q.Right)
}
```

### 226. 翻转二叉树

https://leetcode.cn/problems/invert-binary-tree/

递归太好用了你知道吗

```go
func invertTree(root *TreeNode) *TreeNode {
  if root != nil{
    root.Left, root.Right = root.Right, root.Left
    invertTree(root.Left)
    invertTree(root.Right)
  }
  return root
}
```

### 101. 对称二叉树

https://leetcode.cn/problems/symmetric-tree/

一开始有点犯蠢了，看了一下题解就知道了，只需要传值的时候可以传两个节点就可以递归了

```go
func isSymmetric(root *TreeNode) bool {
  return check(root.Left, root.Right)
}

func check(p, q *TreeNode) bool {
  if p == nil && q == nil {
    return true
  }
  if p == nil || q == nil {
    return false
  }
  return p.Val == q.Val && check(p.Left, q.Right) && check(p.Right, q.Left)
}
```

迭代效果也是一样的，但是我还是喜欢写递归

```go
func isSymmetric(root *TreeNode) bool {
  u, v := root, root
  q := []*TreeNode{}
  q = append(q, u)
  q = append(q, v)
  for len(q) > 0 {
    u, v = q[0], q[1]
    q = q[2:]
    if u == nil && v == nil {
      continue
    }
    if u == nil || v == nil {
      return false
    }
    if u.Val != v.Val {
      return false
    }
    q = append(q, u.Left)
    q = append(q, v.Right)

    q = append(q, u.Right)
    q = append(q, v.Left)
  }
  return true
}
```

### 105. 从前序与中序遍历序列构造二叉树

https://leetcode.cn/problems/construct-binary-tree-from-preorder-and-inorder-traversal/

```go
func buildTree(preorder []int, inorder []int) *TreeNode {
  if len(preorder) == 0 {
    return nil
  }
  root := &TreeNode{preorder[0], nil, nil}
  i := 0
  for ; i < len(inorder); i++ {
    if inorder[i] == preorder[0] {
      break
    }
  }
  root.Left = buildTree(preorder[1:i+1], inorder[:i])
  root.Right = buildTree(preorder[i+1:], inorder[i+1:])
  return root
}
```

### 106. 从中序与后序遍历序列构造二叉树

https://leetcode.cn/problems/construct-binary-tree-from-inorder-and-postorder-traversal/

两题思路一样的，我不想看官方解法继续优化了，有时间再看吧

```go
func buildTree(inorder []int, postorder []int) *TreeNode {
  if len(inorder) == 0 {
    return nil
  }
  n := len(postorder)
  val := postorder[n-1]
  root := &TreeNode{Val:val}

  i := 0
  for ; i < len(inorder) ; i++ {
    if inorder[i] == val {
      break
    }
  }

  root.Left = buildTree(inorder[:i], postorder[:i])
  root.Right = buildTree(inorder[i+1:], postorder[i:n-1])
  return root
}
```

### 117. 填充每个节点的下一个右侧节点指针 II

https://leetcode.cn/problems/populating-next-right-pointers-in-each-node-ii/

一下就想到了BFS，时间空间都是O(n)

```go

func connect(root *Node) *Node {
  if root == nil {
    return nil
  }
  q := []*Node{root}
  for len(q) > 0 {
    tmp := q
    q = nil
    for i, node := range tmp {
      if i+1 < len(tmp) {
        node.Next = tmp[i+1]
      }
      if node.Left != nil {
        q = append(q, node.Left)
      }
      if node.Right != nil {
        q = append(q, node.Right)
      }
    }
  }
  return root
}
```

但很明显可以优化

官方给了第二种方法

把每层连上的都当做链表看，那很巧妙了，因为有了链表所以下一层的可以直接遍历

很明显因为二叉树的形状不知道必须遍历，这是更为巧妙的省略了队列

```go

func connect(root *Node) *Node {
	start := root
  for start != nil {
    var nextStart, last *Node
    handle := func(cur *Node) {
      if cur == nil {
        return
      }
      if nextStart == nil {
        nextStart = cur
      }
      if last != nil {
        last.Next = cur
      }
      last = cur
    }
    for p := start; p != nil; p = p.Next {
      handle(p.Left)
      handle(p.Right)
    }
    start = nextStart
  }
  return root
}
```

这边用了一个**辅助匿名函数**

`handle := func(cur *Node){ }`

当然DFS也可以做，先把头节点找到

```go
func connect(root *Node) *Node {
  pre := []*Node{}
  var dfs func(*Node, int)
  dfs = func(node *Node, depth int) {
    if node == nil {
      return
    }
    if depth == len(pre) { // node 是这一层最左边的节点
      pre = append(pre, node)
    } else { // pre[depth] 是 node 左边的节点
      pre[depth].Next = node // node 左边的节点指向 node
      pre[depth] = node
    }
    dfs(node.Left, depth+1)
    dfs(node.Right, depth+1)
  }
  dfs(root, 0) // 根节点的深度为 0
  return root
}

```



### 114. 二叉树展开为链表

https://leetcode.cn/problems/flatten-binary-tree-to-linked-list/

这边学到了一个go的语法糖

如果使用的是`list = append(list, preoderTraversal(root.Left))`

会显示`cannot use preorderTraversal(root.Left) (value of type []*precompiled.TreeNode) as *precompiled.TreeNode value in argument to append (solution.go)`



>  slice... 的作用就是**将切片“打散”成一个个独立的元素**传入函数

感觉切片迭代必备了



回到本题，本题用的思路是先序遍历然后直接去修节点，把左节点接到右边去

```go
func flatten(root *TreeNode) {
  list := preorderTraversal(root)
  for i := 1; i < len(list); i++ {
    prev, curr := list[i-1] ,list[i]
    prev.Left,prev.Right = nil, curr
  }
}

func preorderTraversal(root *TreeNode) []*TreeNode {
  list := []*TreeNode{}
  if root != nil {
    list = append(list, root)
    list = append(list, preorderTraversal(root.Left)...)
    list = append(list, preorderTraversal(root.Right)...)
  }
  return list
}
```

时间复杂度O(n) 空间O(n)

但是看到官方解法上有一个更好的 空间O(1)



用curr维护当前节点，有左节点就断左半边连接把右半边全扒拉过去

```go
func flatten(root *TreeNode) {
  curr := root
  for curr != nil {
    if curr.Left != nil {
      next := curr.Left
      predecessor := next
      for predecessor.Right != nil {
        predecessor = predecessor.Right
      }
      predecessor.Right = curr.Right
      curr.Left, curr.Right = nil, next
    }
    curr = curr.Right
  }
}
```



当时听聊天的时候还有这样一个题目

[LCR 155. 将二叉搜索树转化为排序的双向链表 - 力扣（LeetCode）](https://leetcode.cn/problems/er-cha-sou-suo-shu-yu-shuang-xiang-lian-biao-lcof/)

```python
"""
# Definition for a Node.
class Node:
  def __init__(self, val, left=None, right=None):
    self.val = val
    self.left = left
    self.right = right
"""
class Solution:
  def treeToDoublyList(self, root: 'Node') -> 'Node':
    if not root:
      return None
    self.head = None 
    self.pre = None

    def dfs(cur):
      if not cur:
        return
      dfs(cur.left)
      if self.pre:
        self.pre.right = cur
        cur.left = self.pre
      else:
        self.head = cur
      self.pre = cur
      dfs(cur.right)
    dfs(root)
    self.head.left = self.pre
    self.pre.right = self.head
    
    return self.head
```



### 112. 路径总和

https://leetcode.cn/problems/path-sum/

好玩，超级递归，递归的时候去修正`targetSum`就可以了

```go
func hasPathSum(root *TreeNode, targetSum int) bool {
  if root == nil {
    return false
  }
  if root.Left == nil && root.Right == nil {
    return root.Val == targetSum
  }
  return hasPathSum(root.Left, targetSum - root.Val) || 
      hasPathSum(root.Right, targetSum - root.Val)
}
```



### 129. 求根节点到叶节点数字之和

https://leetcode.cn/problems/sum-root-to-leaf-numbers/

憧憬成为递归少年

二叉树这块实在是太适合递归了，这题之所以要变成和，是因为适合递归吗

不知道欸

```go
func sumNumbers(root *TreeNode) int {
  return dfs(root,0)
}

func dfs(node *TreeNode, prev int) int {
  if node == nil {
    return 0
  }
  currSum := prev * 10 + node.Val
  if node.Left == nil && node.Right == nil {
    return currSum
  }
  return dfs(node.Left, currSum) + dfs(node.Right, currSum)
}
```

### 124. 二叉树中的最大路径和

https://leetcode.cn/problems/binary-tree-maximum-path-sum/

好巧妙的题

要判断的点其实就两个，一个是是否为最优选项是否换新的路径，一个是目前的两个方向是否要走

然后就递归去不同节点比较了

```go
func maxPathSum(root *TreeNode) int {
  maxSum := math.MinInt32

  var dfs func(node *TreeNode) int
  dfs = func(node *TreeNode) int {
    if node == nil {
      return 0
    }
    leftChange := max(dfs(node.Left),0)
    rightChange := max(dfs(node.Right),0)

    ifSwitchNewPath := node.Val + leftChange + rightChange
    if ifSwitchNewPath > maxSum {
      maxSum = ifSwitchNewPath
    }
    return node.Val + max(leftChange, rightChange)
  }
  dfs(root)
  return maxSum
}
```


### 173. 二叉搜索树迭代器
https://leetcode.cn/problems/binary-search-tree-iterator/

描述莫名其妙的

扁平化

```go
type BSTIterator struct {
  arr []int
}

func (it *BSTIterator) inorder(node *TreeNode) {
  if node == nil {
    return
  }
  it.inorder(node.Left)
  it.arr = append(it.arr, node.Val)
  it.inorder(node.Right)
}

func Constructor(root *TreeNode) BSTIterator {
  var it BSTIterator
  it.inorder(root)
  return it
}

func (this *BSTIterator) Next() int {
  val := this.arr[0]
  this.arr = this.arr[1:]
  return val
}


func (this *BSTIterator) HasNext() bool {
  return len(this.arr) > 0  
}


/**
 * Your BSTIterator object will be instantiated and called as such:
 * obj := Constructor(root);
 * param_1 := obj.Next();
 * param_2 := obj.HasNext();
 */
```

迭代
```go
type BSTIterator struct {
  stack []*TreeNode
  cur  *TreeNode
}

func Constructor(root *TreeNode) BSTIterator {
  return BSTIterator{cur: root}
}

func (this *BSTIterator) Next() int {
  for node := this.cur; node != nil; node = node.Left {
    this.stack = append(this.stack, node)
  }  
  this.cur, this.stack = this.stack[len(this.stack)-1],this.stack[:len(this.stack)-1]
  val := this.cur.Val
  this.cur = this.cur.Right
  return val
}

func (this *BSTIterator) HasNext() bool {
  return this.cur != nil || len(this.stack) > 0  
}


/**
 * Your BSTIterator object will be instantiated and called as such:
 * obj := Constructor(root);
 * param_1 := obj.Next();
 * param_2 := obj.HasNext();
 */
```

### 222. 完全二叉树的节点个数
https://leetcode.cn/problems/count-complete-tree-nodes/

简单在哪
```go
func countNodes(root *TreeNode) int {
  var l,r *TreeNode = root, root
  var lh,rh int
  for l != nil {
    l = l.Left
    lh++
  }
  for r != nil {
    r = r.Right
    rh++
  }
  if lh == rh {
    return int(math.Pow(2,float64(lh))) - 1
  }
  return 1 + countNodes(root.Left) + countNodes(root.Right);
}
```
可以参考[完全二叉树的节点数，你真的会算吗？-腾讯云开发者社区-腾讯云](https://cloud.tencent.com/developer/article/1880865)

### 236. 二叉树的最近公共祖先
https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-tree/

```go
func lowestCommonAncestor(root, p, q *TreeNode) *TreeNode {
  if root == nil || root == p || root == q {
    return root
  }
  left := lowestCommonAncestor(root.Left, p, q)
  right := lowestCommonAncestor(root.Right, p, q)
  if left != nil && right != nil {
    return root
  }
  if left == nil {
    return right
  }
  return left
}
```
你和我说递归为什么是神

### 199. 二叉树的右视图
https://leetcode.cn/problems/binary-tree-right-side-view/

dfs
```go
func rightSideView(root *TreeNode) []int {
  var dfs func(*TreeNode, int)
  var ans []int
  dfs = func(node *TreeNode, depth int) {
    if node == nil {
      return
    }
    if depth == len(ans) {
      ans = append(ans, node.Val)
    }
    dfs(node.Right, depth+1)
    dfs(node.Left, depth+1)
  }
  dfs(root, 0)
  return ans
}
```

也可以用bfs

### 637. 二叉树的层平均值
https://leetcode.cn/problems/average-of-levels-in-binary-tree/

dfs

```go
type data struct { sum, count int}

func averageOfLevels(root *TreeNode) []float64 {
  levelData := []data{}
  var dfs func(node *TreeNode, level int)  
  dfs = func(node *TreeNode, level int) {
    if node == nil {
      return
    }
    if level < len(levelData) {
      levelData[level].sum += node.Val
      levelData[level].count++
    } else {
      levelData = append(levelData, data{node.Val, 1})
    }
    dfs(node.Left, level+1)
    dfs(node.Right, level+1)
  }
  dfs(root, 0)

  averages := make([]float64, len(levelData))
  for index, data := range levelData {
    averages[index] = float64(data.sum) / float64(data.count)
  }
  return averages
}
```

也可以用bfs
```go
func averageOfLevels(root *TreeNode) []float64 {
  nextLevel := []*TreeNode{root}
  averages := []float64{}
  for len(nextLevel) > 0 {
    sum := 0
    curLevel := nextLevel
    nextLevel = nil
    for _, node := range curLevel {
      sum += node.Val
      if node.Left != nil {
        nextLevel = append(nextLevel, node.Left)
      }
      if node.Right != nil {
        nextLevel = append(nextLevel, node.Right)
      }
    }
    averages = append(averages, float64(sum)/float64(len(curLevel)))
  }
  return averages
}
```

### 102. 二叉树的层序遍历
https://leetcode.cn/problems/binary-tree-level-order-traversal/

dfs
```go
func levelOrder(root *TreeNode) [][]int {
  ans := [][]int{}
  var dfs func(node *TreeNode, level int)
  dfs = func(node *TreeNode, level int) {
    if node == nil {
      return
    }
    if level == len(ans) {
      ans = append(ans, []int{})
    }
    ans[level] = append(ans[level], node.Val)
    dfs(node.Left, level+1)
    dfs(node.Right, level+1)
  }
  dfs(root, 0)
  return ans
}
```

当然也可以用bfs
```go
func levelOrder(root *TreeNode) [][]int {
  ans := [][]int{}
  if root == nil {
    return ans
  }
  q := []*TreeNode{root}
  for i := 0; len(q) > 0; i++ {
    ans = append(ans, []int{})
    p := []*TreeNode{}
    for j := 0; j < len(q); j++ {
      node := q[j]
      ans[i] = append(ans[i], node.Val)
      if node.Left != nil {
        p = append(p, node.Left)
      }
      if node.Right != nil {
        p = append(p, node.Right)
      }
    }  
    q = p  
  }
  return ans
}
```

### 103. 二叉树的锯齿形层序遍历
https://leetcode.cn/problems/binary-tree-zigzag-level-order-traversal/

bfs
```go
func zigzagLevelOrder(root *TreeNode) [][]int {
  ans := [][]int{}
  if root == nil {
    return ans
  }
  q := []*TreeNode{root}
  for i := 0; len(q) > 0; i++ {
    cur := []int{}
    p := []*TreeNode{}
    for j := 0; j < len(q); j++ {
      node := q[j]
      cur = append(cur, node.Val)
      if node.Left != nil {
        p = append(p, node.Left)
      }
      if node.Right != nil {
        p = append(p, node.Right)
      }
    }
    ans = append(ans, []int{})
    if i % 2 == 0 {
      ans[i] = cur
    } else {
      ans[i] = reverse(cur)
    }
    q = p
  }
  return ans
}

func reverse(n []int) []int {
  for i, j := 0, len(n)-1; i < j; i, j = i+1, j-1 {
    n[i], n[j] = n[j], n[i]
  }
  return n
}
```

### 530. 二叉搜索树的最小绝对差
https://leetcode.cn/problems/minimum-absolute-difference-in-bst/

dfs
```go
func getMinimumDifference(root *TreeNode) int {
  var dfs func(node *TreeNode)
  var prev *TreeNode
  ans := 1145141919810
  dfs = func(node *TreeNode) {
    if node == nil {
      return
    }
    dfs(node.Left)
    if prev != nil {
      diff := node.Val - prev.Val 
      if diff < ans {
        ans = diff
      }
    }
    prev = node
    dfs(node.Right)
  }
  dfs(root)
  return ans
}

func abs(n int) int {
  if n < 0 {
    n = 0 - n
  }
  return n
}
```

### 230. 二叉搜索树中第 K 小的元素
https://leetcode.cn/problems/kth-smallest-element-in-a-bst/
```go
func kthSmallest(root *TreeNode, k int) int {
  stack := []*TreeNode{}
  for {
    for root != nil {
      stack = append(stack, root)
      root = root.Left
    }
    stack, root = stack[:len(stack)-1], stack[len(stack)-1]
    k--
    if k == 0 {
      return root.Val
    }
    root = root.Right
  }
}
```

### 98. 验证二叉搜索树
https://leetcode.cn/problems/validate-binary-search-tree/

递归
```go
func isValidBST(root *TreeNode) bool {
  return helper(root, math.MinInt64, math.MaxInt64)
}

func helper(root *TreeNode, lower, upper int) bool {
  if root == nil {
    return true
  }
  if root.Val <= lower || root.Val >= upper {
    return false
  }
  return helper(root.Left, lower, root.Val) && helper(root.Right, root.Val, upper)
}
```

中序遍历
```go
func isValidBST(root *TreeNode) bool {
  stack := []*TreeNode{}
  inorder := math.MinInt64
  for len(stack) > 0 || root != nil {
    for root != nil {
      stack = append(stack, root)
      root = root.Left
    }
    root = stack[len(stack)-1]
    stack = stack[:len(stack)-1]
    if root.Val <= inorder {
      return false
    }
    inorder = root.Val
    root = root.Right  
  }
  return true
}
```

## 图
### 200. 岛屿数量
https://leetcode.cn/problems/number-of-islands/

dfs
```go
func numIslands(grid [][]byte) int {
  if len(grid) == 0 {
    return 0
  }

  m, n := len(grid), len(grid[0])
  numIslands := 0

  var dfs func(r, c int)
  dfs = func(r, c int) {
    if r < 0 || c < 0 || r >= m || c >= n || grid[r][c] == '0' {
      return
    }

    grid[r][c] = '0'

    dfs(r-1, c)
    dfs(r+1, c)
    dfs(r, c-1)
    dfs(r, c+1)
  }

  for r := 0; r < m; r++ {
    for c := 0; c < n; c++ {
      if grid[r][c] == '1' {
        numIslands++
        dfs(r, c)
      }
    }
  }

  return numIslands
}
```

bfs
```go
func numIslands(grid [][]byte) int {
  if len(grid) == 0 {
    return 0
  }

  m, n := len(grid), len(grid[0])
  numIslands := 0
  dirs := [][2]int{{-1, 0}, {1, 0}, {0, -1}, {0, 1}}

  for r := 0; r < m; r++ {
    for c := 0; c < n; c++ {
      if grid[r][c] == '1' {
        numIslands++
        grid[r][c] = '0'
        queue := [][2]int{{r, c}}
        for len(queue) > 0 {
          curr := queue[0]
          queue = queue[1:]
          currR, currC := curr[0], curr[1]

          for _, d := range dirs {
            nextR, nextC := currR + d[0], currC + d[1]
            if nextR >= 0 && nextR < m && 
              nextC >= 0 && nextC < n && 
              grid[nextR][nextC] == '1' {
              grid[nextR][nextC] = '0'
              queue = append(queue, [2]int{nextR, nextC})
            }
          }
        }
      }
    }
  }
  return numIslands
}
```
不阴吗

### 130. 被围绕的区域
https://leetcode.cn/problems/surrounded-regions/
从四个边界遍历，能访问到的全标记为'A', 同时向内扩展标记，最后一次循环处理所有被标记上的位置
dfs
```go
func solve(board [][]byte) {
  m, n := len(board), len(board[0])
  
  var dfs func(r, c int)
  dfs = func(r, c int) {
    if r < 0 || r >= m || c < 0 || c >= n {
      return
    } 
    if board[r][c] != 'O' {
      return
    }
    board[r][c] = 'A'
    dfs(r+1, c)
    dfs(r-1, c)
    dfs(r, c+1)
    dfs(r, c-1)
  }
  for i := 0; i < m; i++ {
    dfs(i,0)
    dfs(i,n-1)
  } 
  for j := 1; j < n-1; j++ {
    dfs(0,j)
    dfs(m-1,j)
  }
  for x := 0; x < m; x++ {
    for y := 0; y < n; y++ {
      if board[x][y] == 'A' {
        board[x][y] = 'O'
      } else if board[x][y] == 'O' {
        board[x][y] = 'X'
      }
    }
  }
}
```
然后中间又忘了一个点。golang range 不能同时处理两个变量，只能套循环了

还可以用bfs来实现
```go
var (
  dx = [4]int{1, -1, 0, 0}
  dy = [4]int{0, 0, 1, -1}
)

func solve(board [][]byte) {
  if len(board) == 0 || len(board[0]) == 0 {
    return
  }
  m, n := len(board), len(board[0])
  queue := [][]int{}
  for i :=0; i < m; i++ {
    if board[i][0] == 'O' {
      queue = append(queue, []int{i, 0})
      board[i][0] = 'A'
    }
    if board[i][n-1] == 'O' {
      queue = append(queue, []int{i, n-1})
      board[i][n-1] = 'A'
    }
  }
  for j := 1; j < n-1; j++ {
    if board[0][j] == 'O' {
      queue = append(queue, []int{0, j})
      board[0][j] = 'A'
    }
    if board[m-1][j] == 'O' {
      queue = append(queue, []int{m-1, j})
      board[m-1][j] = 'A'
    }
  } 
  for len(queue) > 0 {
    cell := queue[0]
    queue = queue[1:]
    x, y := cell[0], cell[1]
    for i := 0; i < 4; i++ {
      mx, my := x + dx[i], y + dy[i]
      if mx < 0 || my < 0 || mx >= m || my >= n || board[mx][my] != 'O' {
        continue
      }
      queue = append(queue, []int{mx, my})
      board[mx][my] = 'A'
    }
  }
  for i := 0; i < m; i++ {
    for j := 0; j < n; j++ {
      if board[i][j] == 'A' {
        board[i][j] = 'O'
      } else if board[i][j] == 'O' {
        board[i][j] = 'X'
      }
    }
  }
}
```

