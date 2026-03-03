---
title: Go
published: 2026-03-03T15:00:00
tags:
  - go
series: "Backend"
---
:::warning
该部分为学习内容，并非完全正确的，仅个人使用和理解，不推荐作为参考
:::

## Compiler Directives

[Compile command](https://pkg.go.dev/cmd/compile)

:::note
使用时//后一定不能有空格，否则编译器会直接忽略

//go:指令名
:::

### go:noescape

此指令必须前置于无函数体的函数声明,强制修改编译器的逃逸分析结果
断言传递给该函数的所有指针参数及其引用的内存结构，绝对不会逃逸到堆内存

常用于消除堆分配与 GC 开销
example:
[indexbyte_native.go](https://go.dev/src/internal/bytealg/indexbyte_native.go)

```go
//go:noescape
func IndexByte(b []byte, c byte) int

//go:noescape
func IndexByteString(s string, c byte) int
```

这个函数的真实实现并不在 Go 里，而是在[indexbyte_amd64.s](https://go.dev/src/internal/bytealg/indexbyte_amd64.s)

b []byte 本质

```go
type slice struct {
    data *byte
    len  int
    cap  int
}
```

现在它被传入了一个
没有函数体、可能是外部实现、编译器看不到代码的

编译器会保守判断：不知道这个函数会不会保存这个指针 所以它可能逃逸

```txt
b.data 可能逃逸 → 整个 slice 逃逸 → 堆分配
```

因此导致每次调用 IndexByte 都可能产生堆分配 -> GC压力变大 -> 性能下降

但真实情况这个函数这个函数的汇编实现只是 扫描内存 查找字节 不保存任何指针 不返回 slice 不持久化参数

所以开发者得到这个结论：它完全是纯函数，不可能导致逃逸

也就加上了`//go:noescape`而不需要保守判断

使用场景:
无函数体声明
> 如果有函数体
> 编译器可以自己做分析
> 不允许你覆盖分析结果

它只允许用于汇编实现函数,runtime 内部函数,cgo 桥接函数xwx

- [ ] To Be Continued
