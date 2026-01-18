:page/title 壁炉系统 - 温暖与管理
:blog-post/tags [:songs-of-syx :clojure :hearth]
:blog-post/author {:person/id :jan}
:page/body

## 概述

壁炉是《Songs of Syx》中提供温暖和烹饪的设施。通过 REPL,你可以获取壁炉蓝图、创建壁炉、配置参数。本文将介绍壁炉相关的所有 REPL 功能。

## 获取壁炉蓝图

```clojure
(ns repl.core
  (:require [game.hearth :as h]))

;; 获取壁炉蓝图
(def hearth-blueprint (h/get-hearth))
```

## 创建壁炉

### 基本创建

```clojure
;; 创建壁炉
(h/create-hearth 100 150 10 10)
```

参数为:中心 X,中心 Y,宽度,高度(瓦片坐标)

### 带选项创建

```clojure
;; 创建壁炉(带选项)
(h/create-hearth 100 150 10 10
               {:fuel "WOOD"
                :capacity 50.0
                :heat-radius 15.0
                :priority 0.9})
```

可选项:
- `:fuel` - 燃料类型
- `:capacity` - 燃料容量
- `:heat-radius` - 供暖范围
- `:priority` - 工作优先级

### 单次更新创建

```clojure
;; 创建壁炉(单次更新)
(h/create-hearth-once 100 150 10 10
                      {:fuel "WOOD"
                       :capacity 50.0})
```

## 注意事项

1. **燃料供应**: 确保有足够的燃料(木头、煤炭等)。
2. **供暖范围**: 更大的供暖范围需要更多燃料。
3. **容量管理**: 更高容量可以减少加燃料频率。
4. **位置选择**: 靠近居住区确保小人能受益。

## 相关文章

- [水井系统](/blog-posts/well-system/)
- [农场系统](/blog-posts/farm-system/)
