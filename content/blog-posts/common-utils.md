:page/title 公共工具 - 实用函数与转换
:blog-post/tags [:songs-of-syx :clojure :common]
:blog-post/author {:person/id :jan}
:page/body

## 概述

公共工具提供了处理 Java 集合、坐标聚焦和获取建筑材料的实用函数。这些工具简化了游戏数据操作和常用任务。本文将全面介绍公共工具相关的所有功能。

## 数组转换

### ArrayList 转换

```clojure
(ns repl.core
  (:require [game.common :as c]))

;; ArrayList 转换为 vector
(def java-list (java.util.ArrayList.))
(.add java-list "item1")
(.add java-list "item2")

(c/array-list->vec java-list)  ;; => ["item1" "item2"]
```

### ArrayListResize 转换

```clojure
;; ArrayListResize 转换为 vector
(def resizable-list (settlement.util.ArrayListResize.))

(c/array-list-resize->vec resizable-list)
```

## 坐标聚焦

### 聚焦到坐标

```clojure
;; 聚焦到指定坐标
(c/focus {:cX 100 :cY 150})
```

### 聚焦到实体

```clojure
;; 聚焦到实体(小人、动物等)
(def some-entity (first (humanoid/all-entities)))
(c/focus-entity some-entity)
```

## 建筑材料

### 获取建筑材料

```clojure
;; 获取建筑材料
(def wood-material (c/get-building-material "WOOD"))
(def stone-material (c/get-building-material "STONE"))
```

## 实用示例

### 示例 1: 批量聚焦

```clojure
(defn tour-locations [locations]
  (doseq [[x y] locations]
    (c/focus {:cX x :cY y})
    (Thread/sleep 2000)))  ;; 停留 2 秒

;; 巡航多个位置
(tour-locations [[100 100] [200 150] [150 200]])
```

### 示例 2: 聚焦到不同实体

```clojure
(defn focus-on-entities [entity-fn]
  (doseq [entity (entity-fn)]
    (c/focus-entity entity)
    (Thread/sleep 1000)))

;; 聚焦到所有小人
(focus-on-entities humanoid/all-entities)
```

### 示例 3: 材料批量处理

```clojure
(defn process-materials [material-names]
  (->> material-names
       (map c/get-building-material)
       (map #(vector (:name %) (:count %)))))

(process-materials ["WOOD" "STONE" "IRON"])
```

### 示例 4: 聚焦循环

```clojure
(defn focus-loop [locations]
  (loop [locations locations]
    (when (seq locations)
      (let [[x y] (first locations)]
        (c/focus {:cX x :cY y})
        (Thread/sleep 1000)
        (recur (rest locations))))))

(focus-loop [[100 100] [200 150] [150 200]])
```

### 示例 5: 实体选择器

```clojure
(defn select-and-focus [selector-fn]
  (let [entities (selector-fn)
        selected (first entities)]
    (when selected
      (c/focus-entity selected)
      {:focused (:id selected)})))

;; 聚焦到第一个小
(select-and-focus humanoid/all-entities)
```

### 示例 6: 材料清单

```clojure
(defn material-checklist [materials]
  (let [available (map c/get-building-material materials)]
    {:requested materials
     :available (map :name available)
     :all-available? (= (count materials) (count available))}))

(material-checklist ["WOOD" "STONE" "GOLD"])
```

### 示例 7: 智能聚焦

```clojure
(defn smart-focus [target-condition]
  (if (vector? target-condition)
    (apply c/focus {:cX (first target-condition) :cY (second target-condition)})
    (let [entity (target-condition)]
      (c/focus-entity entity))))

;; 聚焦到坐标或实体
(smart-focus [100 150])
(smart-focus (first (humanoid/all-entities)))
```

### 示例 8: 集合处理

```clojure
(defn process-java-collections [collections]
  (->> collections
       (map c/array-list->vec)
       (map #(str "Processed: " (clojure.string/join ", " %)))))

(process-java-collections [list1 list2 list3])
```

## 注意事项

1. **聚焦延迟**: 聚焦操作可能有视觉延迟,建议添加短暂暂停。
2. **实体有效性**: 聚焦到实体前确保实体仍然存在。
3. **材料键**: 材料名称("WOOD", "STONE")需要准确匹配。
4. **集合转换**: Java 集合转换会创建新对象,注意内存使用。
5. **线程安全**: 在循环中使用聚焦时考虑游戏主线程。

## 相关文章

- [REPL 工具](/blog-posts/repl-utils/)
- [相机控制](/blog-posts/camera-control/)
