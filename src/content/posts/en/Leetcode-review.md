---
title: LeetCode Review
published: 2026-03-02T15:45:00
tags:
  - algorithm
  - golang
  - python
lang: en
translationKey: leetcode-review
---

The problem list is LeetCode's classic 150.

## Arrays / Strings

### 68. Text Justification

[68. Text Justification - LeetCode](https://leetcode.cn/problems/text-justification/description/)

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
    # Last line
    line = ' '.join(word_list)
    spaces = maxWidth - len(line)
    line += ' ' * spaces
    ans.append(line)
    
    return ans
```

I started by handling overflow, but also needed to store the words that fit before combining them into a line.

The idea is to read and build one line at a time. One sticking point was here:

```python
for i in range(gaps):
  line += word_list[i]
  line += average* ' '
  if i<left:
    line +=' '
```

I spent a long time thinking about `i<left`.

left is the remainder, and i indexes the gaps between words, starting at 0. The goal is to distribute the remainder into the earlier gaps.

Suppose there are 3 extra spaces to distribute across four gaps: the i values to fill are 0, 1, 2, and left=3.

With 5 extra spaces and seven gaps, the i values to fill are 0, 1, 2, 3, 4, and left=5.

So i<left clearly gives the right boundary.

Then just build the line.

### [392. Is Subsequence](https://leetcode.cn/problems/is-subsequence/)

```python
class Solution:
  def isSubsequence(self, s: str, t: str) -> bool:
    it = iter(t)
    return all(c in it for c in s)
```

The power of iterators: check membership along the way.
Use `all( )` as well.

### [1312. Minimum Insertion Steps to Make a String Palindrome](https://leetcode.cn/problems/minimum-insertion-steps-to-make-a-string-palindrome/)

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

This uses another simple problem, `lcs`. My first encounter with `dp`.

#### How to Find the LCS

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
n = `"adcaab"`
lcs = `"aca"`

**Case 1: the last characters of the two strings are equal**
If `text1[i-1] == text2[j-1]`:

- We have found a common character! It **can always** be part of their common subsequence.
- The LCS of the first i characters of text1 and the first j characters of text2 is therefore the LCS length **after removing the last character from each**, **plus 1**.
- In the dp array: `dp[i][j] = dp[i-1][j-1] + 1`.

**Example:** Find the LCS of "ab**c**" and "ad**c**". Since their last character 'c' matches, the problem becomes finding the LCS length of "ab" and "ad", then adding 1.

**Case 2: the last characters of the two strings differ**
If `text1[i-1] != text2[j-1]`:

- These two different characters **cannot both** be at the end of the LCS.
- Take the larger of two possibilities:
  1. The LCS length of the first i characters of text1 and the first j-1 characters of text2 (discard the last character of text2 and see what remains). This is `dp[i][j-1]`.
  2. The LCS length of the first i-1 characters of text1 and the first j characters of text2 (discard the last character of text1 and see what remains). This is `dp[i-1][j]`.
- Take the maximum of the two, since it represents the longer common subsequence.
- In the dp array: `dp[i][j] = max(dp[i-1][j], dp[i][j-1])`.

Go read the solution for this one. I'm still a bit lost myself.

### [3354. Make Array Elements Equal to Zero - LeetCode](https://leetcode.cn/problems/make-array-elements-equal-to-zero/)

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

The idea is very simple: there is no need to think of the process dynamically at all.

## Two Pointers

### [167. Two Sum II - Input Array Is Sorted - LeetCode](https://leetcode.cn/problems/two-sum-ii-input-array-is-sorted/)

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

This was my first accepted solution: runtime 5813 ms, beating 5.20%.
Yes, the illustrious O(n^2). Time for some serious optimization.

Use `two pointers` here for a fast search and avoid repeated traversals.

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

This method has O(n) time complexity: runtime 4 ms, beating 50.86%.
~~Weird. How do others get 0 ms with the same algorithm? Is it because I haven't paid?~~

### [11. Container With Most Water - LeetCode](https://leetcode.cn/problems/container-with-most-water/)

Greedy with two pointers, accepted on the first try.

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

### [15. 3Sum - LeetCode](https://leetcode.cn/problems/3sum/)

This was the first pile of garbage. It ended in TLE.

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

An illustrious O(n^3) algorithm. Brute force hit the time limit, and memory usage was through the roof too, so I thought of using three pointers.

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

## Sliding Window

### [209. Minimum Size Subarray Sum - LeetCode](https://leetcode.cn/problems/minimum-size-subarray-sum/)

My first attempt at a sliding window. It doesn't seem too hard; it's quite similar to two pointers.

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

### [3. Longest Substring Without Repeating Characters - LeetCode](https://leetcode.cn/problems/longest-substring-without-repeating-characters/)

Sliding window + hashmap

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

This is the same as [LCR 167. Longest Substring Without Repeating Characters - LeetCode](https://leetcode.cn/problems/zui-chang-bu-han-zhong-fu-zi-fu-de-zi-zi-fu-chuan-lcof/), so I passed both together.

### [30. Substring with Concatenation of All Words - LeetCode](https://leetcode.cn/problems/substring-with-concatenation-of-all-words/)

The initial idea wasn't great: a mysterious O(n!xn) algorithm.

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

124 / 182 test cases passed
Submitted on 2025.10.30 21:35
`s ="fffffffffffffffffffffffffffffffff"`
`words =["a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a"]`
Clearly, generating the substrings takes too long and causes TLE.
So change the approach: map the words into key-value pairs.

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

[30. Substring with Concatenation of All Words - LeetCode](https://leetcode.cn/problems/substring-with-concatenation-of-all-words/submissions/674785574)
What a nasty test case.
181 / 182 test cases passed

Accepted code

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

The fastest approach

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

### [76. Minimum Window Substring - LeetCode](https://leetcode.cn/problems/minimum-window-substring/)

Sliding window + hash table
> Setting min_len=len(s) causes incorrect updates.

I'm still not fluent with hash tables.
I forgot .items().

Another thing to watch is slicing: inclusive on the left, exclusive on the right, `[left , right + 1)`. I keep getting it wrong.
`right-left+1` is the length.

Start with an empty sliding window and expand right while maintaining `window_counts`. Add characters on the right while keeping the left free of surplus characters.
Traverse this way for O(N) complexity: 600 ms, beating 44.06%.

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

The problem with this attempt is here:

```python
def check(self, current_dict: dict, t_count: dict) -> bool:
  for char, required_count in t_count.items(): 
    if current_dict.get(char, 0) < required_count:
      return False
  return True
```

The number of loop iterations depends on how many distinct characters t contains.
But once the dictionary has 27 characters, this is clearly unreasonable.
And it performs the check far too many times, wasting a lot of time.
Look at this code:

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

This is where I discovered defaultdict, and learned that LeetCode had already imported collections.
I need to study this properly and add it to Python-algorithm.

## Matrices

### [36. Valid Sudoku - LeetCode](https://leetcode.cn/problems/valid-sudoku/)

This only asks whether the board is valid, not to solve the Sudoku, so it's manageable.
A single traversal is enough.
Use set to create sets.

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

### [54. Spiral Matrix - LeetCode](https://leetcode.cn/problems/spiral-matrix/)

My idea was to track the top, bottom, left, and right boundaries. It's a bit complicated and tiring to maintain...

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

But the second official solution goes like this:
For each layer, visit every element clockwise from the upper-left corner. Suppose the current layer's upper-left corner is (top,left) and its lower-right corner is (bottom,right). Traverse its elements in this order.

Visit the top edge from left to right, from (top,left) to (top,right).

Visit the right edge from top to bottom, from (top+1,right) to (bottom,right).

If left<right and top<bottom, visit the bottom edge from right to left, from (bottom,right−1) to (bottom,left+1), then the left edge from bottom to top, from (bottom,left) to (top+1,left).

After visiting the current layer, increment left and top by 1, decrement right and bottom by 1, and continue with the next layer until every element has been visited.

### [48. Rotate Image - LeetCode](https://leetcode.cn/problems/rotate-image/)

I had plenty of ideas, but they were awkward to implement.
I didn't write a solution, but I did find this ridiculous answer:

```python
class Solution:
  def rotate(self, matrix: List[List[int]]) -> None:
    matrix[:] = list(map(list, zip(*matrix)))
    for row in matrix: row.reverse()
```

### [73. Set Matrix Zeroes - LeetCode](https://leetcode.cn/problems/set-matrix-zeroes/)

The idea is simple: find the zeroes and modify the matrix directly. How is this a medium problem?

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

But storing temp makes the space complexity O(M+N).

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

This is LeetCode's official O(1)-space algorithm.
If `matrix[i][j]` is 0, record that information in `matrix[i][0]` and `matrix[0][j]` by setting them to 0 as well.
Then `matrix[i][0]` becomes the flag indicating whether row i needs to be zeroed.
Likewise, `matrix[0][j]` becomes the flag indicating whether column j needs to be zeroed.
A clever way to use the original matrix for marking and zeroing without corrupting it or allocating extra space.

### [289. Game of Life - LeetCode](https://leetcode.cn/problems/game-of-life/)

Full of little clever touches.
The first is to pass neighbor as a tuple and let Python unpack it automatically. It reads nicely.
The second is how to determine the current state: states 1 and 2 both mean "originally alive", while states 0 and 3 both mean "originally dead".
This distinction prevents misclassification during updates. A second traversal restores the final states.
It's similar to the second official solution, but the official version only goes up to 2.

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

## Hash Tables

### [383. Ransom Note - LeetCode](https://leetcode.cn/problems/ransom-note/)

Use Counter to count automatically.
Then operate directly on the object.

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

This works too:

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

### [205. Isomorphic Strings - LeetCode](https://leetcode.cn/problems/isomorphic-strings/)

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

But this use of zip() is something else.

```python
class Solution:
  def isIsomorphic(self, s: str, t: str) -> bool:
    return len(set(s)) == len(set(t)) == len(set(zip(s, t)))
```

That scared me to tears.
Maybe I should review set() and zip().
set(t) creates the set of all **distinct** characters in t.
zip(s, t) generates a series of paired tuples:
('p', 't'), ('a', 'i'), ('p', 't'), ('e', 'l'), ('r', 'e')
These pairs represent the mapping from s to t. For example, the first 'p' maps to 't', 'a' maps to 'i', and the second 'p' maps to 't' too.
So comparing the size of the mapping with the lengths from set() gives the answer.

### [290. Word Pattern - LeetCode](https://leetcode.cn/problems/word-pattern/)

The same idea as the previous problem.

```python
class Solution:
  def wordPattern(self, pattern: str, s: str) -> bool:
    s2list=s.split(" ")
    p2list=list(pattern)
    return len(s2list)==len(p2list) and len(set(zip(s2list,p2list)))==len(set(s2list))==len(set(p2list))
```

The idea: `s2list` and `p2list`.
First, their lengths must match.
Then make sure the lengths after applying set also match.
eg:
"abba""wow mom mom wow"
set(list("abba"))={"a","b"}
set(list("wow mom mom wow".split(" ")))={"wow","mom"}
set(zip(s2list,p2list))={("a","wow"),("b","mom")}

### [242. Valid Anagram - LeetCode](https://leetcode.cn/problems/valid-anagram/)

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

Actually, a "str" can go straight into Counter.
Just `return Counter(t)==Counter(s)` and you're done.
Or use sorted(): `return sorted(t)==sorted(s)`.

### [49. Group Anagrams - LeetCode](https://leetcode.cn/problems/group-anagrams/)

```python
class Solution:
  def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
    anagram_map = defaultdict(list)
    for s in strs:
      sorted_s=str(sorted(s))
      anagram_map[sorted_s].append(s)
      
    return list(anagram_map.values())
```

The complexity is O(Nklogk), which is a bit high.

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

Same idea here.

```python
class Solution:
  def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
    mp = collections.defaultdict(list)

    for str in strs:
      key=''.join(sorted(str))
      mp[key].append(str)

    return list(mp.values())
```

### [1. Two Sum - LeetCode](https://leetcode.cn/problems/two-sum/)

Hashing

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

### [202. Happy Number - LeetCode](https://leetcode.cn/problems/happy-number/)

First version
371 / 420 test cases passed

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

The while condition was wrong. For test case 7, it returned false immediately, even though repeated iteration can eventually reach 1.

Second version

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

O(Log(N)) time complexity. At 7 ms, it's among the slowest solutions for this problem.

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
A little faster.

### [219. Contains Duplicate II - LeetCode](https://leetcode.cn/problems/contains-duplicate-ii/)

The idea: store values in a map, for O(N) time complexity.

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

The second official solution uses a sliding window.
Maintain a set of size k+1.

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

### [128. Longest Consecutive Sequence - LeetCode](https://leetcode.cn/problems/longest-consecutive-sequence/)

The idea: deduplicate, then iterate, using a hash table.

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

## Math

### [9. Palindrome Number - LeetCode](https://leetcode.cn/problems/palindrome-number/)

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

### [66. Plus One - LeetCode](https://leetcode.cn/problems/plus-one/)

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

### [172. Factorial Trailing Zeroes - LeetCode](https://leetcode.cn/problems/factorial-trailing-zeroes/)

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

### [69. Sqrt(x) - LeetCode](https://leetcode.cn/problems/sqrtx/)

Binary search

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

### [50. Pow(x, n) - LeetCode](https://leetcode.cn/problems/powx-n/)

First version: TLE

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

Fast exponentiation + recursion

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

### [149. Max Points on a Line - LeetCode](https://leetcode.cn/problems/max-points-on-a-line)

Awful. If someone asks me this in an interview, I'm leaving at the speed of light.

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

## Intervals

### [56. Merge Intervals - LeetCode](https://leetcode.cn/problems/merge-intervals/)

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

### [57. Insert Interval - LeetCode](https://leetcode.cn/problems/insert-interval/)

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

### [452. Minimum Number of Arrows to Burst Balloons - LeetCode](https://leetcode.cn/problems/minimum-number-of-arrows-to-burst-balloons/)

Greedy

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

## Stacks

### [20. Valid Parentheses - LeetCode](https://leetcode.cn/problems/valid-parentheses/)

An introduction to stacks

Go has no built-in stack.

So use a slice to simulate one.

Just treat it as a dynamic array.

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

### [71. Simplify Path - LeetCode](https://leetcode.cn/problems/simplify-path/)

Another attempt with stacks

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

### [155. Min Stack - LeetCode](https://leetcode.cn/problems/min-stack/)

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

### [150. Evaluate Reverse Polish Notation - LeetCode](https://leetcode.cn/problems/evaluate-reverse-polish-notation/)

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

The official solution really is much better. I would have forgotten switch entirely if I hadn't looked.

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

### [224. Basic Calculator - LeetCode](https://leetcode.cn/problems/basic-calculator/)

I don't want to write another stack. So annoying.

I couldn't figure this one out. `hard` really does mean `hard`.

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
    // Check for a digit
    if st >= '0' && st <= '9' {
      // Type conversion: rune -> int
      num = num*10 + int(st-'0')
    } else {
      // On an operator or parenthesis, first accumulate the previous number into ans
      ans += op * num
      num = 0
      if st == '+' {
        op = stack[len(stack)-1]
      } else if st == '-' {
        op = -stack[len(stack)-1]
      } else if st == '(' {
        // (: push the current op as the new sign context inside the parentheses
        stack = append(stack, op)
      } else if st == ')' {
        // ): pop the stack and return to the previous sign context
        stack = stack[:len(stack)-1]
      }
    }
  }
  return ans + op*num
}
```

## Linked Lists

### [141. Linked List Cycle - LeetCode](https://leetcode.cn/problems/linked-list-cycle/)

First approach: store every visited node in a hash table.

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

There are a lot of language details here that I need to work through slowly.

- `head *ListNode` is clearly a `pointer`.

- `map[*ListNode]struct{}{}`:
  - `Go` has no built-in `Set()`; use a `Map` to simulate a set.
  - In `map[keyType]valueType`, the `key` here is `*ListNode` and the `value` is `struct{}`, an empty struct taking **0 bytes**.
  - After defining this `map`, initialize it.
- `nil` == `None`
- Map lookup (comma-ok idiom)
  - `if _ , ok := map[fuck]; ok { }`
- `seen[head] = struct{}{}`
- Use `.` here as well to access fields inside a struct.

The problem asks whether there is an O(1)-space algorithm, so storing nodes in a hash table is out. That leaves something pointer-based, of course:

**Fast and slow pointers**
Floyd's cycle-finding algorithm

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

All right, the official solution is a little more concise.

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

The starting points differ slightly, but eventually one pointer laps the other and they meet anyway.

### [2. Add Two Numbers - LeetCode](https://leetcode.cn/problems/add-two-numbers/)

> *One-stop service from where dreams begin to where they end, meow.*

This is LeetCode problem number two.

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

Let's sort out the idea first: create a new linked list with `tail`, while `head` is its head node.

Express the addition as `carry*10+sum`, and that's basically it. But I hadn't used this linked-list setup before, and creating it really stumped me.

First create the head node. A head node is `an address + Val`, so simply take and store the address of `ListNode{Val: sum}`.

`tail.Next = &ListNode{Val: sum}`

Three things: create a ListNode, set its Val to sum, and point tail.Next to its address.

Q: One question: if the contents of two `ListNode{Val: sum}` values are the same, are their addresses the same too?

A: No. It allocates another space on the heap.

Of course, there is a better way to write this.

A dummy head node

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

We can drop a lot of conditions this way. There's less to think about, and it reads well too, zwz.

Still, I have to complain: linked lists are easier to understand than to write. They take so much brainpower and fiddling.

### [21. Merge Two Sorted Lists - LeetCode](https://leetcode.cn/problems/merge-two-sorted-lists/)

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

It passed, but it can be better. The 101 obviously comes from seeing that the input only goes up to 100. Might as well improve both the implementation and the algorithm.

Don't forget what makes linked lists useful: attach the whole remaining chain at once.

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

### [138. Copy List with Random Pointer - LeetCode](https://leetcode.cn/problems/copy-list-with-random-pointer/)

This made me want to cry, but it really just means **deep copy**.

How do we do that? random can even create cycles during traversal, so that approach simply won't work.

What now? I'll copy your code.

I can't even get the copying right.

Then I have no choice but to study it properly.

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

This is the first official solution, described as **backtracking + hash table**.

But I'd rather call it **DFS (depth-first search) + hash table**.

`var cachedNode map[*Node]*Node` is a global variable.

It's simply *map[original list node address] = address of the corresponding newly created node*.

```go
func copyRandomList(head *Node) *Node {
  cachedNode = map[*Node]*Node{}
  return deepCopy(head)
}
```

Initialize `cachedNode`, then recurse.

```go
if node == nil {
  return nil
}
```

If it's empty, don't copy it.

```go
if n, ok := cachedNode[node]; ok {
  return n
}
```

If the two corresponding nodes already exist, reuse them rather than creating another pair.

```go
newNode := &Node{Val: node.Val}
cachedNode[node] = newNode
```

Create the mapping.

Of course, there are other approaches too.

// ToDo

### [206. Reverse Linked List - LeetCode](https://leetcode.cn/problems/reverse-linked-list/)

Hello there.

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

This is a bit funny. I kept writing `return head` until my brain went smooth. Still, at least I can write it now—that's progress. :cry:

It can be simplified a little: the initial condition can actually be handled in the code below.

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
  curr := head // Use curr for the current position so head doesn't make everything confusing
  
  for curr != nil { // While curr still has nodes to visit
    next := curr.Next // The next destination; also handles curr.Next == nil
    curr.Next = prev // Reverse the link
    prev = curr    // Prepare to advance: move prev and curr forward together
    curr = next
  }
  return prev
}
```

### [92. Reverse Linked List II - LeetCode](https://leetcode.cn/problems/reverse-linked-list-ii/)

Haha, I'm not cut out for linked lists. They're getting me down.

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

### [25. Reverse Nodes in k-Group - LeetCode](https://leetcode.cn/problems/reverse-nodes-in-k-group/)

First accepted solution

Runtime 3 ms, beating 1.36%

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

### 19. Remove Nth Node From End of List

[19. Remove Nth Node From End of List](https://leetcode.cn/problems/remove-nth-node-from-end-of-list/)

The one thing to watch: return `dummy.Next`, not `head`, because the `head` node might have been deleted, which would cause problems.

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

### 82. Remove Duplicates from Sorted List II

[82. Remove Duplicates from Sorted List II](https://leetcode.cn/problems/remove-duplicates-from-sorted-list-ii/)

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

### 61. Rotate List

[61. Rotate List](https://leetcode.cn/problems/rotate-list/)

Turn the list into a cycle, then operate on it.

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

The official solution does the same thing, but looks rather elegant. Here it is.

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

Oh, it's really just a different way to iterate. This one is easy to follow.

### 86. Partition List

[86. Partition List](https://leetcode.cn/problems/partition-list/)

Pitfalls I ran into:

- Not setting `big.Next` to `nil` causes excessive memory use. Why?
  - Oh, `big.Next` still points to the next position in the original list. If that creates a cycle, it just keeps going around.
- Not using `bigDummy.Next` includes the initial 0 stored in `bigDummy` itself.

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

### 146. LRU Cache

[146. LRU Cache](https://leetcode.cn/problems/lru-cache/)

Are you sure this is a medium problem?

All right, this deserves a very, very thorough review.

Store the previously used entries in a doubly linked list and manage them there. The idea is actually quite simple.

The code just takes some thought.

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

## Binary Trees

### 144. Binary Tree Preorder Traversal

[144. Binary Tree Preorder Traversal](https://leetcode.cn/problems/binary-tree-preorder-traversal/)

Learning data structures: preorder means root, left, right.

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

### 104. Maximum Depth of Binary Tree

[104. Maximum Depth of Binary Tree](https://leetcode.cn/problems/maximum-depth-of-binary-tree/)

DFS: depth-first search

```go
func maxDepth(root *TreeNode) int {
  if root == nil {
    return 0
  }
  return max(maxDepth(root.Left),maxDepth(root.Right)) + 1
}
```

BFS: breadth-first search

Keep putting everything to visit into a queue, and eventually traverse it all.

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

### 100. Same Tree

[100. Same Tree](https://leetcode.cn/problems/same-tree/)

Compare the left sides, then the right sides.

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

### 226. Invert Binary Tree

[226. Invert Binary Tree](https://leetcode.cn/problems/invert-binary-tree/)

Do you know how useful recursion is?

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

### 101. Symmetric Tree

[101. Symmetric Tree](https://leetcode.cn/problems/symmetric-tree/)

I was being a bit silly at first. The solution made it clear: just pass two nodes as arguments, and recursion works.

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

Iteration works just as well, but I still prefer recursion.

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

### 105. Construct Binary Tree from Preorder and Inorder Traversal

[105. Construct Binary Tree from Preorder and Inorder Traversal](https://leetcode.cn/problems/construct-binary-tree-from-preorder-and-inorder-traversal/)

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

### 106. Construct Binary Tree from Inorder and Postorder Traversal

[106. Construct Binary Tree from Inorder and Postorder Traversal](https://leetcode.cn/problems/construct-binary-tree-from-inorder-and-postorder-traversal/)

Both problems use the same idea. I don't feel like reading the official solutions to optimize further. Maybe when I have time.

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

### 117. Populating Next Right Pointers in Each Node II

[117. Populating Next Right Pointers in Each Node II](https://leetcode.cn/problems/populating-next-right-pointers-in-each-node-ii/)

BFS came to mind immediately. Time and space are both O(n).

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

But this can clearly be improved.

The official solution gives a second approach.

Treat each connected level as a linked list. That's clever: once the linked list exists, the next level can be traversed directly.

Since the tree's shape is unknown, we still have to traverse it. This is a more elegant way to avoid the queue.

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

This uses a **helper anonymous function**.

`handle := func(cur *Node){ }`

Of course, DFS works too. First find the head node.

```go
func connect(root *Node) *Node {
  pre := []*Node{}
  var dfs func(*Node, int)
  dfs = func(node *Node, depth int) {
    if node == nil {
      return
    }
    if depth == len(pre) { // node is the leftmost node on this level
      pre = append(pre, node)
    } else { // pre[depth] is the node to the left of node
      pre[depth].Next = node // The node to the left of node points to node
      pre[depth] = node
    }
    dfs(node.Left, depth+1)
    dfs(node.Right, depth+1)
  }
  dfs(root, 0) // The root is at depth 0
  return root
}

```

### 114. Flatten Binary Tree to Linked List

[114. Flatten Binary Tree to Linked List](https://leetcode.cn/problems/flatten-binary-tree-to-linked-list/)

I learned a piece of Go syntax sugar here.

If you use `list = append(list, preoderTraversal(root.Left))`,

it reports `cannot use preorderTraversal(root.Left) (value of type []*precompiled.TreeNode) as *precompiled.TreeNode value in argument to append (solution.go)`.

> slice... **unpacks a slice into individual elements** to pass to a function.

Feels essential when working through slices.

Back to the problem: use preorder traversal, then modify the nodes directly, attaching the left node on the right.

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

Time complexity O(n), space O(n).

But the official solution has a better version using O(1) space.

Track the current node with curr. If it has a left child, disconnect the left side and move the right side over.

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

I also heard about this problem in a conversation:

[LCR 155. Convert a Binary Search Tree to a Sorted Doubly Linked List - LeetCode](https://leetcode.cn/problems/er-cha-sou-suo-shu-yu-shuang-xiang-lian-biao-lcof/)

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

### 112. Path Sum

[112. Path Sum](https://leetcode.cn/problems/path-sum/)

Fun. Full-on recursion: just adjust `targetSum` as you recurse.

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

### 129. Sum Root to Leaf Numbers

[129. Sum Root to Leaf Numbers](https://leetcode.cn/problems/sum-root-to-leaf-numbers/)

Aspiring to be a recursion kid.

Binary trees are just so well suited to recursion. Is this problem expressed as a sum because it fits recursion?

Who knows.

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

### 124. Binary Tree Maximum Path Sum

[124. Binary Tree Maximum Path Sum](https://leetcode.cn/problems/binary-tree-maximum-path-sum/)

What a clever problem.

There are really only two decisions: whether this is the best option and we should choose a new path, and whether to take each of the current two directions.

Then recurse through different nodes and compare.

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

### 173. Binary Search Tree Iterator

[173. Binary Search Tree Iterator](https://leetcode.cn/problems/binary-search-tree-iterator/)

What a confusing description.

Flattening

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

Iteration

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

### 222. Count Complete Tree Nodes

[222. Count Complete Tree Nodes](https://leetcode.cn/problems/count-complete-tree-nodes/)

What's easy about this?

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

See [Do You Really Know How to Count the Nodes in a Complete Binary Tree? - Tencent Cloud Developer Community](https://cloud.tencent.com/developer/article/1880865).

### 236. Lowest Common Ancestor of a Binary Tree

[236. Lowest Common Ancestor of a Binary Tree](https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-tree/)

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

Tell me again why recursion is godlike.

### 199. Binary Tree Right Side View

[199. Binary Tree Right Side View](https://leetcode.cn/problems/binary-tree-right-side-view/)

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

BFS works too.

### 637. Average of Levels in Binary Tree

[637. Average of Levels in Binary Tree](https://leetcode.cn/problems/average-of-levels-in-binary-tree/)

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

BFS works too.

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

### 102. Binary Tree Level Order Traversal

[102. Binary Tree Level Order Traversal](https://leetcode.cn/problems/binary-tree-level-order-traversal/)

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

Of course, BFS works too.

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

### 103. Binary Tree Zigzag Level Order Traversal

[103. Binary Tree Zigzag Level Order Traversal](https://leetcode.cn/problems/binary-tree-zigzag-level-order-traversal/)

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

### 530. Minimum Absolute Difference in BST

[530. Minimum Absolute Difference in BST](https://leetcode.cn/problems/minimum-absolute-difference-in-bst/)

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

### 230. Kth Smallest Element in a BST

[230. Kth Smallest Element in a BST](https://leetcode.cn/problems/kth-smallest-element-in-a-bst/)

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

### 98. Validate Binary Search Tree

[98. Validate Binary Search Tree](https://leetcode.cn/problems/validate-binary-search-tree/)

Recursion

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

Inorder traversal

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

## Graphs

### 200. Number of Islands

[200. Number of Islands](https://leetcode.cn/problems/number-of-islands/)

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

Isn't that sneaky?

### 130. Surrounded Regions

[130. Surrounded Regions](https://leetcode.cn/problems/surrounded-regions/)

Traverse from all four boundaries, mark every reachable position as 'A', and extend the marking inward. In the final pass, process all marked positions.
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

Then I forgot another detail along the way: Go's range can't handle two variables simultaneously here, so nested loops it is.

BFS also works.

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
