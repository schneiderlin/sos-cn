:page/title 采集与清理 - 收获资源与清理地形
:blog-post/tags [:songs-of-syx :clojure :harvest]
:blog-post/author {:person/id :jan}
:page/body

## 概述

采集与清理是《Songs of Syx》中获取资源和准备建设用地的核心操作。通过 REPL,你可以清理树木和石头、采集野生作物、批量处理区域。本文将全面介绍采集与清理相关的所有 REPL 功能。

## 清理功能

### 单瓦片清理

```clojure
(ns repl.core
  (:require [game.harvest :as h]))

;; 清理指定瓦片的树木
(h/clear-wood-once 100 150)

;; 清理指定瓦片的石头
(h/clear-stone-once 100 150)

;; 清理指定瓦片的树木和石头
(h/clear-wood-and-stone-once 100 150)
```

参数为:瓦片 X,瓦片 Y

### 区域清理

```clojure
;; 清理区域内的树木
(h/clear-wood-area-once 100 150 20 20)

;; 清理区域内的石头
(h/clear-stone-area-once 100 150 20 20)

;; 清理区域内的树木和石头
(h/clear-wood-and-stone-area-once 100 150 20 20)
```

参数为:起始 X,起始 Y,宽度,高度(瓦片单位)

## 采集功能

### 采集野生作物

```clojure
;; 采集指定瓦片的野生作物
(h/forage-crop-once 100 150)

;; 采集区域内的野生作物
(h/forage-crop-area-once 100 150 20 20)
```

## 实用示例

### 示例 1: 建设用地准备

```clojure
(defn prepare-building-site [start-x start-y width height]
  ;; 清理所有树木和石头
  (h/clear-wood-and-stone-area-once start-x start-y width height)
  {:status :clearing
   :area {:start-x start-x :start-y start-y :width width :height height}})

(prepare-building-site 100 100 20 20)
```

### 示例 2: 采集周边资源

```clojure
(defn harvest-surrounding [center-x center-y radius]
  (let [start-x (- center-x radius)
        start-y (- center-y radius)
        width (* 2 radius)
        height (* 2 radius)]
    ;; 清理资源
    (h/clear-wood-and-stone-area-once start-x start-y width height)
    ;; 采集作物
    (h/forage-crop-area-once start-x start-y width height)
    {:status :harvested
     :center [center-x center-y]
     :radius radius}))

(harvest-surrounding 100 100 15)
```

### 示例 3: 分区清理

```clojure
(defn clear-zones [start-x start-y zone-size count]
  (doseq [i (range count)]
    (let [x (+ start-x (* (mod i 5) zone-size))
          y (+ start-y (* (quot i 5) zone-size))]
      (h/clear-wood-and-stone-area-once x y zone-size zone-size))))

;; 清理 4x4 网格,每个区域 10x10
(clear-zones 100 100 10 16)
```

### 示例 4: 智能清理规划

```clojure
(defn plan-clearing [center-x center-y building-width building-height]
  ;; 扩展清理范围以提供缓冲区
  (let [clear-x (- center-x (quot building-width 2) 5)
        clear-y (- center-y (quot building-height 2) 5)
        clear-width (+ building-width 10)
        clear-height (+ building-height 10)]
    {:clear-area [clear-x clear-y clear-width clear-height]
     :building-area [center-x center-y building-width building-height]
     :buffer-zone 5}))

(plan-clearing 100 100 20 20)
```

### 示例 5: 丰收季采集

```clojure
(defn mass-forage [start-x start-y width height]
  ;; 采集整个区域的野生作物
  (h/forage-crop-area-once start-x start-y width height)
  {:status :foraging
   :area {:start-x start-x :start-y start-y :width width :height height}})

(mass-forage 100 100 50 50)
```

### 示例 6: 资源路径清理

```clojure
(defn clear-path [x1 y1 x2 y2 path-width]
  (let [steps (max (Math/abs (- x2 x1)) (Math/abs (- y2 y1)))
        dx (/ (- x2 x1) steps)
        dy (/ (- y2 y1) steps)]
    (doseq [i (range (inc steps))]
      (let [x (+ x1 (* i dx))
            y (+ y1 (* i dy))]
        (h/clear-wood-and-stone-once x y)
        ;; 清理路径两侧
        (doseq [w (range 1 (inc (quot path-width 2)))]
          (h/clear-wood-and-stone-once (+ x w) y)
          (h/clear-wood-and-stone-once (- x w) y)))))))

;; 清理从 (100,100) 到 (200,150) 宽度 5 的路径
(clear-path 100 100 200 150 5)
```

### 示例 7: 环境保护

```clojure
(defn selective-harvest [center-x center-y radius]
  ;; 只清理,保留部分树木
  (let [start-x (- center-x radius)
        start-y (- center-y radius)
        width (* 2 radius)
        height (* 2 radius)]
    ;; 清理石头(全部)
    (h/clear-stone-area-once start-x start-y width height)
    ;; 采集作物(全部)
    (h/forage-crop-area-once start-x start-y width height)
    ;; 树木选择性清理(这里只清理 50%)
    ;; 实际需要遍历每个瓦片并随机决定
    {:status :selective
     :preservation 0.5}))

(selective-harvest 100 100 20)
```

### 示例 8: 批量资源采集

```clojure
(defn batch-harvest [zones]
  (doseq [zone zones]
    (let [x (first zone)
          y (second zone)
          w (nth zone 2)
          h (nth zone 3)]
      (h/clear-wood-and-stone-area-once x y w h)
      (h/forage-crop-area-once x y w h)))
  {:status :batch-harvest
   :zones-processed (count zones)})

;; 批量处理多个区域
(batch-harvest [[100 100 20 20]
               [150 100 20 20]
               [100 150 20 20]]))
```

## 注意事项

1. **once 函数**: 所有清理和采集函数都使用 `once` 后缀,避免重复执行。

2. **资源恢复**: 某些资源可能随时间自然恢复,注意可持续采集。

3. **小人工人**: 清理操作需要有对应的小人执行,确保有足够劳动力。

4. **优先级**: 清理操作通常有优先级,高优先级的任务优先完成。

5. **区域大小**: 大区域清理需要更多时间和劳动力。

6. **环境影响**: 过度清理可能影响生态和小人幸福度。

7. **资源价值**: 不同资源有不同的价值,根据需求决定优先采集顺序。

## 相关文章

- [资源系统](/blog-posts/resource-system/)
- [动物查询](/blog-posts/animal-query/)
- [仓库管理](/blog-posts/warehouse-management/)
