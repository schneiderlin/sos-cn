:page/title 宗教系统 - 信仰与对立关系
:blog-post/tags [:songs-of-syx :clojure :religion]
:blog-post/author {:person/id :jan}
:page/body

## 概述

宗教是《Songs of Syx》中影响人口幸福感和派系关系的信仰系统。每个宗教都有独特的神祇、传播倾向和加成效果,宗教之间还有复杂对立关系。通过 REPL,你可以查询所有宗教、分析对立矩阵、管理宗教传播。本文将全面介绍宗教相关的所有 REPL 功能。

## 注册表访问

### 获取所有宗教

```clojure
(ns repl.core
  (:require [game.religion :as rel]))

;; 获取所有宗教
(def all-religions (rel/all-religions))
(rel/religion-count)  ;; 宗教总数
```

### 获取宗教 Map

```clojure
;; 获取宗教 map(键为宗教键)
(def religion-map (rel/religion-map))

;; 从 map 中获取特定宗教
(get religion-map "CRATOR")
(get religion-map "AETHE")
```

### 按键获取宗教

```clojure
;; 获取特定宗教
(def crator (rel/get-religion "CRATOR"))
(def athe (rel/get-religion "AETHE"))
```

## 宗教属性

### 基本信息

```clojure
;; 获取宗教键
(rel/religion-key crator)  ;; "CRATOR"

;; 获取宗教名称
(rel/religion-name crator)

;; 获取宗教描述
(rel/religion-desc crator)
```

### 神祇信息

```clojure
;; 获取神祇名称
(rel/religion-deity crator)  ;; 例如: "Crator"
```

### 传播倾向

```clojure
;; 获取传播倾向(0.0-1.0)
(rel/religion-inclination crator)
```

传播倾向决定宗教向其他人口传播的速度和范围:
- **低倾向**: 传播缓慢,稳定
- **高倾向**: 传播快速,容易扩散

### 宗教加成

```clojure
;; 获取宗教提供的加成列表
(rel/religion-boosts crator)
```

宗教加成可能包括:
- 幸福度加成
- 特定行为加成
- 派系关系修正

## 宗教对立关系

### 两个宗教之间的对立

```clojure
;; 获取两个宗教的对立值(0.0-1.0)
(rel/religion-opposition crator athe)
```

对立值说明:
- `0.0`: 相同宗教,无冲突
- `0.3`: 轻微对立
- `0.5`: 中度对立
- `0.7`: 严重对立
- `1.0`: 最大对立,极端冲突

### 获取所有对立关系

```clojure
;; 获取与所有其他宗教的对立关系
(rel/all-oppositions crator)
```

返回一个 map,键为其他宗教,值为对立程度。

### 获取完整对立矩阵

```clojure
;; 获取所有宗教之间的完整对立矩阵
(rel/get-opposition-matrix)
```

返回一个嵌套 map,包含所有宗教对之间的对立值。

## 数据导出

### 转换为 Map

```clojure
;; 宗教基本信息转换为 map
(rel/religion->map crator)

;; 宗教基本信息(简化版)
(rel/religion->map-basic crator)
```

### 批量导出

```clojure
;; 所有宗教转换为 maps
(rel/all-religions-as-maps)

;; 所有宗教基本信息
(rel/all-religions-basic)
```

## 查询函数

### 按传播倾向排序

```clojure
(rel/religions-by-inclination)
```

返回按传播倾向从高到低排序的宗教列表。

### 找到最对立的宗教

```clojure
;; 找到与指定宗教最对立的宗教
(rel/find-most-opposed crator)
```

### 找到最不对立的宗教

```clojure
;; 找到与指定宗教最兼容的宗教
(rel/find-least-opposed crator)
```

## 实用示例

### 示例 1: 宗教概览

```clojure
(defn religions-overview []
  {:total (rel/religion-count)
   :religions (map (fn [r]
                     {:name (rel/religion-name r)
                      :key (rel/religion-key r)
                      :deity (rel/religion-deity r)
                      :inclination (rel/religion-inclination r)})
                  (rel/all-religions))})

(religions-overview)
```

### 示例 2: 按传播倾向分类

```clojure
(defn categorize-by-inclination []
  (let [religions (rel/all-religions)]
    {:high-inclination (filter #(> (rel/religion-inclination %) 0.7) religions)
     :medium-inclination (filter #(and (<= (rel/religion-inclination %) 0.7)
                                      (>= (rel/religion-inclination %) 0.3))
                             religions)
     :low-inclination (filter #(< (rel/religion-inclination %) 0.3) religions)}))

(categorize-by-inclination)
```

### 示例 3: 导出所有宗教数据

```clojure
(defn export-all-religions []
  (let [data (rel/all-religions-as-maps)
        filename "religions-export.edn"]
    (spit filename (pr-str data))
    (println (format "Exported %d religions to %s" (count data) filename))))

(export-all-religions)
```

### 示例 4: 宗教对立矩阵分析

```clojure
(defn analyze-opposition-matrix []
  (let [matrix (rel/get-opposition-matrix)
        religions (rel/all-religions)]
    {:matrix-size (count religions)
     :opposition-count (->> (for [r1 religions
                                   r2 religions
                                   :when (not= r1 r2)]
                                (rel/religion-opposition r1 r2))
                             count)
     :average-opposition (/ (->> (for [r1 religions
                                        r2 religions
                                        :when (not= r1 r2)]
                                     (rel/religion-opposition r1 r2))
                                  (reduce + 0))
                          (count (for [r1 religions
                                      r2 religions
                                      :when (not= r1 r2)])))}))

(analyze-opposition-matrix)
```

### 示例 5: 找出最冲突的宗教对

```clojure
(defn find-most-opposed-pairs []
  (let [religions (rel/all-religions)
        pairs (for [r1 religions
                     r2 religions
                     :when (< (.indexOf religions r1)
                              (.indexOf religions r2))]
                  [r1 r2])]
    (->> pairs
         (map (fn [[r1 r2]]
                {:religion1 (rel/religion-name r1)
                 :religion2 (rel/religion-name r2)
                 :opposition (rel/religion-opposition r1 r2)}))
         (sort-by :opposition >)
         (take 5))))

(find-most-opposed-pairs)
```

### 示例 6: 找出最兼容的宗教对

```clojure
(defn find-least-opposed-pairs []
  (let [religions (rel/all-religions)
        pairs (for [r1 religions
                     r2 religions
                     :when (< (.indexOf religions r1)
                              (.indexOf religions r2))]
                  [r1 r2])]
    (->> pairs
         (map (fn [[r1 r2]]
                {:religion1 (rel/religion-name r1)
                 :religion2 (rel/religion-name r2)
                 :opposition (rel/religion-opposition r1 r2)}))
         (sort-by :opposition)
         (take 5))))

(find-least-opposed-pairs)
```

### 示例 7: 宗教传播分析

```clojure
(defn analyze-spread-potential []
  (->> (rel/all-religions)
       (map (fn [r]
              {:name (rel/religion-name r)
               :inclination (rel/religion-inclination r)
               :boosts (rel/religion-boosts r)}))
       (sort-by :inclination >)))

(analyze-spread-potential)
```

### 示例 8: 宗教冲突网络

```clojure
(defn build-conflict-network []
  (let [religions (rel/all-religions)]
    (into {}
          (for [r1 religions]
            [(:key (rel/religion->map r1))
             (->> religions
                  (map (fn [r2]
                         [(:key (rel/religion->map r2))
                          (rel/religion-opposition r1 r2)]))
                  (into {}))])))))

(build-conflict-network)
```

## 高级功能

### 宗教影响力评分

```clojure
(defn score-religions []
  (->> (rel/all-religions)
       (map (fn [r]
              {:name (rel/religion-name r)
               :key (rel/religion-key r)
               :inclination (rel/religion-inclination r)
               :opposition-sum (reduce + 0
                                      (rel/all-oppositions r))
               :boost-count (count (rel/religion-boosts r))
               :score (+ (rel/religion-inclination r)
                         (* -0.5 (reduce + 0 (rel/all-oppositions r)))
                         (* 10 (count (rel/religion-boosts r)))})))
       (sort-by :score >)))

(score-religions)
```

### 宗教聚类分析

```clojure
(defn cluster-religions-by-opposition [threshold]
  (let [religions (rel/all-religions)
        visited (atom #{})
        clusters (atom [])]
    (doseq [r1 religions]
      (when-not (contains? @visited r1)
        (let [compatible (filter #(and (not (contains? @visited %))
                                     (< (rel/religion-opposition r1 %) threshold))
                             religions)]
          (swap! visited into compatible)
          (swap! clusters conj (map rel/religion-name compatible)))))
    @clusters))

;; 对立值小于 0.3 的宗教聚为一组
(cluster-religions-by-opposition 0.3)
```

### 宗教加成汇总

```clojure
(defn summarize-religion-boosts []
  (->> (rel/all-religions)
       (map (fn [r]
              {:name (rel/religion-name r)
               :deity (rel/religion-deity r)
               :boosts (rel/religion-boosts r)}))))

(summarize-religion-boosts)
```

### 宗教友好度推荐

```clojure
(defn recommend-friendly-religions [target-religion-key]
  (let [target (rel/get-religion target-religion-key)]
    (->> (rel/all-religions)
         (filter #(not= target-religion-key (rel/religion-key %)))
         (map (fn [r]
                {:name (rel/religion-name r)
                 :opposition (rel/religion-opposition target r)}))
         (sort-by :opposition)
         (take 3))))

;; 推荐与 "CRATOR" 友好的宗教
(recommend-friendly-religions "CRATOR")
```

## 宗教管理策略

### 多宗教定居点

在多宗教定居点中,管理宗教对立是关键:

1. **分离对立宗教**: 将高度对立的宗教人口分配到不同区域
2. **平衡传播**: 避免单一宗教过度传播导致冲突
3. **提供中立空间**: 在对立宗教之间建立公共设施
4. **监控对立指标**: 定期检查宗教对立值,预防冲突

### 宗教传播优化

根据传播倾向调整策略:

1. **高倾向宗教**: 允许自然传播,不需要过多干预
2. **低倾向宗教**: 通过神庙和祭司主动推广
3. **平衡传播**: 确保所有宗教都有足够的传播空间

## 注意事项

1. **宗教键稳定性**: 宗教键(如 "CRATOR", "AETHE")通常是稳定的。

2. **对立影响**: 高对立值的宗教之间会有更多冲突和幸福度惩罚。

3. **传播倾向**: 高传播倾向的宗教会更快地扩散到其他人口。

4. **宗教加成**: 不同宗教提供不同的加成,根据策略选择。

5. **人口管理**: 定居点中多种族和宗教会增加复杂度。

6. **数据更新**: 宗教数据可能在游戏更新时变化。

7. **对立矩阵**: 对立关系是双向的,但对立值可能不对称。

## 相关文章

- [种族系统](/blog-posts/race-system/)
- [加成系统](/blog-posts/booster-system/)
- [科技系统](/blog-posts/technology-system/)
