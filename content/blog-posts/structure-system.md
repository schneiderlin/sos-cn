:page/title 结构系统 - 耐久度与建造材料
:blog-post/tags [:songs-of-syx :clojure :structure]
:blog-post/author {:person/id :jan}
:page/body

## 概述

结构是《Songs of Syx》中用于建造墙壁、地板和天花板的建筑材料。从简单的泥土到坚固的石头,每种结构都有不同的耐久度、建造时间和资源需求。通过 REPL,你可以查询所有结构、分析物理属性、了解资源需求。本文将全面介绍结构相关的所有 REPL 功能。

## 注册表访问

### 获取所有结构

```clojure
(ns repl.core
  (:require [game.structure :as strct]))

;; 获取所有结构
(def all-structures (strct/all-structures))
(strct/structure-count)  ;; 结构总数
```

### 按键获取结构

```clojure
;; 获取泥土结构
(strct/mud-structure)

;; 获取指定键的结构
(strct/get-structure "_WOOD")
(strct/get-structure "_STONE")
```

## 结构属性

### 基本信息

```clojure
(def first-structure (first all-structures))

;; 获取结构键
(strct/structure-key first-structure)  ;; 例如: "_WOOD"

;; 获取结构名称
(strct/structure-name first-structure)  ;; "Wood"

;; 获取结构描述
(strct/structure-desc first-structure)
```

### 墙壁和天花板名称

```clojure
;; 获取墙壁名称
(strct/structure-name-wall first-structure)

;; 获取天花板名称
(strct/structure-name-ceiling first-structure)
```

这些名称用于在游戏 UI 中显示。

### 物理属性

```clojure
;; 获取耐久度
(strct/structure-durability first-structure)  ;; 例如: 10.0

;; 获取建造时间
(strct/structure-construct-time first-structure)  ;; 例如: 2.0
```

## 资源需求

### 建造资源

```clojure
;; 获取所需资源
(strct/structure-resource first-structure)  ;; 返回资源对象

;; 获取资源数量
(strct/structure-resource-amount first-structure)  ;; 例如: 2
```

## 数据导出

### 转换为 Map

```clojure
;; 结构转换为 map
(strct/structure->map first-structure)
```

示例输出:
```clojure
{:key "_WOOD"
 :name "Wood"
 :description "Basic wooden structure..."
 :durability 10.0
 :construct-time 2.0
 :resource {:key "WOOD" :name "Wood"}
 :resource-amount 2}
```

### 批量导出

```clojure
;; 所有结构转换为 maps
(strct/all-structures-as-maps)
```

## 查询函数

### 按资源查找

```clojure
;; 查找使用特定资源的结构
(strct/find-structures-by-resource "WOOD")

;; 查找使用石头的结构
(strct/find-structures-by-resource "STONE")
```

### 按耐久度排序

```clojure
(strct/structure-by-durability)
```

返回按耐久度从高到低排序的所有结构。

### 按建造时间排序

```clojure
(strct/structure-by-construct-time)
```

返回按建造时间从短到长排序的所有结构。

## 实用示例

### 示例 1: 结构概览

```clojure
(defn structures-overview []
  {:total (strct/structure-count)
   :structures (map (fn [s]
                      {:name (strct/structure-name s)
                       :key (strct/structure-key s)
                       :durability (strct/structure-durability s)})
                    (strct/all-structures))})

(structures-overview)
```

### 示例 2: 按耐久度分类

```clojure
(defn categorize-by-durability []
  (let [structs (strct/all-structures)]
    {:low-durability (filter #(< (strct/structure-durability %) 5) structs)
     :medium-durability (filter #(and (>= (strct/structure-durability %) 5)
                                       (< (strct/structure-durability %) 15))
                            structs)
     :high-durability (filter #(>= (strct/structure-durability %) 15) structs)}))

(categorize-by-durability)
```

### 示例 3: 按建造时间分析

```clojure
(defn analyze-construct-time []
  (->> (strct/all-structures)
       (map (fn [s]
              {:name (strct/structure-name s)
               :key (strct/structure-key s)
               :construct-time (strct/structure-construct-time s)
               :resource (strct/structure-resource s)
               :amount (strct/structure-resource-amount s)}))
       (sort-by :construct-time)))

(analyze-construct-time)
```

### 示例 4: 按资源分组结构

```clojure
(defn group-by-resource []
  (let [structs (strct/all-structures)]
    (->> structs
         (group-by (fn [s]
                     (let [res (strct/structure-resource s)]
                       (strct/structure-key res)))))))

(group-by-resource)
```

### 示例 5: 导出所有结构数据

```clojure
(defn export-all-structures []
  (let [data (strct/all-structures-as-maps)
        filename "structures-export.edn"]
    (spit filename (pr-str data))
    (println (format "Exported %d structures to %s" (count data) filename))))

(export-all-structures)
```

### 示例 6: 找出最优性价比结构

```clojure
(defn find-best-value-structures []
  (->> (strct/all-structures)
       (map (fn [s]
              {:name (strct/structure-name s)
               :durability (strct/structure-durability s)
               :resource-amount (strct/structure-resource-amount s)
               :value-ratio (/ (strct/structure-durability s)
                              (strct/structure-resource-amount s))}))
       (sort-by :value-ratio >)
       (take 5)))

(find-best-value-structures)
```

### 示例 7: 结构资源成本分析

```clojure
(defn analyze-resource-costs []
  (let [structs (strct/all-structures)]
    (->> structs
         (group-by (fn [s]
                     (strct/structure-key (strct/structure-resource s))))
         (map (fn [[resource-key structs-of-type]]
                {:resource resource-key
                 :structure-count (count structs-of-type)
                 :total-amount (reduce + 0
                                    (map strct/structure-resource-amount
                                         structs-of-type))})))))

(analyze-resource-costs)
```

### 示例 8: 结构对比

```clojure
(defn compare-structures [keys]
  (let [structs (map strct/get-structure keys)]
    (map (fn [s]
           {:name (strct/structure-name s)
            :durability (strct/structure-durability s)
            :construct-time (strct/structure-construct-time s)
            :resource (strct/structure-name (strct/structure-resource s))
            :amount (strct/structure-resource-amount s)})
         structs)))

;; 对比泥土、木头、石头
(compare-structures ["_MUD" "_WOOD" "_STONE"])
```

## 高级功能

### 结构综合评分

```clojure
(defn rate-structures []
  (->> (strct/all-structures)
       (map (fn [s]
              (let [durability (strct/structure-durability s)
                    time (strct/structure-construct-time s)
                    cost (strct/structure-resource-amount s)]
                {:name (strct/structure-name s)
                 :key (strct/structure-key s)
                 :durability durability
                 :construct-time time
                 :cost cost
                 :score (+ durability (* -1 time) (* -0.5 cost))})))
       (sort-by :score >)
       (take 10)))

(rate-structures)
```

### 结构建造优先级建议

```clojure
(defn suggest-building-priority []
  (let [wood-structs (strct/find-structures-by-resource "WOOD")
        stone-structs (strct/find-structures-by-resource "STONE")]
    {:early-game (->> wood-structs
                    (sort-by strct/structure-durability >)
                    (take 3)
                    (map strct/structure-name))
     :mid-game (->> stone-structs
                  (sort-by strct/structure-durability >)
                  (take 3)
                  (map strct/structure-name))}))

(suggest-building-priority)
```

### 结构效率分析

```clojure
(defn analyze-structure-efficiency []
  (->> (strct/all-structures)
       (map (fn [s]
              {:name (strct/structure-name s)
               :durability (strct/structure-durability s)
               :time (strct/structure-construct-time s)
               :cost (strct/structure-resource-amount s)
               :efficiency-per-time (/ (strct/structure-durability s)
                                      (strct/structure-construct-time s))
               :efficiency-per-cost (/ (strct/structure-durability s)
                                      (strct/structure-resource-amount s))}))
       (sort-by :efficiency-per-cost >)))

(analyze-structure-efficiency)
```

## 结构类型说明

### 泥土结构 (_MUD)
- **耐久度**: 5.0
- **建造时间**: 1.0
- **资源**: 无
- **特点**: 最低耐久度,不需要资源,适合早期建造

### 木头结构 (_WOOD)
- **耐久度**: 10.0
- **建造时间**: 2.0
- **资源**: 2 木头
- **特点**: 中等耐久度,容易获取

### 石头结构 (_STONE)
- **耐久度**: 20.0
- **建造时间**: 3.0
- **资源**: 4 石头
- **特点**: 高耐久度,需要采石场

### 高级结构
- 可能有更高的耐久度和建造成本
- 需要特定的科技解锁
- 提供额外的加成

## 注意事项

1. **结构键**: 结构键通常以 "_" 开头(如 "_WOOD", "_STONE")。

2. **耐久度影响**: 耐久度影响结构的防御能力和被破坏的难易程度。

3. **建造时间**: 更高的耐久度通常需要更长的建造时间。

4. **资源需求**: 高级结构可能需要稀有资源或特定的加工材料。

5. **资源获取**: 在建造前确保有足够的资源储备。

6. **结构升级**: 某些结构可以通过科技升级到更强的版本。

7. **成本效益**: 考虑耐久度与资源成本的比率,选择最优结构。

## 相关文章

- [资源系统](/blog-posts/resource-system/)
- [建筑与房间](/blog-posts/building-room/)
- [仓库管理](/blog-posts/warehouse-management/)
