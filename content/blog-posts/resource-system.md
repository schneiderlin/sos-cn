:page/title 资源系统 - 注册表查询与分类管理
:blog-post/tags [:songs-of-syx :clojure :resource]
:blog-post/author {:person/id :jan}
:page/body

## 概述

资源是《Songs of Syx》中所有物品和材料的基础。从原材料(石头、木头)到加工产品(面包、工具),所有东西都是资源。通过 REPL,你可以查询资源注册表、获取详细信息、分类资源(可开采、可种植、食物、饮品)并导出数据。本文将全面介绍资源相关的所有 REPL 功能。

## 注册表访问

### 获取所有资源

```clojure
(ns repl.core
  (:require [game.resource :as res]))

;; 获取所有资源
(def all-resources (res/all-resources))
(res/resource-count)  ;; 资源总数
```

### 按键获取特定资源

```clojure
;; 获取石头资源
(def stone (res/stone))

;; 获取木材资源
(def wood (res/wood))

;; 获取牲畜资源
(def livestock (res/livestock))

;; 按键获取任意资源
(def bread (res/get-resource "BREAD"))
(def tool (res/get-resource "TOOL"))
```

## 资源属性查询

### 基本信息

```clojure
;; 获取资源键
(res/resource-key stone)  ;; "STONE"

;; 获取资源名称
(res/resource-name stone)  ;; "Stone"

;; 获取资源描述
(res/resource-desc stone)

;; 获取资源类别
(res/resource-category stone)  ;; 0-9 的整数
```

**资源类别**:
- `0-2`: 基础材料(石头、木头等)
- `3-4`: 加工产品
- `5-6`: 食物和饮品
- `7-9`: 高级物品和稀有资源

### 经济属性

```clojure
;; 获取腐烂速率(每年腐烂的百分比)
(res/resource-degrade-speed bread)  ;; 例如: 0.01 表示每年腐烂 1%

;; 获取价格上限
(res/resource-price-cap bread)

;; 获取价格乘数
(res/resource-price-mul bread)
```

## 资源组

### 可开采资源

```clojure
;; 获取所有可开采资源
(def minables (res/minable-list))

;; 查看可开采资源名称
(map res/resource-name minables)
```

可开采资源包括:
- 石头
- 各种矿物(铁、铜、金等)
- 特殊资源(宝石、水晶)

### 可种植资源

```clojure
;; 获取所有可种植作物
(def growables (res/growable-list))

(map res/resource-name growables)
```

可种植资源包括:
- 谷物(小麦、大麦等)
- 蔬菜
- 水果
- 特殊作物(香料、药材)

### 饮品和食物

```clojure
;; 获取所有饮品
(def drinks (res/drink-list))

;; 获取所有食物
(def edibles (res/edible-list))

;; 检查特定资源是否可饮用
(res/drinkable? (res/get-resource "ALE"))  ;; true
(res/drinkable? stone)  ;; false

;; 检查是否可食用
(res/edible? bread)  ;; true
(res/edible? wood)  ;; false
```

## 数据导出

### 转换为 Map

```clojure
;; 单个资源转换为 map
(res/resource->map stone)

;; 可开采资源转换为 map
(def minable-map (res/minable->map (first minables)))

;; 可种植资源转换为 map
(def growable-map (res/growable->map (first growables)))
```

### 批量导出

```clojure
;; 所有资源转换为 maps
(def all-resources-maps (res/all-resources-as-maps))

;; 所有可开采资源
(def all-minables-maps (res/all-minables-as-maps))

;; 所有可种植资源
(def all-growables-maps (res/all-growables-as-maps))

;; 所有饮品
(def all-drinks-maps (res/all-drinks-as-maps))

;; 所有食物
(def all-edibles-maps (res/all-edibles-as-maps))
```

## 实用示例

### 示例 1: 查看所有资源概览

```clojure
(defn resources-overview []
  {:total (res/resource-count)
   :minables (count (res/minable-list))
   :growables (count (res/growable-list))
   :drinks (count (res/drink-list))
   :edibles (count (res/edible-list))})

(resources-overview)
```

### 示例 2: 按类别统计资源

```clojure
(defn count-by-category []
  (let [all-res (res/all-resources)]
    (->> all-res
         (map res/resource-category)
         frequencies)))

(count-by-category)
```

示例输出:
```clojure
{0 12
 1 8
 2 15
 3 10
 4 6
 5 20
 6 5
 7 3
 8 2
 9 1}
```

### 示例 3: 找出腐烂最快的食物

```clojure
(defn find-fastest-rotting []
  (->> (res/edible-list)
       (map #(vector % (res/resource-name %) (res/resource-degrade-speed %)))
       (filter #(> (nth % 2) 0))
       (sort-by #(nth % 2) >)
       (take 5)))

(find-fastest-rotting)
```

### 示例 4: 导出所有资源数据

```clojure
(defn export-all-resources []
  (let [data (res/all-resources-as-maps)
        filename "resources-export.edn"]
    (spit filename (pr-str data))
    (println (format "Exported %d resources to %s" (count data) filename))))

(export-all-resources)
```

### 示例 5: 查找特定类型的资源

```clojure
(defn find-resources-by-name-part [name-part]
  (->> (res/all-resources)
       (filter #(clojure.string/includes?
                 (clojure.string/lower-case (res/resource-name %))
                 (clojure.string/lower-case name-part)))
       (map #(vector % (res/resource-name %)))))

;; 查找所有带 "stone" 的资源
(find-resources-by-name-part "stone")

;; 查找所有带 "metal" 的资源
(find-resources-by-name-part "metal")
```

### 示例 6: 分析食物链

```clojure
(defn analyze-food-chain []
  (let [raw-foods (filter #(and (res/edible? %)
                               (or (zero? (res/resource-category %))
                                   (= 1 (res/resource-category %))))
                         (res/all-resources))
        processed-foods (filter #(and (res/edible? %)
                                     (> (res/resource-category %) 1))
                              (res/all-resources))]
    {:raw-foods (map res/resource-name raw-foods)
     :raw-count (count raw-foods)
     :processed-foods (map res/resource-name processed-foods)
     :processed-count (count processed-foods)}))

(analyze-food-chain)
```

### 示例 7: 价格分析

```clojure
(defn analyze-prices []
  (->> (res/all-resources)
       (map (fn [r]
              {:name (res/resource-name r)
               :key (res/resource-key r)
               :price-cap (res/resource-price-cap r)
               :price-mul (res/resource-price-mul r)}))
       (sort-by :price-cap >)
       (take 10)))

(analyze-prices)
```

### 示例 8: 资源保质期排序

```clojure
(defn sort-by-shelf-life []
  (->> (res/edible-list)
       (map (fn [r]
              {:name (res/resource-name r)
               :degrade-speed (res/resource-degrade-speed r)
               :shelf-life-years (if (> (res/resource-degrade-speed r) 0)
                                  (/ 1 (res/resource-degrade-speed r))
                                  :infinite)}))
       (sort-by :degrade-speed)))

(sort-by-shelf-life)
```

## 高级功能

### 资源依赖分析

```clojure
(defn find-resource-dependencies []
  (let [all-res (res/all-resources)]
    (->> all-res
         (map (fn [r]
                {:key (res/resource-key r)
                 :name (res/resource-name r)
                 :category (res/resource-category r)
                 :edible (res/edible? r)
                 :drinkable (res/drinkable? r)
                 :degrade-rate (res/resource-degrade-speed r)}))
         (group-by :category))))

(find-resource-dependencies)
```

### 资源价值评分

```clojure
(defn score-resources []
  (->> (res/all-resources)
       (map (fn [r]
              (let [price (res/resource-price-cap r)
                    degrade (res/resource-degrade-speed r)
                    edible? (res/edible? r)
                    drinkable? (res/drinkable? r)]
                {:name (res/resource-name r)
                 :key (res/resource-key r)
                 :price price
                 :edible edible?
                 :drinkable drinkable?
                 :perishable (> degrade 0)
                 :score (+ price
                          (if edible? 50 0)
                          (if drinkable? 30 0)
                          (if (> degrade 0) 10 0))})))
       (sort-by :score >)
       (take 15))))

(score-resources)
```

### 资源分类导出

```clojure
(defn export-categorized-resources []
  (let [categories {0 "Basic Materials"
                   1 "Raw Materials"
                   2 "Processed Materials"
                   3 "Basic Goods"
                   4 "Luxury Goods"
                   5 "Food"
                   6 "Drinks"
                   7 "Advanced Items"
                   8 "Rare Resources"
                   9 "Legendary Items"}
        categorized (->> (res/all-resources)
                         (group-by (fn [r]
                                     (res/resource-category r)))
                         (map (fn [[cat-num resources]]
                                {:category-number cat-num
                                 :category-name (categories cat-num "Unknown")
                                 :resources (map (fn [r]
                                                   {:key (res/resource-key r)
                                                    :name (res/resource-name r)
                                                    :edible (res/edible? r)
                                                    :drinkable (res/drinkable? r)})
                                                 resources)})))]
    (spit "categorized-resources.edn" (pr-str categorized))
    {:status :ok
     :categories-count (count categorized)}))

(export-categorized-resources)
```

### 特定资源查找

```clojure
;; 查找所有不可腐烂的食物
(defn non-perishable-foods []
  (->> (res/edible-list)
       (filter #(zero? (res/resource-degrade-speed %)))
       (map res/resource-name)))

(non-perishable-foods)

;; 查找所有高价饮品
(defn expensive-drinks []
  (->> (res/drink-list)
       (filter #(< 2.0 (res/resource-price-cap %)))
       (map res/resource-name)))

(expensive-drinks)
```

## 注意事项

1. **资源键稳定性**: 资源键(如 "WOOD", "STONE")通常是稳定的,但不应硬编码在关键逻辑中。

2. **腐烂速率**: 腐烂速率为 0 的资源不会腐烂,正值表示每年腐烂的百分比。

3. **价格属性**: 价格上限和乘数影响游戏中的贸易和物品价值。

4. **类别系统**: 类别是资源的重要组织方式,同一类别的资源通常有相似的用途。

5. **数据导出**: 批量导出函数会处理大量数据,注意内存使用。

6. **语言依赖**: 资源名称和描述受游戏语言设置影响,使用键进行程序化处理更可靠。

## 相关文章

- [建筑与房间](/blog-posts/building-room/)
- [仓库管理](/blog-posts/warehouse-management/)
- [科技系统](/blog-posts/technology-system/)
