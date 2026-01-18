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
               :material-name "STONE"
               :upgrade 0)
```

可选项:
- `:material-name` - 建筑材料名称（必须为 "STONE"）
- `:upgrade` - 升级等级（默认 0）

### 单次更新创建

```clojure
;; 创建水井(单次更新)
(w/create-well-once 100 150
                     :material-name "STONE"
                     :upgrade 0)
```

`create-well-once` 避免重复执行。

## 注意事项

1. **材料限制**: 水井必须使用 "STONE" 石头材料建造。
2. **尺寸固定**: 水井固定为 3x3 尺寸，不支持其他大小。
3. **位置选择**: 靠近居住区的小人访问更方便。

## 相关文章

- [农场系统](/blog-posts/farm-system/)
- [壁炉系统](/blog-posts/hearth-system/)
