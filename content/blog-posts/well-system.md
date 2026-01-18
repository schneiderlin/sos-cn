:page/title 水井系统 - 创建与管理
:blog-post/tags [:songs-of-syx :clojure :well]
:blog-post/author {:person/id :jan}
:page/body

## 概述

水井是《Songs of Syx》中提供水源的关键设施。通过 REPL,你可以获取水井蓝图、创建水井、配置相关参数。本文将介绍水井相关的所有 REPL 功能。

## 获取水井蓝图

```clojure
(ns repl.core
  (:require [game.well :as w]))

;; 获取水井蓝图
(def well-blueprint (w/get-well))
```

## 创建水井

### 基本创建

```clojure
;; 创建水井
(w/create-well 100 150)
```

参数为:中心 X,中心 Y(瓦片坐标)

### 带选项创建

```clojure
;; 创建水井(带选项)
(w/create-well 100 150
               {:depth 10.0
                :capacity 100.0
                :priority 0.8})
```

可选项:
- `:depth` - 水井深度
- `:capacity` - 储水容量
- `:priority` - 工作优先级

### 单次更新创建

```clojure
;; 创建水井(单次更新)
(w/create-well-once 100 150
                    {:depth 10.0
                     :capacity 100.0})
```

`create-well-once` 避免重复执行。

## 注意事项

1. **水源依赖**: 水井需要有地下水资源支持。
2. **容量管理**: 更大容量可以支持更多小人,但建造成本更高。
3. **优先级设置**: 优先级影响小人使用水井的顺序。
4. **位置选择**: 靠近居住区的小人访问更方便。

## 相关文章

- [农场系统](/blog-posts/farm-system/)
- [壁炉系统](/blog-posts/hearth-system/)
