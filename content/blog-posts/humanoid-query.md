:page/title 人口与小人 - REPL 查询与数据导出
:blog-post/tags [:songs-of-syx :clojure :humanoid]
:blog-post/author {:person/id :jan}
:page/body

## 概述

人口是《Songs of Syx》中最核心的元素之一。通过 REPL 接口,你可以查询所有小人实体、获取详细信息、导出友谊关系数据。本教程将介绍所有相关函数的使用方法。

## 查询所有小人实体

### 获取所有小人

```clojure
(ns repl.core
  (:require [game.humanoid :as human]))

;; 获取所有小人实体
(def all-humans (human/all-entities))
(count all-humans)  ;; 查看小人总数
```

`humanoid/all-entities` 返回一个 Java `ArrayList`,包含定居点中的所有小人实体。

### 获取小人详细信息

```clojure
;; 获取第一个小人的详细信息
(def first-human (first all-humans))
(def info (human/humanoid-info first-human))

;; 查看返回的信息结构
(keys info)
```

`humanoid-info` 返回一个 map,包含以下信息:

| 字段 | 类型 | 描述 |
|------|------|------|
| `:age` | number | 年龄(天数) |
| `:death-date` | number/nil | 死亡日期,存活时为 nil |
| `:adult?` | boolean | 是否成年 |
| `:health-danger?` | boolean | 是否处于危险状态 |
| `:health-cold?` | boolean | 是否寒冷 |
| `:health-injured?` | boolean | 是否受伤 |
| `:name` | string | 姓名 |
| `:name-surname` | string | 姓氏 |
| `:name-given` | string | 名字 |
| `:name-title` | string | 称号 |
| `:profession-category` | string | 职业类别 |
| `:race` | Race | 种族对象 |
| `:race-name` | string | 种族名称 |
| `:friendships` | list | 友谊关系列表 |

## 健康状态查询

### 检查健康指标

```clojure
;; 查询所有处于危险状态的小人
(filter #(-> % human/humanoid-info :health-danger?) all-humans)

;; 查询所有寒冷的小人
(filter #(-> % human/humanoid-info :health-cold?) all-humans)

;; 查询所有受伤的小人
(filter #(-> % human/humanoid-info :health-injured?) all-humans)

;; 统计各状态数量
(defn count-by-health-state [humans]
  {:danger (count (filter #(-> % human/humanoid-info :health-danger?) humans))
   :cold (count (filter #(-> % human/humanoid-info :health-cold?) humans))
   :injured (count (filter #(-> % human/humanoid-info :health-injured?) humans))})

(count-by-health-state all-humans)
```

## 职业与人口统计

### 按职业分类统计

```clojure
;; 统计每个职业类别的人数
(defn count-by-profession [humans]
  (->> humans
       (map #(-> % human/humanoid-info :profession-category))
       frequencies))

(count-by-profession all-humans)
```

示例输出:
```clojure
{"FARMER" 45
 "WORKER" 30
 "SOLDIER" 15
 "PRIEST" 5
 "SLAVE" 20}
```

### 成年人口统计

```clojure
;; 统计成年人口
(defn count-adults [humans]
  (count (filter #(-> % human/humanoid-info :adult?) humans)))

(defn count-minors [humans]
  (count (filter #(not (-> % human/humanoid-info :adult?)) humans)))

{:adults (count-adults all-humans)
 :minors (count-minors all-humans)}
```

## 友谊关系导出

### 导出所有友谊关系

```clojure
;; 导出所有小人的友谊关系为 EDN 格式
(def friendships-data (human/friendship-edn))

;; 保存到文件
(spit "friendships.edn" friendships-data)

;; 查看导出的数据结构
(first friendships-data)
```

`friendship-edn` 返回一个列表,每个元素代表一个小人的友谊关系:

```clojure
[{:humanoid-id 12345
  :name "John Smith"
  :friendships [{:with-id 12346 :value 0.75 :name "Jane Doe"}
                {:with-id 12347 :value 0.30 :name "Bob Johnson"}]}
 ;; ... 更多小人
]
```

### 分析友谊网络

```clojure
;; 找到最受欢迎的小人(友谊最多)
(defn find-most-popular [friendships]
  (->> friendships
       (map #(vector (:name %) (count (:friendships %))))
       (sort-by second >)
       first))

(find-most-popular friendships-data)
```

## 完整示例:人口报告生成

```clojure
(ns repl.population-report
  (:require [game.humanoid :as human]))

(defn generate-population-report []
  (let [all-humans (human/all-entities)
        total (count all-humans)
        adults (count (filter #(-> % human/humanoid-info :adult?) all-humans))
        minors (- total adults)
        professions (frequencies (map #(-> % human/humanoid-info :profession-category) all-humans))
        health-states {:danger (count (filter #(-> % human/humanoid-info :health-danger?) all-humans))
                      :cold (count (filter #(-> % human/humanoid-info :health-cold?) all-humans))
                      :injured (count (filter #(-> % human/humanoid-info :health-injured?) all-humans))}
        friendships (human/friendship-edn)]

    {:total total
     :adults adults
     :minors minors
     :professions professions
     :health health-states
     :friendships-count (count friendships)}))

;; 生成报告
(generate-population-report)
```

## 常见用例

### 用例 1: 查找所有士兵

```clojure
(def soldiers
  (filter #(= "SOLDIER"
              (-> % human/humanoid-info :profession-category))
          (human/all-entities)))
```

### 用例 2: 查找年龄最小的小人

```clojure
(defn youngest-human [humans]
  (->> humans
       (map #(vector % (-> % human/humanoid-info :age)))
       (sort-by second)
       first))

(youngest-human (human/all-entities))
```

### 用例 3: 导出死亡小人列表

```clojure
(def dead-humans
  (->> (human/all-entities)
       (filter #(-> % human/humanoid-info :death-date))
       (map human/humanoid-info)))

(spit "dead-humans.edn" (pr-str dead-humans))
```

## 注意事项

1. **性能考虑**: 当人口数量很大时(数千人),`all-entities` 可能会消耗较多内存。建议在查询后及时处理,避免保留过多引用。

2. **数据更新**: REPL 中获取的数据是快照,游戏运行时数据会实时变化。如需实时数据,需要在每次查询时重新调用函数。

3. **友好度范围**: 友谊值通常在 -1.0 到 1.0 之间,1.0 表示最好的朋友,-1.0 表示敌对。

4. **职业类别**: 职业名称是硬编码的字符串,与游戏内部类名对应。

## 相关文章

- [动物查询与管理](/blog-posts/animal-query/)
- [建筑与房间](/blog-posts/building-room/)
- [仓库管理](/blog-posts/warehouse-management/)
