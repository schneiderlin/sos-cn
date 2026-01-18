:page/title 仓库与储存 - 箱子管理与资源分配
:blog-post/tags [:songs-of-syx :clojure :warehouse]
:blog-post/author {:person/id :jan}
:page/body

## 概述

仓库是定居点储存资源的核心设施。通过 REPL,你可以查询所有仓库、分析箱子分配、设置资源限制、优化储存策略。本文将全面介绍仓库管理相关的所有 REPL 功能。

## 查询仓库

### 获取所有仓库

```clojure
(ns repl.core
  (:require [game.warehouse :as wh]))

;; 获取所有仓库实例
(def all-warehouses (wh/all-warehouses))
(count all-warehouses)  ;; 仓库总数
```

### 获取单个仓库信息

```clojure
;; 获取第一个仓库
(def first-warehouse (first all-warehouses))

;; 获取仓库详细信息
(def warehouse-info (wh/warehouse-info first-warehouse))
(keys warehouse-info)
```

`warehouse-info` 返回的 map 包含:

| 字段 | 类型 | 描述 |
|------|------|------|
| `:x` | number | 中心 X 坐标(瓦片) |
| `:y` | number | 中心 Y 坐标(瓦片) |
| `:width` | number | 宽度(瓦片) |
| `:height` | number | 高度(瓦片) |
| `:name` | string | 仓库名称 |
| `:level` | number | 仓库等级 |

### 获取仓库位置

```clojure
;; 获取仓库位置
(def pos (wh/warehouse-position first-warehouse))
;; => {:x 100, :y 150}
```

### 区域查询

```clojure
;; 检查仓库是否在指定区域内
(wh/warehouse-in-area? first-warehouse 90 140 20 20)

;; 获取区域内的所有仓库
(wh/warehouses-in-area 90 140 20 20)
```

## 箱子查询

### 查询特定资源的箱子数量

```clojure
(ns repl.core
  (:require [game.warehouse :as wh]
            [game.resource :as res]))

;; 获取资源对象
(def wood (res/get-resource "WOOD"))

;; 查询该仓库有多少个箱子分配给木头
(wh/crates-for-resource first-warehouse wood)
```

### 按材料获取所有箱子数量

```clojure
;; 获取所有资源及其箱子数(map 形式)
(wh/crates-by-material first-warehouse)

;; 使用资源名称作为键
(wh/crates-by-material-named first-warehouse)
```

示例输出:
```clojure
{"WOOD" 25
 "STONE" 15
 "BREAD" 8
 "MEAT" 5
 "TOOL" 3}
```

### 跨仓库聚合

```clojure
;; 聚合多个仓库的箱子数量
(wh/crates-by-material-warehouses (take 3 all-warehouses))

;; 聚合所有仓库的箱子
(wh/crates-by-material-all-warehouses)

;; 聚合区域内的箱子
(wh/crates-by-material-in-area 90 140 20 20)
```

## 箱子分配设置

### 查询分配

```clojure
;; 查询特定资源分配了多少个箱子
(wh/get-crates-allocated-to-resource first-warehouse wood)

;; 查询单箱资源数量限制
(wh/get-crate-material-limit first-warehouse wood)
```

`get-crate-material-limit` 返回每个箱子最多可以储存多少单位的该资源。

### 分配箱子

```clojure
;; 分配箱子给资源
(wh/allocate-crates-to-resource-once first-warehouse wood 10)
```

**注意**: 使用 `once` 后缀的函数只会执行一次更新操作,避免重复执行。

### 设置单箱限制

```clojure
;; 设置单箱资源数量限制
(wh/set-crate-material-limit first-warehouse wood 50)

;; 设置单箱限制(单次更新)
(wh/set-crate-material-limit-once first-warehouse wood 50)
```

单箱限制决定了每个箱子最多储存多少资源,更高的限制意味着更高的储存密度。

### 批量设置

```clojure
;; 设置仓库只接受单一资源
(wh/set-warehouse-single-material-once first-warehouse wood)

;; 设置仓库接受多种资源
(wh/set-warehouse-materials-once first-warehouse [wood
                                                 (res/get-resource "STONE")
                                                 (res/get-resource "BREAD")])

;; 清除所有限制
(wh/clear-warehouse-material-restrictions-once first-warehouse)
```

### 获取所有设置

```clojure
;; 获取所有资源分配
(wh/get-crate-allocations first-warehouse)

;; 获取所有单箱限制
(wh/get-crate-material-limits first-warehouse)
```

## 实用示例

### 示例 1: 查看仓库资源分布

```clojure
(defn warehouse-inventory-report []
  (let [whs (wh/all-warehouses)]
    (map (fn [w]
           {:id (:id (wh/warehouse-info w))
            :position (wh/warehouse-position w)
            :inventory (wh/crates-by-material-named w)})
         whs)))

(warehouse-inventory-report)
```

### 示例 2: 查找空的仓库

```clojure
(defn find-empty-warehouses []
  (let [whs (wh/all-warehouses)]
    (filter #(empty? (wh/crates-by-material %)) whs)))

(find-empty-warehouses)
```

### 示例 3: 统计所有仓库的总储量

```clojure
(defn total-inventory []
  (let [all-crates (wh/crates-by-material-all-warehouses)]
    (->> all-crates
         (map (fn [[resource crates]]
                [resource (* crates 50)]))  ;; 假设每箱 50 单位
         (into {}))))

(total-inventory)
```

### 示例 4: 优化仓库分配

```clojure
(defn optimize-warehouse-allocation []
  (let [whs (wh/all-warehouses)
        ;; 找到分配给每种资源的箱子数
        allocations (apply merge-with +
                            (map #(wh/crates-by-material-named %) whs))]
    ;; 按箱子数排序,找出最常储存的资源
    (->> allocations
         (sort-by val >)
         (take 10))))

(optimize-warehouse-allocation)
```

### 示例 5: 专业化仓库

```clojure
;; 创建一个专门储存木头的仓库
(defn create-wood-warehouse [warehouse-id]
  (let [wh (some #(when (= (:id (wh/warehouse-info %)) warehouse-id) %)
                 (wh/all-warehouses))
        wood (res/get-resource "WOOD")]
    (when wh
      (wh/set-warehouse-single-material-once wh wood)
      (wh/set-crate-material-limit-once wh wood 100)  ;; 高密度
      {:status :ok
       :warehouse-id warehouse-id})))

;; 使用示例
(create-wood-warehouse 123)
```

### 示例 6: 按区域分析资源分布

```clojure
(defn analyze-area-inventory [x y width height]
  (let [whs-in-area (wh/warehouses-in-area x y width height)
        total-crates (wh/crates-by-material-warehouses whs-in-area)]
    {:area {:x x :y y :width width :height height}
     :warehouses (count whs-in-area)
     :inventory (->> total-crates
                    (map (fn [[res crates]]
                           [res (* crates 50)]))  ;; 转换为实际数量
                    (into {}))}))

;; 分析定居点中心区域
(analyze-area-inventory 100 100 30 30)
```

### 示例 7: 查找未充分利用的仓库

```clojure
(defn find-underutilized-warehouses [threshold]
  (let [whs (wh/all-warehouses)
        ;; 计算每个仓库的总箱子数
        crate-counts (map (fn [w]
                            [w (reduce + 0 (vals (wh/crates-by-material w)))])
                          whs)]
    (->> crate-counts
         (filter #(< (second %) threshold))
         (map first))))

;; 查找箱子数少于 10 的仓库
(find-underutilized-warehouses 10)
```

### 示例 8: 导出仓库数据

```clojure
(defn export-warehouse-data []
  (let [whs (wh/all-warehouses)]
    (spit "warehouses.edn"
          (pr-str (map (fn [w]
                         {:info (wh/warehouse-info w)
                          :position (wh/warehouse-position w)
                          :inventory (wh/crates-by-material-named w)
                          :allocations (wh/get-crate-allocations w)
                          :limits (wh/get-crate-material-limits w)})
                       whs)))))

(export-warehouse-data)
```

## 高级功能

### 资源流动分析

```clojure
(defn analyze-resource-flow []
  (let [all-inv (wh/crates-by-material-all-warehouses)
        sorted-inv (sort-by val > all-inv)]
    (->> sorted-inv
         (map (fn [[resource crates]]
                {:resource resource
                 :crates crates
                 :estimated-amount (* crates 50)})))))

(analyze-resource-flow)
```

### 仓库容量计算

```clojure
(defn calculate-warehouse-capacity [warehouse]
  (let [info (wh/warehouse-info warehouse)
        area (* (:width info) (:height info))
        ;; 假设每个瓦片可以放 2 个箱子
        max-crates (* area 2)
        ;; 减去门和其他障碍物
        available-crates (int (* max-crates 0.85))]
    {:total-area area
     :max-crates max-crates
     :available-crates available-crates
     :current-crates (reduce + 0 (vals (wh/crates-by-material warehouse)))
     :utilization (/ (reduce + 0 (vals (wh/crates-by-material warehouse)))
                     available-crates)}))

(calculate-warehouse-capacity first-warehouse)
```

### 智能分配建议

```clojure
(defn suggest-allocation []
  (let [whs (wh/all-warehouses)
        total-crates (wh/crates-by-material-all-warehouses)]
    (->> total-crates
         (sort-by val >)
         (take 5)
         (map (fn [[resource crates]]
                (let [crates-per-wh (/ crates (count whs))]
                  {:resource resource
                   :total-crates crates
                   :warehouses-count (count whs)
                   :suggested-per-wh (int crates-per-wh)
                   :dedicated-wh-needed (int (ceil (/ crates 100)))}))))))

(suggest-allocation)
```

## 注意事项

1. **实时更新**: 仓库内容会随着小人搬运物品而变化,每次查询都可能得到不同的结果。

2. **once 函数**: 所有设置函数都有 `once` 版本,避免在 REPL 中多次执行造成问题。

3. **容量限制**: 仓库有实际的物理容量限制,分配的箱子不能超过实际可用空间。

4. **资源限制**: 某些资源可能有特殊的储存要求(如温度敏感),需要注意相关限制。

5. **性能**: 当仓库数量很多时,频繁查询可能影响性能。建议缓存结果并定期更新。

6. **单箱限制**: 设置较高的单箱限制可以提高储存密度,但可能影响存取效率。

## 相关文章

- [资源查询](/blog-posts/resource-query/)
- [仓库创建](/blog-posts/warehouse-creation/)
- [建筑与房间](/blog-posts/building-room/)
