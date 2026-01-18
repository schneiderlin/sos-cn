:page/title 加成系统 - Boostables 与分类管理
:blog-post/tags [:songs-of-syx :clojure :booster]
:blog-post/author {:person/id :jan}
:page/body

## 概述

加成系统(Boostables)是《Songs of Syx》中影响游戏各个方面的属性修正系统。从物理属性(速度、健康)到战斗能力(攻击、防御),从行为特征(幸福、忠诚)到城市管理(维护、腐败),加成无处不在。通过 REPL,你可以查询所有加成、按类别分组、分析加成效果。本文将全面介绍加成相关的所有 REPL 功能。

## 注册表访问

### 获取所有加成

```clojure
(ns repl.core
  (:require [game.booster :as b]))

;; 获取所有加成
(def all-boostables (b/all-boostables))
(b/boostable-count)  ;; 加成总数
```

### 获取所有类别

```clojure
;; 获取所有加成类别
(def all-collections (b/all-collections))
(b/collection-count)  ;; 类别总数
```

### 按键获取加成

```clojure
;; 获取特定加成
(def speed-booster (b/get-boostable "PHYSICS_SPEED"))
(def attack-booster (b/get-boostable "BATTLE_OFFENCE"))
```

## 类别访问

### 预定义类别

```clojure
;; 物理加成类别
(def physics-category (b/physics-category))

;; 战斗加成类别
(def battle-category (b/battle-category))

;; 行为加成类别
(def behaviour-category (b/behaviour-category))

;; 活动加成类别
(def activity-category (b/activity-category))

;; 公民加成类别
(def civic-category (b/civic-category))

;; 贵族加成类别
(def noble-category (b/noble-category))

;; 房间加成类别
(def rooms-category (b/rooms-category))
```

## 特定加成

### 物理加成

```clojure
;; 速度加成
(b/physics-speed)

;; 耐力加成
(b/physics-stamina)

;; 健康加成
(b/physics-health)

;; 寿命加成
(b/physics-death-age)
```

### 战斗加成

```clojure
;; 攻击加成
(b/battle-offence)

;; 防御加成
(b/battle-defence)
```

### 行为和公民加成

```clojure
;; 幸福度加成
(b/behaviour-happiness)

;; 移民加成
(b/civic-immigration)
```

## 数据导出

### 转换为 Map

```clojure
;; 加成转换为 map
(b/boostable->map speed-booster)

;; 类别转换为 map
(b/category->map physics-category)

;; 类别完整信息
(b/category->map-full physics-category)
```

### 批量导出

```clojure
;; 所有加成转换为 maps
(b/all-boostables-as-maps)

;; 所有类别转换为 maps
(b/all-categories-as-maps)

;; 所有类别完整信息
(b/all-categories-full)
```

## 查询函数

### 按类别分组

```clojure
;; 加成按类别分组
(b/boostables-by-category)
```

示例输出:
```clojure
{:physics [#<Boostable PHYSICS_SPEED> ...]
 :battle [#<Boostable BATTLE_OFFENCE> ...]
 :behaviour [#<Boostable BEHAVIOUR_HAPPINESS> ...]
 ...}
```

### 按类型分组

```clojure
;; 按类型分组(settlement/world)
(b/boostables-by-type)
```

`settlement` 类型影响定居点内的实体,`world` 类型影响全球机制。

### 按前缀查找

```clojure
;; 查找前缀匹配的加成
(b/find-boostables-by-prefix "PHYSICS_")
(b/find-boostables-by-prefix "BATTLE_")
```

### 特定类别查询

```clojure
;; 所有物理加成
(b/physics-boostables)

;; 所有战斗加成
(b/battle-boostables)
```

## 实用示例

### 示例 1: 加成概览

```clojure
(defn boosters-overview []
  {:total (b/boostable-count)
   :collections (b/collection-count)
   :physics (count (b/physics-boostables))
   :battle (count (b/battle-boostables))})

(boosters-overview)
```

### 示例 2: 按类别统计加成

```clojure
(defn count-by-collection []
  (let [boostables (b/all-boostables)]
    (->> boostables
         (group-by :collection-key)
         (map (fn [[col-key boosters]]
                {:collection col-key
                 :count (count boosters)})))))

(count-by-collection)
```

### 示例 3: 物理加成分析

```clojure
(defn analyze-physics-boosters []
  (let [physics (b/physics-boostables)]
    (map b/boostable->map physics)))

(analyze-physics-boosters)
```

### 示例 4: 导出所有加成数据

```clojure
(defn export-all-boosters []
  (let [data (b/all-boostables-as-maps)
        filename "boosters-export.edn"]
    (spit filename (pr-str data))
    (println (format "Exported %d boosters to %s" (count data) filename))))

(export-all-boosters)
```

### 示例 5: 查找最大效果加成

```clojure
(defn find-max-effect-boosters []
  (->> (b/all-boostables)
       (map b/boostable->map)
       (filter :value)
       (sort-by :value >)
       (take 10)))

(find-max-effect-boosters)
```

### 示例 6: 战斗加成汇总

```clojure
(defn summarize-battle-boosters []
  (let [battle (b/battle-boostables)]
    (->> battle
         (map b/boostable->map)
         (map (fn [booster]
                {:key (:key booster)
                 :name (:name booster)
                 :value (:value booster)})))))

(summarize-battle-boosters)
```

### 示例 7: 类别详细导出

```clojure
(defn export-categories-detailed []
  (let [collections (b/all-categories-full)
        filename "booster-categories.edn"]
    (spit filename (pr-str collections))
    {:status :ok
     :categories (b/collection-count)}))

(export-categories-detailed)
```

### 示例 8: 按类型分组加成

```clojure
(defn group-by-type []
  (let [by-type (b/boostables-by-type)]
    {:settlement (count (:settlement by-type))
     :world (count (:world by-type))
     :total (b/boostable-count)}))

(group-by-type)
```

## 高级功能

### 加成效果分析

```clojure
(defn analyze-booster-effects []
  (->> (b/all-boostables)
       (map b/boostable->map)
       (group-by (fn [booster]
                   (if (< 0 (:value booster 0))
                     :positive
                     :negative)))
       (map (fn [[type boosters]]
              {:type type
               :count (count boosters)
               :total-effect (reduce + 0 (map :value boosters))}))))

(analyze-booster-effects)
```

### 房间加成汇总

```clojure
(defn summarize-room-boosters []
  (let [room-category (b/rooms-category)
        room-boosters (b/category->map-full room-category)]
    {:room-booster-count (count (:boostables room-boosters))
     :boostables (map b/boostable->map (:boostables room-boosters))}))

(summarize-room-boosters)
```

### 加成前缀分析

```clojure
(defn analyze-booster-prefixes []
  (let [all-boosters (b/all-boostables)]
    (->> all-boosters
         (map (fn [booster]
                (let [key (:key (b/boostable->map booster))]
                  (first (clojure.string/split key #"_")))))
         frequencies)))

(analyze-booster-prefixes)
```

### 贵族加成分析

```clojure
(defn analyze-noble-boosters []
  (let [noble-category (b/noble-category)
        noble-boosters (b/category->map-full noble-category)]
    (->> (:boostables noble-boosters)
         (map b/boostable->map)
         (sort-by :value >))))

(analyze-noble-boosters)
```

### 公民加成分析

```clojure
(defn analyze-civic-boosters []
  (let [civic-category (b/civic-category)
        civic-boosters (b/category->map-full civic-category)]
    {:immigration-booster (b/civic-immigration)
     :category-info civic-boosters}))

(analyze-civic-boosters)
```

### 行为加成分析

```clojure
(defn analyze-behaviour-boosters []
  (let [behaviour-category (b/behaviour-category)
        behaviour-boosters (b/category->map-full behaviour-category)
        happiness (b/behaviour-happiness)]
    {:happiness-booster happiness
     :all-behaviour (map b/boostable->map (:boostables behaviour-boosters))}))

(analyze-behaviour-boosters)
```

## 加成类别说明

### 物理加成 (Physics)
影响小人的身体属性:
- **速度** (PHYSICS_SPEED): 移动和行走速度
- **耐力** (PHYSICS_STAMINA): 工作持续时间
- **健康** (PHYSICS_HEALTH): 生命值和恢复速度
- **寿命** (PHYSICS_DEATH_AGE): 最大生存时间

### 战斗加成 (Battle)
影响战斗能力:
- **攻击** (BATTLE_OFFENCE): 造成伤害的能力
- **防御** (BATTLE_DEFENCE): 承受伤害的能力
- 士气、士气恢复等

### 行为加成 (Behaviour)
影响小人的行为和心理:
- **幸福** (BEHAVIOUR_HAPPINESS): 满意度水平
- 忠诚度、守法性等

### 公民加成 (Civic)
影响定居点管理:
- **移民** (CIVIC_IMMIGRATION): 新小人到达速度
- 维护效率、腐败率等

### 活动加成 (Activity)
影响特定活动:
- 哀悼效率
- 惩罚执行速度等

### 贵族加成 (Noble)
影响贵族阶层的特质:
- 攻击性、骄傲、慷慨等性格特质

### 房间加成 (Rooms)
影响特定房间的效果:
- 每个房间可以提供独特的加成
- 数量最多,超过 150 个

## 注意事项

1. **加成值**: 加成值可以是正数(增益)或负数(惩罚),注意区分。

2. **加成叠加**: 多个同类加成可能叠加,计算最终效果时需要考虑叠加规则。

3. **加成范围**: 某些加成影响特定实体,某些影响全局机制,注意区分。

4. **加成条件**: 某些加成可能需要特定条件才能生效(如需要特定房间)。

5. **数据更新**: 加成数据可能在游戏更新时发生变化,建议在使用前重新查询。

6. **性能考虑**: 批量导出函数会处理大量数据,在加成数量很多时可能需要较长时间。

7. **房间加成**: 房间加成数量庞大,查询时建议按特定前缀或类别筛选。

## 相关文章

- [科技系统](/blog-posts/technology-system/)
- [建筑与房间](/blog-posts/building-room/)
- [种族系统](/blog-posts/race-system/)
