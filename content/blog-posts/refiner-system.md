:page/title 精炼厂系统 - 生产与制造
:blog-post/tags [:songs-of-syx :clojure :refiner]
:blog-post/author {:person/id :jan}
:page/body

## 概述

精炼厂是《Songs of Syx》中加工资源、生产成品的设施。通过 REPL,你可以查询精炼厂类型、创建熔炉、获取生产信息。本文将全面介绍精炼厂相关的所有 REPL 功能。

## 查询精炼厂

### 按键查找

```clojure
(ns repl.core
  (:require [game.refiner :as ref]))

;; 按键查找精炼厂
(def smelter (ref/find-refiner-by-key "SMELTER"))
(def refiner (ref/find-refiner-by-key "REFINER"))
```

### 获取熔炉

```clojure
;; 获取熔炉蓝图
(def smelter-bp (ref/get-smelter))
```

### 获取所有类型

```clojure
;; 获取所有精炼厂类型
(def all-refiner-types (ref/all-refiner-types))

;; 获取所有精炼厂信息
(def all-refiner-info (ref/all-refiner-info))
```

## 创建精炼厂

### 基本创建

```clojure
;; 创建精炼厂
(ref/create-refiner "SMELTER" 100 150 10 10)
```

参数为:精炼厂类型,中心 X,中心 Y,宽度,高度

### 带选项创建

```clojure
;; 创建精炼厂(带选项)
(ref/create-refiner "SMELTER" 100 150 10 10
                   {:priority 0.9
                    :workers 4
                    :fuel "WOOD"})
```

可选项:
- `:priority` - 工作优先级
- `:workers` - 工人数量
- `:fuel` - 燃料类型

### 单次更新创建

```clojure
;; 创建精炼厂(单次更新)
(ref/create-refiner-once "SMELTER" 100 150 10 10
                         {:priority 0.9})

;; 创建熔炉(单次更新)
(ref/create-smelter-once 100 150 10 10
                      {:priority 0.9})
```

## 生产信息

### 获取家具信息

```clojure
;; 获取精炼厂家具信息
(def smelter-furniture (ref/get-refiner-furniture-info "SMELTER"))
```

家具信息包含:
- 工作台位置
- 工具位置
- 输入/输出区域

## 实用示例

### 示例 1: 查看所有精炼厂类型

```clojure
(defn list-all-refiners []
  (->> (ref/all-refiner-info)
       (map :name)))

(list-all-refiners)
```

### 示例 2: 创建熔炉群

```clojure
(defn create-smelter-cluster [start-x start-y count spacing]
  (doseq [i (range count)]
    (let [x (+ start-x (* i spacing))
          y start-y]
      (ref/create-smelter-once x y 10 10 {:priority 0.9}))))

;; 创建 5 个熔炉,间距 15
(create-smelter-cluster 100 100 5 15)
```

### 示例 3: 生产能力分析

```clojure
(defn analyze-refiner-capacity [refiner-type]
  (let [info (first (filter #(= (:key %) refiner-type)
                          (ref/all-refiner-info)))]
    {:type refiner-type
     :name (:name info)
     :workers (:workers info)
     :capacity (:capacity info)}))

(analyze-refiner-capacity "SMELTER")
```

## 注意事项

1. **燃料需求**: 确保足够的燃料供应(木头、煤炭等)。
2. **工人分配**: 根据生产需求调整工人数量。
3. **位置布局**: 考虑输入资源的仓库和输出产品的仓库。
4. **生产链**: 精炼厂通常与其他设施配合形成生产链。

## 相关文章

- [建筑与房间](/blog-posts/building-room/)
- [资源系统](/blog-posts/resource-system/)
