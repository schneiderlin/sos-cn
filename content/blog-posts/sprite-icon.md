:page/title 精灵与图标 - 房间图标管理
:blog-post/tags [:songs-of-syx :clojure :sprite]
:blog-post/author {:person/id :jan}
:page/body

## 概述

精灵和图标是《Songs of Syx》中管理房间和物品视觉表示的核心系统。通过 REPL,你可以获取房间图标、检查图标尺寸、判断图标类型。本文将全面介绍精灵与图标相关的所有 REPL 功能。

## 图标访问

### 获取房间图标

```clojure
(ns repl.core
  (:require [game.sprite :as s]
            [game.building :as bldg]))

;; 获取房间图标
(def room (first (bldg/all-blueprints)))
(def icon (s/room-icon room))
```

### 获取大图标

```clojure
;; 获取房间大图标(32x32)
(s/room-icon-big room)
```

## 图标属性

### 获取图标尺寸

```clojure
;; 获取图标原始尺寸
(s/icon-size icon)  ;; 例如: {:width 32 :height 32}
```

### 获取尺寸关键字

```clojure
;; 获取图标尺寸关键字
(s/icon-size-key icon)  ;; :small/:medium/:large
```

尺寸关键字说明:
- `:small` - 小图标
- `:medium` - 中等图标
- `:large` - 大图标

### 获取图块索引

```clojure
;; 获取图块索引
(s/icon-tile-index icon)  ;; 整数索引值
```

### 检查复合图标

```clojure
;; 检查是否为复合图标
(s/icon-is-composite? icon)  ;; true/false
```

复合图标由多个基础图标组合而成。

## 完整图标信息

### 获取房间图标完整信息

```clojure
;; 获取房间图标完整信息
(s/room-icon-info room)
```

返回包含所有图标属性的完整 map。

## 实用示例

### 示例 1: 导出所有房间图标

```clojure
(defn export-all-room-icons []
  (let [rooms (bldg/all-blueprints)]
    (->> rooms
         (map s/room-icon-info)
         (map #(select-keys % [:key :name :size-key :is-composite]))
         (spit "room-icons.edn" (pr-str)))))

(export-all-room-icons)
```

### 示例 2: 按图标尺寸分类房间

```clojure
(defn classify-rooms-by-icon-size []
  (let [rooms (bldg/all-blueprints)]
    (->> rooms
         (group-by #(-> % s/room-icon s/icon-size-key))
         (map (fn [[size-key rooms]]
                {:size-key size-key
                 :count (count rooms)})))))

(classify-rooms-by-icon-size)
```

### 示例 3: 查找复合图标房间

```clojure
(defn find-composite-icon-rooms []
  (->> (bldg/all-blueprints)
       (filter #(-> % s/room-icon s/icon-is-composite?))
       (map bldg/room-name)))

(find-composite-icon-rooms)
```

### 示例 4: 图标尺寸统计

```clojure
(defn analyze-icon-sizes []
  (let [rooms (bldg/all-blueprints)]
    (->> rooms
         (map s/room-icon)
         (map s/icon-size)
         (frequencies))))

(analyze-icon-sizes)
```

### 示例 5: 图标类型分布

```clojure
(defn icon-type-distribution []
  (let [rooms (bldg/all-blueprints)]
    {:total (count rooms)
     :composite (count (filter #(-> % s/room-icon s/icon-is-composite?) rooms))
     :simple (- (count rooms)
              (count (filter #(-> % s/room-icon s/icon-is-composite?) rooms)))
     :ratio (/ (count (filter #(-> % s/room-icon s/icon-is-composite?) rooms))
               (count rooms))}))

(icon-type-distribution)
```

### 示例 6: 大图标对比

```clojure
(defn compare-large-icons [rooms]
  (->> rooms
       (map s/room-icon-big)
       (map s/icon-size)
       (map #(vector % (count (filter = % (map s/icon-size
                                                   (map s/room-icon big rooms))))))))

(compare-large-icons (take 10 (bldg/all-blueprints)))
```

### 示例 7: 图标索引映射

```clojure
(defn create-icon-index-map []
  (let [rooms (bldg/all-blueprints)]
    (into {}
          (for [room rooms]
            [(bldg/room-key room)
             (-> room s/room-icon s/icon-tile-index)]))))

(create-icon-index-map)
```

### 示例 8: 视觉化图标数据

```clojure
(defn visualize-icon-data [room-key]
  (let [room (bldg/find-room-by-key room-key)
        icon (s/room-icon room)]
    {:room-name (bldg/room-name room)
     :room-key room-key
     :icon-size (s/icon-size icon)
     :size-key (s/icon-size-key icon)
     :tile-index (s/icon-tile-index icon)
     :is-composite (s/icon-is-composite? icon)}))

(visualize-icon-data "FARM")
```

## 注意事项

1. **图标缓存**: 频繁访问同一房间图标可能产生大量对象,注意内存。
2. **尺寸限制**: 不同用途需要不同尺寸,根据场景选择。
3. **复合图标**: 复合图标可能需要特殊处理,某些操作可能不适用。
4. **图块索引**: 索引值用于底层渲染,通常不需要直接操作。
5. **房间键**: 使用房间键而非名称更稳定可靠。

## 相关文章

- [建筑与房间](/blog-posts/building-room/)
- [数据提取模块](/blog-posts/data-extraction/)
