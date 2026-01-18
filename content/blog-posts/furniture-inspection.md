:page/title 家具检查 - 数据查询与区域扫描
:blog-post/tags [:songs-of-syx :clojure :furniture]
:blog-post/author {:person/id :jan}
:page/body

## 概述

家具检查是《Songs of Syx》中查询和分析游戏内物品放置情况的功能。通过 REPL,你可以获取家具数据、扫描区域、检查仓库状态。本文将全面介绍家具检查相关的所有 REPL 功能。

## 获取家具数据

### 家具数据实例

```clojure
(ns repl.core
  (:require [repl.tutorial1 :as t1]))

;; 获取家具数据实例
(def furniture-data (t1/get-furniture-data))
```

## 单个瓦片查询

### 获取家具项

```clojure
;; 获取指定瓦片的家具项
(t1/get-furniture-item 100 150)
```

返回瓦片上的家具项对象。

### 获取家具瓦片

```clojure
;; 获取指定瓦片的家具瓦片
(t1/get-furniture-tile 100 150)
```

返回瓦片本身的信息。

## 存在性检查

### 检查家具

```clojure
;; 检查是否有家具
(t1/has-furniture? 100 150)  ;; true/false
```

### 检查箱子

```clojure
;; 是否有箱子
(t1/has-crate? 100 150)  ;; true/false
```

## 家具信息

### 获取家具信息

```clojure
;; 获取家具信息
(t1/furniture-info 100 150)
```

返回家具的详细信息 map,包括类型、资源等。

## 区域扫描

### 扫描区域家具

```clojure
;; 扫描区域内的家具
(t1/scan-furniture-area 100 150 20 20)
```

参数为:起始 X,起始 Y,宽度,高度(瓦片单位)

返回区域内的所有家具列表。

### 仓库家具信息

```clojure
;; 获取仓库家具信息
(t1/warehouse-furniture-info 100 100 20 20)
```

返回指定仓库区域内所有家具的详细信息。

## 其他功能

### 移动到王座

```clojure
;; 移动相机到王座位置
(t1/move-to-throne)
```

## 实用示例

### 示例 1: 家具统计

```clojure
(defn count-furniture-in-area [start-x start-y width height]
  (let [furniture (t1/scan-furniture-area start-x start-y width height)]
    {:total (count furniture)
     :furniture (map t1/furniture-info furniture)}))

(count-furniture-in-area 100 100 20 20)
```

### 示例 2: 查找特定家具

```clojure
(defn find-furniture-type [start-x start-y width height furniture-type]
  (->> (t1/scan-furniture-area start-x start-y width height)
       (filter #(= furniture-type (:type (t1/furniture-info %))))))

;; 查找所有箱子
(find-furniture-type 100 100 50 50 "CRATE")
```

### 示例 3: 箱子分布分析

```clojure
(defn analyze-crate-distribution [center-x center-y radius]
  (let [start-x (- center-x radius)
        start-y (- center-y radius)
        width (* 2 radius)
        height (* 2 radius)
        crates (filter #(t1/has-crate? (:x %) (:y %))
                     (t1/scan-furniture-area start-x start-y width height))]
    {:total (count crates)
     :density (/ (count crates) (* width height))
     :positions (map #(vector (:x %) (:y %)) crates)}))

(analyze-crate-distribution 100 100 25)
```

### 示例 4: 空闲空间分析

```clojure
(defn find-empty-space [start-x start-y width height]
  (->> (for [y (range start-y (+ start-y height))
                x (range start-x (+ start-x width))]
            [x y])
       (filter #(not (t1/has-furniture? (first %) (second %))))))

(find-empty-space 100 100 20 20)
```

### 示例 5: 仓库利用率

```clojure
(defn warehouse-utilization [center-x center-y width height]
  (let [furniture (t1/scan-furniture-area center-x center-y width height)
        total-tiles (* width height)
        occupied (count furniture)]
    {:area total-tiles
     :occupied occupied
     :free (- total-tiles occupied)
     :utilization (/ occupied total-tiles)}))

(warehouse-utilization 100 100 20 20)
```

### 示例 6: 家具分类

```clojure
(defn classify-furniture [start-x start-y width height]
  (->> (t1/scan-furniture-area start-x start-y width height)
       (map t1/furniture-info)
       (group-by :type)
       (map (fn [[type items]]
              {:type type
               :count (count items)}))))

(classify-furniture 100 100 30 30)
```

### 示例 7: 家具网格

```clojure
(defn furniture-grid [start-x start-y width height]
  (let [grid (->> (for [y (range start-y (+ start-y height))
                            x (range start-x (+ start-x width))]
                        [x y])
                    (map (fn [[x y]]
                           {:x x :y y
                            :has-furniture (t1/has-furniture? x y)
                            :furniture (when (t1/has-furniture? x y)
                                            (t1/furniture-info x y))])))]
    {:grid grid
     :rows height
     :cols width}))

(furniture-grid 100 100 10 10)
```

### 示例 8: 家具热力图

```clojure
(defn furniture-heatmap [start-x start-y width height resolution]
  (let [grid-width (Math/ceil (/ width resolution))
        grid-height (Math/ceil (/ height resolution))]
    (->> (for [gy (range grid-height)
                  gx (range grid-width)]
              (let [cell-start-x (+ start-x (* gx resolution))
                    cell-start-y (+ start-y (* gy resolution))
                    cell-end-x (min (+ start-x width) (+ cell-start-x resolution))
                    cell-end-y (min (+ start-y height) (+ cell-start-y resolution))]
                {:cell [gx gy]
                 :furniture-count (->> (for [y (range cell-start-y cell-end-y)
                                              x (range cell-start-x cell-end-x)]
                                          (when (t1/has-furniture? x y) x))
                                       count)}))
         vec)))

;; 5x5 网格,每个单元格 5x5
(furniture-heatmap 100 100 25 25 5)
```

## 注意事项

1. **坐标系统**: 所有坐标都是瓦片坐标。
2. **实时性**: 家具位置和状态会实时变化。
3. **性能**: 大区域扫描可能耗时,合理选择扫描范围。
4. **空指针**: 查询不存在家具的瓦片返回 nil,需要处理。
5. **家具类型**: 不同类型家具有不同的属性和行为。

## 相关文章

- [仓库管理](/blog-posts/warehouse-management/)
- [相机控制](/blog-posts/camera-control/)
