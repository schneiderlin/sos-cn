:page/title 建筑与房间 - 蓝图查询与生产系统
:blog-post/tags [:songs-of-syx :clojure :building]
:blog-post/author {:person/id :jan}
:page/body

## 概述

建筑(在游戏中称为"房间")是《Songs of Syx》的核心建设元素。通过 REPL,你可以查询所有房间蓝图、获取房间详细信息、分析生产系统、导出房间数据。本文将全面介绍建筑与房间相关的所有 REPL 功能。

## 注册表访问

### 获取所有房间蓝图

```clojure
(ns repl.core
  (:require [game.building :as bldg]))

;; 获取所有房间蓝图
(def all-blueprints (bldg/all-blueprints))
(bldg/blueprint-count)  ;; 蓝图总数

;; 获取更详细的房间信息
(def all-blueprint-imps (bldg/all-blueprint-imps))
(bldg/blueprint-imp-count)  ;; 详细房间总数
```

`all-blueprints` 返回基本蓝图对象,`all-blueprint-imps` 返回包含更多实现细节的对象。

## 房间属性查询

### 获取房间基本信息

```clojure
;; 获取第一个房间
(def first-bp (first all-blueprints))

;; 获取房间唯一键
(bldg/blueprint-key first-bp)  ;; 例如: "FARM", "WAREHOUSE", "TAVERN"

;; 获取房间显示名称
(bldg/room-name first-bp)

;; 获取房间描述
(bldg/room-desc first-bp)

;; 获取房间类型
(bldg/room-type first-bp)  ;; 例如: "PRODUCTION", "SERVICE", "GOVERNMENT"

;; 获取子类别
(bldg/room-category-sub first-bp)
```

### 房间性能属性

```clojure
;; 获取退化率
(bldg/room-degrade-rate first-bp)

;; 获取房间加成
(bldg/room-bonus first-bp)
```

`room-degrade-rate` 表示房间随时间自然损坏的速度,`room-bonus` 是一个 map,包含该房间提供的各种加成。

## 建造者 (Furnisher) 属性

Furnisher 是控制房间建造的核心组件。

```clojure
;; 获取房间的建造者
(def furnisher (bldg/room-furnisher first-bp))

;; 获取资源数量
(bldg/furnisher-resource-count furnisher)

;; 获取指定索引的资源
(bldg/furnisher-resource furnisher 0)

;; 检查是否使用区域建造
(bldg/furnisher-uses-area? furnisher)

;; 检查是否必须室内
(bldg/furnisher-must-be-indoors? furnisher)

;; 检查是否必须室外
(bldg/furnisher-must-be-outdoors? furnisher)
```

**建造类型说明**:
- **区域建造**: 房间可以在任意大小区域建造(如农场、仓库)
- **固定尺寸**: 房间有固定的大小(如水井、壁炉)
- **室内/室外**: 某些房间有环境要求

## 工业生产属性

生产房间(如熔炉、工坊)包含生产逻辑。

```clojure
;; 检查房间是否有生产
(bldg/room-has-industries? first-bp)

;; 获取生产列表
(def industries (bldg/room-industries first-bp))

;; 获取第一个生产的输入
(def first-ind (first industries))
(bldg/industry-inputs first-ind)

;; 获取输出
(bldg/industry-outputs first-ind)

;; 获取生产速率
(bldg/industry-resource-rate first-ind)
```

**示例**: 熔炉的生产数据

```clojure
;; 假设 furnace 是一个熔炉房间
(def furnace (bldg/find-room-by-key "SMELTER"))
(def furnace-ind (first (bldg/room-industries furnace)))

;; 查看生产链
{:inputs (bldg/industry-inputs furnace-ind)
 :outputs (bldg/industry-outputs furnace-ind)
 :rates (map bldg/industry-resource-rate (bldg/room-industries furnace))}
```

## 数据导出

### 转换为 Clojure Map

```clojure
;; 房间图标信息
(bldg/room-icon-info first-bp)

;; Furnisher 转换为 map
(bldg/furnisher->map furnisher)

;; Industry 转换为 map
(bldg/industry->map first-ind)

;; 房间完整信息转换为 map
(bldg/room-imp->map first-bp)
```

### 批量导出

```clojure
;; 所有房间转换为 maps
(def all-rooms-as-maps (bldg/all-rooms-as-maps))

;; 按类别分组
(def rooms-by-category (bldg/rooms-by-category))

;; 按类型分组
(def rooms-by-type (bldg/rooms-by-type))

;; 获取所有生产房间
(bldg/production-rooms)

;; 生产房间转换为 maps
(bldg/production-rooms-as-maps)
```

## 查询函数

### 按键查找房间

```clojure
;; 按唯一键查找
(def warehouse (bldg/find-room-by-key "WAREHOUSE"))
(def farm (bldg/find-room-by-key "FARM"))
(def tavern (bldg/find-room-by-key "TAVERN"))
```

### 按类型查找

```clojure
;; 查找所有生产类型的房间
(bldg/find-rooms-by-type "PRODUCTION")

;; 查找所有服务类型的房间
(bldg/find-rooms-by-type "SERVICE")

;; 查找所有政府类型的房间
(bldg/find-rooms-by-type "GOVERNMENT")
```

### 按生产资源查找

```clojure
;; 查找生产指定资源的房间
(bldg/find-rooms-producing "BREAD")

;; 查找消耗指定资源的房间
(bldg/find-rooms-consuming "FLOUR")
```

这可以用来分析资源生产链:

```clojure
;; 追踪小麦到面包的生产链
(defn trace-production-chain [resource]
  {:producers (bldg/find-rooms-producing resource)
   :consumers (bldg/find-rooms-consuming resource)})

(trace-production-chain "BREAD")
```

## 实用示例

### 示例 1: 导出所有房间数据

```clojure
(ns repl.export-buildings
  (:require [game.building :as bldg]))

(defn export-all-rooms []
  (let [rooms (bldg/all-rooms-as-maps)
        filename "rooms-export.edn"]
    (spit filename (pr-str rooms))
    (println (format "Exported %d rooms to %s" (count rooms) filename))))

(export-all-rooms)
```

### 示例 2: 按类别统计房间数量

```clojure
(defn count-rooms-by-category []
  (->> (bldg/all-blueprints)
       (map bldg/room-category-sub)
       frequencies))

(count-rooms-by-category)
```

示例输出:
```clojure
{"AGRICULTURE" 8
 "INDUSTRY" 15
 "SERVICE" 12
 "GOVERNMENT" 6
 "HEALTH" 5
 "RELIGION" 4}
```

### 示例 3: 分析生产链

```clojure
(defn analyze-production-chain [output-resource]
  (let [producers (bldg/find-rooms-producing output-resource)
        input-rooms (->> producers
                        (mapcat #(-> % bldg/room-industries))
                        (mapcat bldg/industry-inputs)
                        (map :key)
                        distinct
                        (map bldg/find-rooms-consuming))]
    {:output-resource output-resource
     :producers (count producers)
     :producer-names (map bldg/room-name producers)
     :input-resources (->> producers
                           (mapcat #(-> % bldg/room-industries))
                           (mapcat bldg/industry-inputs)
                           (map :key)
                           distinct)
     :rooms-needed-for-inputs input-rooms}))

(analyze-production-chain "BREAD")
```

### 示例 4: 查找退化率最高的房间

```clojure
(defn find-fastest-degrading []
  (->> (bldg/all-blueprints)
       (map #(vector %
                     (bldg/room-name %)
                     (bldg/room-degrade-rate %)))
       (filter #(> (nth % 2) 0))
       (sort-by #(nth % 2) >)
       (take 5)))

(find-fastest-degrading)
```

### 示例 5: 导出生产房间详情

```clojure
(defn export-production-rooms []
  (let [rooms (bldg/production-rooms-as-maps)]
    (->> rooms
         (map #(select-keys % [:key :name :type :category
                               :industries :bonus]))
         (spit "production-rooms.edn" (pr-str)))))

(export-production-rooms)
```

### 示例 6: 查找可以建造的房间

```clojure
(defn list-buildable-rooms []
  (->> (bldg/all-blueprints)
       (filter #(-> % bldg/furnisher bldg/furnisher-uses-area? not))
       (map #(vector %
                     (bldg/room-name %)
                     (bldg/room-type %)
                     (-> % bldg/furnisher bldg/furnisher-resource-count)))))

(list-buildable-rooms)
```

## 高级功能

### 房间加成分析

```clojure
(defn analyze-room-bonuses []
  (->> (bldg/all-rooms-as-maps)
       (map (fn [room]
              {:name (:name room)
               :bonus-count (count (keys (:bonus room)))
               :bonuses (keys (:bonus room))}))
       (sort-by :bonus-count >)
       (take 10)))

(analyze-room-bonuses)
```

### 资源依赖图

```clojure
(defn build-resource-dependency-graph []
  (let [production-rooms (bldg/production-rooms)]
    (->> production-rooms
         (mapcat (fn [room]
                   (let [industries (bldg/room-industries room)]
                     (for [ind industries
                           :let [outputs (map :key (bldg/industry-outputs ind))
                                 inputs (map :key (bldg/industry-inputs ind))
                                 room-name (bldg/room-name room)]]
                       {:room room-name
                        :outputs outputs
                        :inputs inputs}))))
         (map #(vector (:room %)
                      (into {} (for [in (:inputs %)]
                                 [in (vec (:outputs %))]))))
         (into {}))))

(build-resource-dependency-graph)
```

### 房间规模估算

```clojure
(defn estimate-room-sizes []
  (->> (bldg/all-blueprints)
       (map (fn [bp]
              {:name (bldg/room-name bp)
               :key (bldg/blueprint-key bp)
               :furnisher-uses-area (-> bp bldg/room-furnisher bldg/furnisher-uses-area?)
               :resource-count (-> bp bldg/room-furnisher bldg/furnisher-resource-count)}))))

(estimate-room-sizes)
```

## 注意事项

1. **数据更新**: 房间数据在游戏过程中可能会有更新(如通过模组或补丁),建议在使用前重新查询。

2. **性能考虑**: `all-rooms-as-maps` 等批量导出函数会处理大量数据,在房间数量很多时可能需要较长时间。

3. **键的稳定性**: 房间键(如 "FARM", "WAREHOUSE")通常是稳定的,但不应硬编码在关键逻辑中。

4. **生产复杂性**: 某些房间可能有多个生产(industries),每个都有不同的输入输出组合。

5. **本地化**: 房间名称和描述可能受游戏语言设置影响,使用键进行程序化处理更可靠。

## 相关文章

- [资源系统](/blog-posts/resource-system/)
- [仓库创建](/blog-posts/warehouse-creation/)
- [农场系统](/blog-posts/farm-system/)
