:page/title 维护站系统 - 家具与自动化
:blog-post/tags [:songs-of-syx :clojure :maintenance]
:blog-post/author {:person/id :jan}
:page/body

## 概述

维护站是《Songs of Syx》中维修工具和装备的设施。通过 REPL,你可以计算家具位置、创建维护站、管理自动化设置。本文将全面介绍维护站相关的所有 REPL 功能。

## 纯函数(可测试)

### 边缘瓦片计算

```clojure
(ns repl.core
  (:require [game.maintenance :as m]))

;; 查找区域边缘瓦片
(m/find-edge-tiles 100 100 20 20)
```

返回边缘瓦片的坐标列表。

### 门位置计算

```clojure
;; 计算门位置
(m/calculate-door-position 100 100 20 20
                         {:door-side :north
                          :door-width 1})

;; 查找门位置
(m/find-door-position 100 100 20 20)
```

可选项:
- `:door-side` - 门方向(:north/:south/:east/:west)
- `:door-width` - 门宽度

### 工作台和工具位置

```clojure
;; 计算工作台位置
(m/calculate-workbench-positions 100 100 20 20
                              {:bench-count 3
                               :spacing 5})

;; 计算工具位置
(m/calculate-tool-positions 100 100 20 20
                          {:tool-count 6
                           :spacing 3})
```

### 占用瓦片计算

```clojure
;; 计算家具占用的瓦片
(m/calculate-occupied-tiles [[100 100] [105 105] [110 110]] 3 2)
```

参数为:家具位置列表,家具宽度,家具高度

### 工具家具尺寸选择

```clojure
;; 选择工具家具尺寸
(m/select-tool-furniture-size 20 20)
```

返回适合区域尺寸的工具家具尺寸。

## 创建维护站

### 基本创建

```clojure
;; 创建维护站
(m/create-maintenance 100 100 20 20)
```

参数为:中心 X,中心 Y,宽度,高度

### 带选项创建

```clojure
;; 创建维护站(带选项)
(m/create-maintenance 100 100 20 20
                   {:auto-employ true
                    :priority 0.8
                    :workers 5})
```

### 单次更新创建

```clojure
;; 创建维护站(单次更新)
(m/create-maintenance-once 100 100 20 20
                         {:auto-employ true})
```

## 维护站管理

### 查询维护站

```clojure
;; 获取所有维护站
(def all-stations (m/all-maintenance-stations))

;; 获取指定位置的维护站
(m/maintenance-station-at 100 100)
```

### 位置查询

```clojure
;; 获取维护站位置
(def station (first (m/all-maintenance-stations)))
(m/maintenance-station-position station)
```

### 自动雇佣管理

```clojure
;; 检查自动雇佣状态
(m/is-auto-employ-enabled? station)  ;; true/false

;; 设置自动雇佣
(m/set-auto-employ station true)

;; 设置自动雇佣(单次更新)
(m/set-auto-employ-once station true)
```

## 实用示例

### 示例 1: 优化维护站布局

```clojure
(defn optimize-maintenance-layout [center-x center-y width height]
  (let [edge-tiles (m/find-edge-tiles center-x center-y width height)
        door-pos (m/calculate-door-position center-x center-y width height
                                       {:door-side :south})
        workbenches (m/calculate-workbench-positions center-x center-y width height)
        tools (m/calculate-tool-positions center-x center-y width height)]
    {:edge-tiles edge-tiles
     :door door-pos
     :workbenches workbenches
     :tools tools}))

(optimize-maintenance-layout 100 100 20 20)
```

### 示例 2: 创建维护站网络

```clojure
(defn create-maintenance-network [start-x start-y count spacing]
  (doseq [i (range count)]
    (let [x (+ start-x (* i spacing))
          y start-y]
      (m/create-maintenance-once x y 15 15
                                  {:auto-employ true}))))

;; 创建 3 个维护站
(create-maintenance-network 100 100 3 25)
```

### 示例 3: 批量设置自动雇佣

```clojure
(defn enable-auto-employ-all []
  (doseq [station (m/all-maintenance-stations)]
    (m/set-auto-employ-once station true))
  {:status :ok
   :affected (count (m/all-maintenance-stations))})

(enable-auto-employ-all)
```

### 示例 4: 维护站利用率分析

```clojure
(defn analyze-station-utilization []
  (->> (m/all-maintenance-stations)
       (map (fn [station]
              {:position (m/maintenance-station-position station)
               :auto-employ (m/is-auto-employ-enabled? station)}))))

(analyze-station-utilization)
```

## 注意事项

1. **布局优化**: 合理安排工作台和工具位置,提高效率。
2. **自动雇佣**: 自动雇佣可以减少管理负担,但需确保有足够劳动力。
3. **门位置**: 门的位置影响小人访问效率,通常放置在边缘。
4. **家具尺寸**: 选择合适尺寸的工具家具,避免浪费空间。

## 相关文章

- [建筑与房间](/blog-posts/building-room/)
- [仓库管理](/blog-posts/warehouse-management/)
