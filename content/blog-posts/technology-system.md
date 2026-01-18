:page/title 科技系统 - 科技树与成本分析
:blog-post/tags [:songs-of-syx :clojure :technology]
:blog-post/author {:person/id :jan}
:page/body

## 概述

科技系统是《Songs of Syx》解锁新功能、建筑和加成的核心机制。通过 REPL,你可以查询所有科技、分析科技树结构、了解成本需求、跟踪科技依赖关系。本文将全面介绍科技相关的所有 REPL 功能。

## 注册表访问

### 获取所有科技

```clojure
(ns repl.core
  (:require [game.tech :as t]))

;; 获取所有科技
(def all-techs (t/all-techs))
(t/tech-count)  ;; 科技总数
```

### 获取科技树

```clojure
;; 获取所有科技树
(def all-trees (t/all-trees))
(t/tree-count)  ;; 科技树数量

;; 获取所有科技货币类型
(def all-costs (t/all-costs))
```

科技树是科技的分组,每个科技树代表一个研究领域(如农业、工业、军事等)。

## 科技属性查询

### 基本信息

```clojure
;; 获取第一个科技
(def first-tech (first all-techs))

;; 获取科技键
(t/tech-key first-tech)  ;; 例如: "CIVIL_SLAVE", "AGRI_FARM"

;; 获取科技名称
(t/tech-name first-tech)

;; 获取科技描述
(t/tech-desc first-tech)
```

### 科技等级

```clojure
;; 获取最大等级
(t/tech-level-max first-tech)  ;; 例如: 5, 10, 20

;; 科技可以有多个等级,每级都需要研究和支付成本
```

## 科技成本

### 总成本

```clojure
;; 获取科技总成本
(t/tech-cost-total first-tech)
```

### 成本明细

```clojure
;; 获取成本列表
(def costs (t/tech-costs first-tech))
```

`tech-costs` 返回一个列表,每个元素包含:
- 货币类型(知识、金钱、劳动力等)
- 数量
- 等级要求

示例:
```clojure
[{:currency "KNOWLEDGE" :amount 100 :level 1}
 {:currency "MONEY" :amount 50 :level 1}
 {:currency "KNOWLEDGE" :amount 200 :level 2}]
```

## 科技依赖关系

### 前置需求

```clojure
;; 获取科技需求列表
(def requirements (t/tech-requirements first-tech))
```

`tech-requirements` 返回需要在研究当前科技之前先完成的其他科技。

### 科技加成

```clojure
;; 获取科技提供的加成
(t/tech-boosters first-tech)
```

科技加成可能是:
- 提高生产效率
- 解锁新建筑
- 提供资源加成
- 改善人口属性

## 科技树属性

### 科技树信息

```clojure
;; 获取第一个科技树
(def first-tree (first all-trees))

;; 获取科技树键
(t/tree-key first-tree)

;; 获取科技树名称
(t/tree-name first-tree)

;; 获取科技树中的所有科技
(def techs-in-tree (t/tree-techs first-tree))

;; 获取科技树行数(层级)
(t/tree-rows first-tree)
```

## 数据导出

### 转换为 Map

```clojure
;; 科技转换为 map
(t/tech->map first-tech)

;; 科技树转换为 map
(t/tree->map first-tree)

;; 科技树完整信息
(t/tree->map-full first-tree)
```

### 批量导出

```clojure
;; 所有科技转换为 maps
(t/all-techs-as-maps)

;; 所有科技树转换为 maps
(t/all-trees-as-maps)

;; 所有科技树完整信息
(t/all-trees-full)
```

## 查询函数

### 按科技树分组

```clojure
;; 科技按树分组
(t/techs-by-tree)
```

### 查找无需求的科技(根科技)

```clojure
(t/techs-with-no-requirements)
```

这些科技是科技树的起点,可以直接研究。

### 查找需要特定科技的科技

```clojure
;; 找到需要指定科技才能研究的科技
(def dependents (t/techs-requiring first-tech))
```

## 实用示例

### 示例 1: 科技树概览

```clojure
(defn tech-overview []
  {:total-techs (t/tech-count)
   :total-trees (t/tree-count)
   :trees (map (fn [tree]
                 {:name (t/tree-name tree)
                  :tech-count (count (t/tree-techs tree))})
               (t/all-trees))})

(tech-overview)
```

示例输出:
```clojure
{:total-techs 85
 :total-trees 8
 :trees [{:name "Civilization" :tech-count 15}
         {:name "Agriculture" :tech-count 12}
         {:name "Industry" :tech-count 18}
         {:name "Military" :tech-count 14}
         {:name "Economy" :tech-count 10}
         {:name "Religion" :tech-count 6}
         {:name "Science" :tech-count 7}
         {:name "Society" :tech-count 3}]}
```

### 示例 2: 查找可以立即研究的科技

```clojure
(defn available-techs []
  (let [no-reqs (t/techs-with-no-requirements)]
    (map (fn [tech]
           {:key (t/tech-key tech)
            :name (t/tech-name tech)
            :max-level (t/tech-level-max tech)
            :total-cost (t/tech-cost-total tech)})
         no-reqs)))

(available-techs)
```

### 示例 3: 导出所有科技数据

```clojure
(defn export-all-techs []
  (let [techs (t/all-techs-as-maps)
        filename "techs-export.edn"]
    (spit filename (pr-str techs))
    (println (format "Exported %d techs to %s" (count techs) filename))))

(export-all-techs)
```

### 示例 4: 分析科技成本

```clojure
(defn analyze-tech-costs []
  (->> (t/all-techs)
       (map (fn [tech]
              {:name (t/tech-name tech)
               :key (t/tech-key tech)
               :total-cost (t/tech-cost-total tech)
               :max-level (t/tech-level-max tech)
               :cost-per-level (/ (t/tech-cost-total tech)
                                   (t/tech-level-max tech))}))
       (sort-by :total-cost >)
       (take 10)))

(analyze-tech-costs)
```

### 示例 5: 科技依赖图

```clojure
(defn build-dependency-graph []
  (let [all-techs (t/all-techs)]
    (->> all-techs
         (map (fn [tech]
                {:key (t/tech-key tech)
                 :name (t/tech-name tech)
                 :requirements (map t/tech-key (t/tech-requirements tech))
                 :required-by (map t/tech-key (t/techs-requiring tech))}))
         (sort-by :name))))

(build-dependency-graph)
```

### 示例 6: 按科技树统计

```clojure
(defn stats-by-tree []
  (let [trees (t/all-trees)]
    (map (fn [tree]
           {:name (t/tree-name tree)
            :key (t/tree-key tree)
            :techs (count (t/tree-techs tree))
            :rows (t/tree-rows tree)
            :avg-techs-per-row (/ (count (t/tree-techs tree))
                                    (t/tree-rows tree))})
         trees)))

(stats-by-tree)
```

### 示例 7: 查找高价值科技

```clojure
(defn find-high-value-techs [threshold]
  (->> (t/all-techs)
       (filter #(< threshold (t/tech-cost-total %)))
       (map (fn [tech]
              {:name (t/tech-name tech)
               :cost (t/tech-cost-total tech)
               :level (t/tech-level-max tech)
               :boosters (count (t/tech-boosters tech))}))
       (sort-by :cost >)))

(find-high-value-techs 500)
```

### 示例 8: 科技研究路径建议

```clojure
(defn suggest-research-path []
  (let [root-techs (t/techs-with-no-requirements)]
    (->> root-techs
         (map (fn [tech]
                {:name (t/tech-name tech)
                 :cost (t/tech-cost-total tech)
                 :boosters (t/tech-boosters tech)
                 :unlocks (map t/tech-name (t/techs-requiring tech))}))
         (sort-by :cost))))

(suggest-research-path)
```

## 高级功能

### 科技树可视化数据

```clojure
(defn prepare-tree-visualization []
  (let [trees (t/all-trees)]
    (map (fn [tree]
           {:name (t/tree-name tree)
            :key (t/tree-key tree)
            :rows (t/tree-rows tree)
            :techs (->> (t/tree-techs tree)
                        (map (fn [tech]
                               {:key (t/tech-key tech)
                                :name (t/tech-name tech)
                                :level (t/tech-level-max tech)
                                :cost (t/tech-cost-total tech)
                                :requirements (map t/tech-key
                                                (t/tech-requirements tech))
                                :boosters (t/tech-boosters tech)})))})
         trees)))

(prepare-tree-visualization)
```

### 成本优化分析

```clojure
(defn cost-optimization-analysis []
  (let [all-techs (t/all-techs)
        total-cost (reduce + 0 (map t/tech-cost-total all-techs))
        max-cost (apply max (map t/tech-cost-total all-techs))
        avg-cost (/ total-cost (count all-techs))]
    {:total-cost total-cost
     :max-cost max-cost
     :avg-cost avg-cost
     :most-expensive (->> all-techs
                          (sort-by t/tech-cost-total >)
                          first
                          t/tech-name)
     :cheapest (->> all-techs
                     (sort-by t/tech-cost-total)
                     first
                     t/tech-name)}))

(cost-optimization-analysis)
```

### 科技加成汇总

```clojure
(defn summarize-boosters []
  (->> (t/all-techs)
       (mapcat t/tech-boosters)
       (map :type)
       frequencies))

(summarize-boosters)
```

### 多层级科技分析

```clojure
(defn analyze-multi-level-techs []
  (->> (t/all-techs)
       (filter #(< 1 (t/tech-level-max %)))
       (map (fn [tech]
              {:name (t/tech-name tech)
               :max-level (t/tech-level-max tech)
               :total-cost (t/tech-cost-total tech)
               :cost-per-level (/ (t/tech-cost-total tech)
                                   (t/tech-level-max tech))}))
       (sort-by :max-level >)
       (take 10)))

(analyze-multi-level-techs)
```

## 注意事项

1. **科技键稳定性**: 科技键(如 "CIVIL_SLAVE")通常是稳定的,但不应硬编码在关键逻辑中。

2. **成本货币**: 不同科技可能使用不同的货币类型(知识、金钱、劳动力等),注意区分。

3. **等级系统**: 某些科技可以升级多次,每级都有独立的成本和加成。

4. **依赖关系**: 科技依赖关系形成有向无环图(DAG),研究时必须按顺序完成前置科技。

5. **数据更新**: 科技数据可能在游戏更新时发生变化,建议在使用前重新查询。

6. **性能考虑**: 批量导出函数会处理大量数据,在科技数量很多时可能需要较长时间。

## 相关文章

- [建筑与房间](/blog-posts/building-room/)
- [加成系统](/blog-posts/booster-system/)
- [资源系统](/blog-posts/resource-system/)
