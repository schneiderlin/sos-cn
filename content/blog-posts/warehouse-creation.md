:page/title 仓库创建 - 位置计算与逻辑
:blog-post/tags [:songs-of-syx :clojure :warehouse]
:blog-post/author {:person/id :jan}
:page/body

## 概述

仓库创建是《Songs of Syx》中建设储存设施的核心功能。通过 REPL,你可以计算家具位置、计算门位置、创建仓库、管理仓库建造。本文将全面介绍仓库创建相关的所有 REPL 功能。

## 纯函数(可测试)

### 边缘瓦片查找

```clojure
(ns repl.core
  (:require [repl.tutorial1 :as t1]))

;; 查找区域边缘瓦片
(t1/find-edge-tiles 100 100 20 20)
```

返回边缘瓦片的坐标列表。

### 门位置计算

```clojure
;; 计算门位置
(t1/calculate-door-position 100 100 20 20
                          {:door-side :south
                           :door-width 1})
```

可选项:
- `:door-side` - 门方向(:north/:south/:east/:west)
- `:door-width` - 门宽度

### 家具位置计算

```clojure
;; 计算家具位置
(t1/calculate-furniture-positions 100 100 20 20
                                   {:crate-count 20
                                    :spacing 1})
```

可选项:
- `:crate-count` - 箱子数量
- `:spacing` - 箱子间距

### 占用瓦片计算

```clojure
;; 计算占用瓦片
(t1/calculate-occupied-tiles [[100 100] [105 100] [110 100]] 3 2)
```

参数为:家具位置列表,家具宽度,家具高度

### 查找门位置

```clojure
;; 查找门位置
(t1/find-door-position 100 100 20 20)
```

## 创建仓库

### 基本创建

```clojure
;; 创建仓库
(t1/create-warehouse 100 100 20 20)
```

参数为:中心 X,中心 Y,宽度,高度(瓦片单位)

### 带选项创建

```clojure
;; 创建仓库(带选项)
(t1/create-warehouse 100 100 20 20
                     {:priority 0.8
                      :crates 20
                      :door-side :south})
```

可选项:
- `:priority` - 建造优先级
- `:crates` - 箱子数量
- `:door-side` - 门方向

### 单次更新创建

```clojure
;; 创建仓库(单次更新)
(t1/create-warehouse-once 100 100 20 20
                          {:priority 0.8
                           :crates 20})
```

## 仓库信息

### 获取仓库房间

```clojure
;; 获取仓库房间
(t1/get-stockpile-room)
```

### 获取仓库建造者

```clojure
;; 获取仓库建造者
(t1/get-stockpile-constructor)
```

## 其他功能

### 移动到王座

```clojure
;; 移动相机到王座
(t1/move-to-throne)
```

## 实用示例

### 示例 1: 仓库布局规划

```clojure
(defn plan-warehouse-layout [center-x center-y width height crate-count]
  (let [edge-tiles (t1/find-edge-tiles center-x center-y width height)
        door-pos (t1/calculate-door-position center-x center-y width height
                                       {:door-side :south})
        crate-positions (t1/calculate-furniture-positions center-x center-y width height
                                                     {:crate-count crate-count})]
    {:edge-tiles edge-tiles
     :door door-pos
     :crates crate-positions
     :total-width width
     :total-height height}))

(plan-warehouse-layout 100 100 20 20 30)
```

### 示例 2: 多仓库网络

```clojure
(defn create-warehouse-network [start-x start-y count spacing]
  (doseq [i (range count)]
    (let [x (+ start-x (* i spacing))
          y start-y]
      (t1/create-warehouse-once x y 15 15 {:crates 20}))))

;; 创建 5 个仓库,间距 20
(create-warehouse-network 100 100 5 20)
```

### 示例 3: 优化的仓库布局

```clojure
(defn optimized-warehouse [center-x center-y width height]
  (let [start-x (- center-x (quot width 2))
        start-y (- center-y (quot height 2))]
    ;; 计算最佳门位置(南边中间)
    (t1/calculate-door-position start-x start-y width height
                             {:door-side :south
                              :door-width 1})
    ;; 最大化箱子数量
    (let [max-crates (- (* width height) width)]  ;; 除去门边
      {:optimal-crates max-crates
       :door-side :south
       :utilization (/ max-crates (* width height))}))))

(optimized-warehouse 100 100 20 20)
```

### 示例 4: 仓库验证

```clojure
(defn validate-warehouse-layout [center-x center-y width height]
  (let [occupied (t1/calculate-occupied-tiles
                      [[center-x center-y]]
                      width height)
        has-door (t1/calculate-door-position center-x center-y width height)]
    (if (and occupied has-door)
      {:valid? true
       :door-position has-door}
      {:valid? false
       :reason "Invalid layout"})))

(validate-warehouse-layout 100 100 20 20)
```

### 示例 5: 智能仓库大小

```clojure
(defn suggest-warehouse-size [desired-crates]
  (let [squares (Math/ceil (Math/sqrt desired-crates))
        width squares
        height (+ squares 2)]  ;; 留出门空间
    {:width width
     :height height
     :crates desired-crates
     :area (* width height)}))

;; 根据箱子数量建议仓库大小
(suggest-warehouse-size 50)
```

### 示例 6: 仓库集群分析

```clojure
(defn analyze-warehouse-cluster []
  (let [rooms (t1/get-stockpile-room)]
    ;; 假设可以获取所有仓库实例
    ;; 分析仓库分布、利用率等
    {:total-warehouses (count rooms)
     :average-size 200  ;; 假设值
     :layout "grid"}))

(analyze-warehouse-cluster)
```

### 示例 7: 仓库门优化

```clojure
(defn optimize-door-placement [center-x center-y width height]
  (->> [:north :south :east :west]
       (map #(t1/calculate-door-position center-x center-y width height
                                        {:door-side %}))
       (map #(vector (keyword (str "door-" (name (first %)))) %))))

;; 对比不同门方向
(optimize-door-placement 100 100 20 20)
```

### 示例 8: 分区仓库系统

```clojure
(defn create-zoned-warehouses [center-x center-y zones]
  (let [per-zone (quot 360 (count zones))  ;; 分配角度
        radius 30]
    (doseq [[zone-index zone-type] (map-indexed vector zones)]
      (let [angle (* per-zone zone-index)
            x (+ center-x (* radius (Math/cos angle)))
            y (+ center-y (* radius (Math/sin angle)))]
        (t1/create-warehouse-once x y 15 15
                                  {:crates (case zone-type
                                               :food 30
                                               :wood 40
                                               :stone 25
                                               20)})))))

;; 创建 3 个分区仓库
(create-zoned-warehouses 100 100 [:food :wood :stone])
```

## 注意事项

1. **位置冲突**: 确保仓库位置不与现有建筑重叠。
2. **门方向**: 门影响小人访问效率,通常放在靠近居住区的一侧。
3. **箱子数量**: 根据仓库大小合理设置箱子数量。
4. **once 函数**: 使用 `create-warehouse-once` 避免重复创建。
5. **建造时间**: 大仓库需要更多时间和小人。
6. **资源需求**: 确保有足够的建筑材料。
7. **布局优化**: 考虑物流和访问便利性。

## 相关文章

- [仓库管理](/blog-posts/warehouse-management/)
- [家具检查](/blog-posts/furniture-inspection/)
- [维护站](/blog-posts/maintenance-system/)
