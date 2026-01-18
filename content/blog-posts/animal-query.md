:page/title 动物查询与狩猎管理 - REPL 指南
:blog-post/tags [:songs-of-syx :clojure :animal]
:blog-post/author {:person/id :jan}
:page/body

## 概述

动物系统是《Songs of Syx》中的重要组成部分。通过 REPL,你可以查询所有动物、获取物种信息、标记狩猎目标、查找最近的目标动物等。本文将详细介绍所有动物相关的 REPL 函数。

## 查询动物

### 获取所有动物

```clojure
(ns repl.core
  (:require [game.animal :as anim]))

;; 获取所有动物
(def all-animals (anim/all-animals))
(count all-animals)  ;; 查看动物总数
```

### 按类型分类查询

```clojure
;; 获取所有野生动物
(def wild-animals (anim/wild-animals))

;; 获取所有驯化动物
(def domesticated-animals (anim/domesticated-animals))

;; 获取所有动物物种
(def all-species (anim/all-animal-species))

(count wild-animals)
(count domesticated-animals)
(count all-species)
```

野生动物包括鹿、野猪、狼等自然生成的动物,驯化动物包括牲畜如牛、羊、马等。

## 按位置查询

### 按瓦片坐标查询

```clojure
;; 获取指定瓦片上的动物(使用瓦片坐标)
(def animals-at-tile (anim/animals-at-tile 100 150))

;; 获取指定像素坐标上的动物
(def animals-at-point (anim/animals-at-point 3200 4800))
```

**注意**: `animals-at-tile` 使用的是游戏内部的瓦片坐标,`animals-at-point` 使用像素坐标。两者的转换关系通常是: `pixel = tile * 32`。

### 查询附近动物

```clojure
;; 获取指定实体附近半径内的动物
(def entity (first (humanoid/all-entities)))  ;; 假设从人口中获取一个小人
(def nearby-animals (anim/animals-near entity 10.0))  ;; 半径 10.0
```

`animals-near` 接受一个实体对象和半径值,返回该范围内的所有动物。

## 动物信息查询

### 获取单个动物信息

```clojure
(def first-animal (first all-animals))

;; 获取动物基本信息
(def animal-info (anim/animal-info first-animal))
(keys animal-info)
```

`animal-info` 返回的 map 包含:

| 字段 | 类型 | 描述 |
|------|------|------|
| `:name` | string | 动物名称 |
| `:species` | string | 物种名称 |
| `:wild?` | boolean | 是否为野生动物 |
| `:health` | number | 健康值 |
| `:x` | number | X 坐标 |
| `:y` | number | Y 坐标 |

### 获取物种信息

```clojure
;; 获取动物所属的物种信息
(def species-info (anim/species-info first-animal))

;; 查看物种属性
(keys species-info)
```

`species-info` 包含物种级别的属性:

| 字段 | 类型 | 描述 |
|------|------|------|
| `:key` | string | 物种唯一键 |
| `:name` | string | 物种名称 |
| `:description` | string | 物种描述 |
| `:wild?` | boolean | 是否为野生动物 |
| `:tamable?` | boolean | 是否可驯化 |
| `:edible?` | boolean | 肉是否可食用 |

### 查询可狩猎资源

```clojure
;; 获取狩猎该动物可获得的资源
(def resources (anim/animal-resources first-animal))

;; 示例输出
;; [{:key "MEAT" :name "Meat" :amount 15}
;;  {:key "LEATHER" :name "Leather" :amount 3}]
```

`animal-resources` 返回一个列表,包含可以获得的资源及其数量。

## 狩猎管理

### 标记单个动物为狩猎目标

```clojure
;; 找到一个野生动物
(def wild-animal (first (anim/wild-animals)))

;; 标记为狩猎目标
(anim/mark-animal-for-hunt wild-animal)
```

### 取消狩猎标记

```clojure
;; 取消狩猎标记
(anim/unmark-animal-from-hunt wild-animal)
```

### 批量标记区域内的动物

```clojure
;; 标记中心在 (100, 100), 半径 20 范围内的所有野生动物
(anim/hunt-animals-in-area 100 100 20)
```

`hunt-animals-in-area` 会自动筛选该范围内的野生动物并标记为狩猎目标。

### 查找最近的可狩猎动物

```clojure
;; 查找距离指定瓦片最近的野生动物
(def nearest-wild (anim/find-nearest-wild-animal 100 150))

(nearest-wild ? (anim/animal-info nearest-wild) nil)
```

`find-nearest-wild-animal` 返回最近野生动物的实体,如果没有找到则返回 `nil`。

## 实用示例

### 示例 1: 统计野生动物数量

```clojure
(defn count-by-species [animals]
  (->> animals
       (map #(anim/species-info %))
       (map :name)
       frequencies))

(count-by-species (anim/wild-animals))
```

示例输出:
```clojure
{"Deer" 25
 "Boar" 12
 "Wolf" 5
 "Fox" 8}
```

### 示例 2: 找出所有肉可食用的野生动物

```clojure
(defn edible-wild-animals []
  (filter #(-> % anim/animal-resources first :name (= "Meat"))
          (anim/wild-animals)))

(edible-wild-animals)
```

### 示例 3: 自动狩猎最近的 5 只鹿

```clojure
(defn auto-hunt-deer [count]
  (let [all-wild (anim/wild-animals)
        deer (filter #(= "Deer" (-> % anim/species-info :name))
                     all-wild)
        sorted-by-distance (sort-by (fn [a]
                                      (let [info (anim/animal-info a)]
                                        (+ (* (:x info) (:x info))
                                           (* (:y info) (:y info)))))
                                    deer)
        to-hunt (take count sorted-by-distance)]
    (doseq [deer to-hunt]
      (anim/mark-animal-for-hunt deer))
    (count to-hunt)))

(auto-hunt-deer 5)  ;; 标记最近的 5 只鹿
```

### 示例 4: 检查狩猎目标完成情况

```clojure
(defn hunt-completion-check []
  (let [all-animals (anim/all-animals)
        total-wild (count (filter #(-> % anim/species-info :wild?)
                                  all-animals))
        alive-wild (count (filter #(and (-> % anim/species-info :wild?)
                                       (-> % anim/animal-info :health (> 0)))
                                  all-animals))]
    {:total total-wild
     :alive alive-wild
     :dead (- total-wild alive-wild)}))

(hunt-completion-check)
```

### 示例 5: 在定居点周围建立狩猎区

```clojure
(defn mark-hunting-zone [center-x center-y radius]
  (let [wild-in-zone (filter #(let [info (anim/animal-info %)]
                                (let [dx (- (:x info) (* center-x 32))
                                      dy (- (:y info) (* center-y 32))]
                                  (< (+ (* dx dx) (* dy dy))
                                     (* radius radius 32 32))))
                              (anim/wild-animals))]
    (doseq [animal wild-in-zone]
      (anim/mark-animal-for-hunt animal))
    {:marked (count wild-in-zone)}))

;; 在定居点中心(100, 100)周围 25 瓦片建立狩猎区
(mark-hunting-zone 100 100 25)
```

## 高级功能

### 按物种查询特定动物

```clojure
(defn find-animals-by-species [species-name]
  (filter #(= species-name (-> % anim/species-info :name))
          (anim/all-animals)))

;; 查找所有狼
(def wolves (find-animals-by-species "Wolf"))
```

### 计算动物群集

```clojure
(defn find-animal-clusters [distance-threshold]
  (let [animals (anim/wild-animals)
        visited (atom #{})
        clusters (atom [])]
    (doseq [animal animals]
      (when-not (contains? @visited animal)
        (let [info (anim/animal-info)
              cluster (filter #(let [a-info (anim/animal-info %)
                                     x-dx (- (:x a-info) (:x info))
                                     y-dy (- (:y a-info) (:y info))]
                                 (< (+ (* x-dx x-dx) (* y-dx y-dx))
                                    (* distance-threshold distance-threshold)))
                             animals)]
          (swap! visited into cluster)
          (swap! clusters conj cluster))))
    @clusters))

;; 查找聚集在 5 瓦片范围内的动物群
(find-animal-clusters 5)
```

### 资源价值估算

```clojure
(defn estimate-hunt-value [animal]
  (let [resources (anim/animal-resources animal)
        species (anim/species-info animal)]
    {:species (:name species)
     :resources (map :name resources)
     :total-amount (reduce + 0 (map :amount resources))
     :wild? (:wild? species)}))

;; 估算狩猎的价值
(map estimate-hunt-value (take 5 (anim/wild-animals)))
```

## 注意事项

1. **坐标系统**: 注意区分瓦片坐标和像素坐标,转换因子通常是 32。

2. **状态实时性**: 动物位置和状态会实时变化,如果需要精确数据应该在操作时重新查询。

3. **狩猎优先级**: 标记为狩猎目标的动物会被猎人优先攻击,但如果不在范围内可能不会被立即狩猎。

4. **性能考虑**: 当动物数量很多时,频繁查询可能会影响游戏性能。建议在批处理时使用缓存。

5. **安全性**: 某些野生动物(如狼)可能具有攻击性,接近时需要小心。

## 相关文章

- [人口与小人查询](/blog-posts/humanoid-query/)
- [仓库管理](/blog-posts/warehouse-management/)
- [采集与清理](/blog-posts/harvest-clear/)
