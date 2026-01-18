:page/title 农场系统 - 肥力分析与创建
:blog-post/tags [:songs-of-syx :clojure :farm]
:blog-post/author {:person/id :jan}
:page/body

## 概述

农场是《Songs of Syx》中农业生产的核心设施。通过 REPL,你可以分析土壤肥力、检查水源访问、评估农场位置质量、创建新农场。本文将全面介绍农场相关的所有 REPL 功能。

## 农场类型

### 获取农场类型

```clojure
(ns repl.core
  (:require [game.farm :as f]))

;; 获取所有农场类型
(def all-farm-types (f/all-farm-types))

;; 获取所有农场信息
(def all-farm-info (f/all-farm-info))

;; 获取第一个农场类型
(def default-farm (f/get-farm))
```

## 地形分析

### 肥力查询

```clojure
;; 获取指定瓦片的土壤肥力
(f/get-fertility 100 150)  ;; 返回 0.0-1.0 之间的值
```

肥力值说明:
- `1.0`: 最高肥力,作物生长最快
- `0.5`: 中等肥力
- `0.0`: 最低肥力,不适合耕种

### 区域肥力分析

```clojure
;; 获取区域平均肥力
(f/get-average-fertility 100 150 20 20)
```

参数为:起始 X,起始 Y,宽度,高度(瓦片单位)

### 水源访问

```clojure
;; 检查指定瓦片是否有水源
(f/has-water-access? 100 150)  ;; true/false

;; 获取区域水源访问百分比
(f/get-water-access-percentage 100 150 20 20)
```

水源访问百分比表示该区域内可以访问水源的瓦片比例。

## 农场位置质量

### 综合评估

```clojure
;; 获取农场位置质量评分
(f/get-farm-location-quality 100 100 20 20)
```

参数为:中心 X,中心 Y,宽度,高度。

质量评分考虑因素:
- 土壤肥力
- 水源访问
- 地形类型
- 气候因素

## 农场创建

### 创建农场

```clojure
;; 基本农场创建
(f/create-farm 100 100 20 20)
```

参数为:中心 X,中心 Y,宽度,高度。

### 带选项的农场创建

```clojure
;; 创建农场(带选项)
(f/create-farm 100 100 20 20
                 {:priority 1.0
                  :fertilize true
                  :assign-workers true})
```

可选项:
- `:priority` - 工作优先级(0.0-1.0)
- `:fertilize` - 是否自动施肥
- `:assign-workers` - 是否自动分配工人

### 单次更新创建

```clojure
;; 创建农场(单次更新)
(f/create-farm-once 100 100 20 20
                     {:priority 1.0
                      :fertilize true})
```

`create-farm-once` 避免重复执行,适合 REPL 使用。

## 农场管理

### 查询农场

```clojure
;; 获取所有农场实例
(def all-farms (f/all-farms))
(count all-farms)  ;; 农场总数

;; 获取指定位置的农场
(f/farm-at 100 100)
```

## 实用示例

### 示例 1: 查找最佳农场位置

```clojure
(defn find-best-farm-location [center-x center-y search-radius]
  (let [start-x (- center-x search-radius)
        end-x (+ center-x search-radius)
        start-y (- center-y search-radius)
        end-y (+ center-y search-radius)]
    (->> (for [x (range start-x end-x)
                   y (range start-y end-y)]
               {:x x :y y
                :quality (f/get-farm-location-quality x y 10 10)})
         (sort-by :quality >)
         first)))

(find-best-farm-location 100 100 20)
```

### 示例 2: 区域肥力地图

```clojure
(defn fertility-map [start-x start-y width height]
  (for [y (range start-y (+ start-y height))
        x (range start-x (+ start-x width))]
    [x y (f/get-fertility x y)]))

;; 生成 20x20 区域的肥力地图
(fertility-map 100 100 20 20)
```

### 示例 3: 分析水源覆盖

```clojure
(defn analyze-water-coverage [start-x start-y width height]
  {:water-percentage (f/get-water-access-percentage start-x start-y width height)
   :has-water-at-center (f/has-water-access? start-x start-y)
   :tiles-with-water (count (filter true?
                                   (for [y (range start-y (+ start-y height))
                                         x (range start-x (+ start-x width))]
                                     (f/has-water-access? x y))))})

(analyze-water-coverage 100 100 20 20)
```

### 示例 4: 批量创建农场

```clojure
(defn create-farm-grid [start-x start-y count spacing]
  (doseq [i (range count)
           :let [x (+ start-x (* i spacing))
                 y start-y]]
    (f/create-farm-once x y 15 15 {:priority 0.8})))

;; 创建 5 个间距为 20 的农场
(create-farm-grid 100 100 5 20)
```

### 示例 5: 农场效率分析

```clojure
(defn analyze-farm-efficiency []
  (let [farms (f/all-farms)]
    (map (fn [farm]
           {:x (:x farm)
            :y (:y farm)
            :width (:width farm)
            :height (:height farm)
            :area (* (:width farm) (:height farm))
            :quality (f/get-farm-location-quality
                     (:x farm)
                     (:y farm)
                     (:width farm)
                     (:height farm))})
         farms)))

(analyze-farm-efficiency)
```

### 示例 6: 农场位置建议

```clojure
(defn suggest-farm-locations [center-x center-y num-locations farm-size]
  (let [candidates (for [x (range (- center-x 20) (+ center-x 20))
                         y (range (- center-y 20) (+ center-y 20))]
                     {:x x :y y
                      :quality (f/get-farm-location-quality x y farm-size farm-size)})]
    (->> candidates
         (sort-by :quality >)
         (take num-locations))))

;; 在中心点周围建议 3 个农场位置,每个 15x15
(suggest-farm-locations 100 100 3 15)
```

### 示例 7: 水源优化布局

```clojure
(defn optimize-for-water-access [start-x start-y width height]
  (let [best-x (->> (range start-x (+ start-x width))
                     (map #(vector % (f/has-water-access? % start-y)))
                     (filter second)
                     first
                     first)]
    {:recommended-x best-x
     :y start-y
     :water-access (f/has-water-access? best-x start-y)
     :quality (f/get-farm-location-quality best-x start-y 10 10)}))

(optimize-for-water-access 100 100 20 20)
```

### 示例 8: 肥力热点分析

```clojure
(defn find-fertility-hotspots [start-x start-y width height threshold]
  (filter #(> (:quality %) threshold)
          (for [y (range start-y (+ start-y height))
                x (range start-x (+ start-x width))]
            {:x x :y y :quality (f/get-fertility x y)})))

;; 找出肥力 > 0.8 的位置
(find-fertility-hotspots 90 90 40 40 0.8)
```

## 注意事项

1. **肥力季节变化**: 肥力可能随季节变化,定期检查。

2. **水源重要性**: 有水源的农场产量显著更高。

3. **农场大小**: 较大的农场需要更多工人,管理时需平衡。

4. **气候因素**: 不同气候下肥力和水源的重要性不同。

5. **重复创建**: 使用 `create-farm-once` 避免 REPL 中重复创建。

6. **位置质量**: 位置质量是综合指标,考虑多个因素。

7. **作物类型**: 不同农场类型可能适合不同作物。

## 相关文章

- [资源系统](/blog-posts/resource-system/)
- [仓库管理](/blog-posts/warehouse-management/)
- [采集与清理](/blog-posts/harvest-clear/)
