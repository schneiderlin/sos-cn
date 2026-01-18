:page/title 种族系统 - 物理属性与人口管理
:blog-post/tags [:songs-of-syx :clojure :race]
:blog-post/author {:person/id :jan}
:page/body

## 概述

种族是《Songs of Syx》中决定小人属性、能力和偏好最重要的系统之一。每个种族都有独特的物理特征、人口动态、食物偏好和种族关系。通过 REPL,你可以查询所有种族、分析物理属性、了解人口增长率、查看偏好关系。本文将全面介绍种族相关的所有 REPL 功能。

## 注册表访问

### 获取所有种族

```clojure
(ns repl.core
  (:require [game.race :as r]))

;; 获取所有种族
(def all-races (r/all-races))
(r/race-count)  ;; 种族总数
```

### 获取可玩种族

```clojure
;; 获取可玩种族
(def playable (r/playable-races))
```

### 按键获取种族

```clojure
;; 获取猪人
(def pigman (r/get-race "PIGMAN"))

;; 获取人类
(def human (r/get-race "HUMAN"))

;; 获取其他种族
(def dwarf (r/get-race "DWARF"))
(def elf (r/get-race "ELF"))
```

## 种族信息

### 基本信息

```clojure
;; 获取种族名称
(r/race-name pigman)

;; 获取种族描述
(r/race-desc pigman)

;; 获取长描述
(r/race-desc-long pigman)
```

### 优缺点

```clojure
;; 获取优势列表
(r/race-pros pigman)

;; 获取劣势列表
(r/race-cons pigman)
```

## 物理属性

### 身体特征

```clojure
;; 获取高度
(r/race-height pigman)  ;; 例如: 1.8 表示 1.8 米

;; 获取碰撞箱大小
(r/race-hitbox-size pigman)  ;; 返回 [width height]

;; 获取成年所需天数
(r/race-adult-at pigman)  ;; 例如: 50 表示 50 天成年
```

### 行为特征

```clojure
;; 检查是否需要睡觉
(r/race-sleeps? pigman)  ;; true/false
```

## 经济价值

### 奴隶与突袭

```clojure
;; 获取奴隶价格
(r/race-slave-price pigman)  ;; 购买奴隶的成本

;; 获取突袭价值
(r/race-raiding-value pigman)  ;; 突袭时获得的价值
```

## 人口属性

### 人口动态

```clojure
;; 获取人口增长率
(r/race-pop-growth pigman)  ;; 例如: 0.05 表示每天增长 5%

;; 获取最大人口分数
(r/race-pop-max pigman)  ;; 人口上限系数

;; 获取移民率
(r/race-immigration-rate pigman)  ;; 自然移民的概率
```

### 偏好系统

```clojure
;; 获取气候偏好
(r/race-climate-preferences pigman)
```

气候偏好可能包括:
- 温度(冷/热)
- 湿度(干/湿)
- 地形(森林/平原/山地)

```clojure
;; 获取地形偏好
(r/race-terrain-preferences pigman)
```

## 食物与饮品偏好

### 偏好食物

```clojure
;; 获取偏好的食物列表
(r/race-preferred-foods pigman)
```

### 偏好饮品

```clojure
;; 获取偏好的饮品列表
(r/race-preferred-drinks pigman)
```

## 种族关系

### 对立关系

```clojure
;; 获取最厌恶的种族
(r/race-most-hated pigman)
```

### 种族关系图

```clojure
;; 获取与其他所有种族的关系
(r/race-relations pigman)
```

## 数据导出

### 转换为 Map

```clojure
;; 种族基本信息转换为 map
(r/race->map pigman)

;; 种族完整信息
(r/race->map-full pigman)
```

### 批量导出

```clojure
;; 所有种族转换为 maps
(r/all-races-as-maps)

;; 所有种族完整信息
(r/all-races-full)
```

## 查询函数

### 按可玩性分组

```clojure
(r/races-by-playability)
```

### 按奴隶价格排序

```clojure
(r/races-sorted-by-slave-price)
```

### 按名称查找

```clojure
;; 按显示名称查找
(r/find-race-by-name "Pigman")
(r/find-race-by-name "Human")
```

## 实用示例

### 示例 1: 种族概览

```clojure
(defn races-overview []
  {:total (r/race-count)
   :playable (count (r/playable-races))
   :races (map (fn [race]
                 {:name (r/race-name race)
                  :key (r/race-key race)
                  :playable (:playable (r/race->map race))})
               (r/all-races))})

(races-overview)
```

### 示例 2: 物理属性比较

```clojure
(defn compare-physical-stats []
  (->> (r/all-races)
       (map (fn [race]
              {:name (r/race-name race)
               :height (r/race-height race)
               :adult-at (r/race-adult-at race)
               :sleeps (r/race-sleeps? race)}))
       (sort-by :height >)))

(compare-physical-stats)
```

### 示例 3: 人口增长分析

```clojure
(defn analyze-population-growth []
  (->> (r/all-races)
       (map (fn [race]
              {:name (r/race-name race)
               :growth-rate (r/race-pop-growth race)
               :immigration (r/race-immigration-rate race)
               :max-pop (r/race-pop-max race)}))
       (sort-by :growth-rate >)))

(analyze-population-growth)
```

### 示例 4: 经济价值分析

```clojure
(defn analyze-economic-value []
  (->> (r/all-races)
       (map (fn [race]
              {:name (r/race-name race)
               :slave-price (r/race-slave-price race)
               :raiding-value (r/race-raiding-value race)
               :ratio (/ (r/race-raiding-value race)
                          (r/race-slave-price race))}))
       (sort-by :slave-price >)))

(analyze-economic-value)
```

### 示例 5: 导出所有种族数据

```clojure
(defn export-all-races []
  (let [data (r/all-races-full)
        filename "races-export.edn"]
    (spit filename (pr-str data))
    (println (format "Exported %d races to %s" (count data) filename))))

(export-all-races)
```

### 示例 6: 食物偏好汇总

```clojure
(defn food-preference-summary []
  (let [playable (r/playable-races)]
    (->> playable
         (map (fn [race]
                {:race (r/race-name race)
                 :preferred-foods (r/race-preferred-foods race)
                 :preferred-drinks (r/race-preferred-drinks race)})))))

(food-preference-summary)
```

### 示例 7: 种族关系分析

```clojure
(defn analyze-race-relations []
  (->> (r/all-races)
       (map (fn [race]
              {:name (r/race-name race)
               :most-hated (r/race-most-hated race)
               :relations (r/race-relations race)}))))

(analyze-race-relations)
```

### 示例 8: 气候适配性分析

```clojure
(defn analyze-climate-adaptation []
  (->> (r/all-races)
       (map (fn [race]
              {:name (r/race-name race)
               :climate-prefs (r/race-climate-preferences race)
               :terrain-prefs (r/race-terrain-preferences race)}))))

(analyze-climate-adaptation)
```

## 高级功能

### 种族综合评分

```clojure
(defn rate-races []
  (->> (r/all-races)
       (map (fn [race]
              (let [growth (r/race-pop-growth race)
                    height (r/race-height race)
                    slave-price (r/race-slave-price race)]
                {:name (r/race-name race)
                 :key (r/race-key race)
                 :growth growth
                 :height height
                 :slave-price slave-price
                 :score (+ (* growth 1000)
                           (* height 100)
                           (* slave-price 0.5))})))
       (sort-by :score >)
       (take 10)))

(rate-races)
```

### 种族对比报告

```clojure
(defn compare-races [race-keys]
  (let [races (map r/get-race race-keys)]
    (map (fn [race]
           {:name (r/race-name race)
            :height (r/race-height race)
            :adult-age (r/race-adult-at race)
            :growth (r/race-pop-growth race)
            :slave-price (r/race-slave-price race)
            :pros (r/race-pros race)
            :cons (r/race-cons race)})
         races)))

;; 比较人类和猪人
(compare-races ["HUMAN" "PIGMAN"])
```

### 种族环境匹配

```clojure
(defn find-races-for-climate [climate-type]
  (->> (r/all-races)
       (filter #(let [prefs (r/race-climate-preferences %)]
                  (some #(= climate-type (:type %)) prefs)))
       (map r/race-name)))

;; 查找适合寒冷气候的种族
(find-races-for-climate "COLD")
```

### 种族详细导出

```clojure
(defn export-detailed-races []
  (let [races (r/all-races)]
    (spit "races-detailed.edn"
          (pr-str
            (map (fn [race]
                   {:key (r/race-key race)
                    :name (r/race-name race)
                    :description (r/race-desc race)
                    :long-description (r/race-desc-long race)
                    :physical {:height (r/race-height race)
                              :hitbox (r/race-hitbox-size race)
                              :adult-age (r/race-adult-at race)
                              :sleeps (r/race-sleeps? race)}
                    :population {:growth (r/race-pop-growth race)
                               :max-pop (r/race-pop-max race)
                               :immigration (r/race-immigration-rate race)}
                    :economic {:slave-price (r/race-slave-price race)
                              :raiding-value (r/race-raiding-value race)}
                    :preferences {:foods (r/race-preferred-foods race)
                                :drinks (r/race-preferred-drinks race)
                                :climate (r/race-climate-preferences race)
                                :terrain (r/race-terrain-preferences race)}
                    :pros (r/race-pros race)
                    :cons (r/race-cons race)})
                 races)))))

(export-detailed-races)
```

## 注意事项

1. **种族键稳定性**: 种族键(如 "HUMAN", "PIGMAN")通常是稳定的,但不应硬编码在关键逻辑中。

2. **可玩性**: 某些种族可能不可玩,使用 `playable-races` 过滤可用的种族。

3. **偏好影响**: 食物和饮品偏好会影响小人幸福度,满足偏好可以提高幸福度。

4. **种族关系**: 种族对立关系会影响移民和外交,注意管理多种族定居点。

5. **人口增长**: 不同种族有不同的人口增长率,影响长期人口结构。

6. **经济平衡**: 奴隶价格和突袭价值反映种族的经济价值,可用于战略决策。

7. **环境适配**: 气候和地形偏好影响种族在特定环境下的幸福度和效率。

## 相关文章

- [人口与小人查询](/blog-posts/humanoid-query/)
- [科技系统](/blog-posts/technology-system/)
- [宗教系统](/blog-posts/religion-system/)
