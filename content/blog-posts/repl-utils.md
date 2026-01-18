:page/title REPL 工具 - 反射访问与更新系统
:blog-post/tags [:songs-of-syx :clojure :repl-utils]
:blog-post/author {:person/id :jan}
:page/body

## 概述

REPL 工具提供了通过反射访问游戏内部对象和管理更新循环的强大功能。通过这些工具,你可以获取任意对象的字段值、调用方法、添加自定义更新函数。本文将全面介绍 REPL 工具相关的所有功能。

## 字段访问

### 通过反射获取字段值

```clojure
(ns repl.core
  (:require [repl.utils :as u]))

;; 获取对象字段值
(def some-entity (first (humanoid/all-entities)))
(def name-value (u/get-field-value some-entity "name"))
(def health-value (u/get-field-value some-entity "health"))
```

`get-field-value` 接受对象和字段名字符串,返回字段值。

## 更新系统

### 独立更新器

独立更新器在游戏主循环之外运行,适合后台任务。

```clojure
;; 添加独立更新函数
(u/add-standalone-updater :my-updater
                         (fn []
                           (println "My custom updater running")))

;; 移除独立更新函数
(u/remove-standalone-updater :my-updater)

;; 重置独立更新器状态
(u/reset-standalone-updater)
```

### 常规更新器

常规更新器在游戏主循环中运行,优先级较高。

```clojure
;; 添加更新函数
(u/add-updater :my-updater
               (fn []
                 (println "Regular updater running")))

;; 移除更新函数
(u/remove-updater :my-updater)
```

### 单次更新

```clojure
;; 在下一个更新周期执行一次
(u/update-once (fn []
                  (println "This runs once on next update")))
```

## 反射调用

### 通过反射调用方法

```clojure
;; 调用对象方法
(def some-object (first (humanoid/all-entities)))

;; 无参数方法
(u/invoke-method some-object "getName")

;; 带参数方法
(u/invoke-method some-object "setName" "New Name")

;; 多参数方法
(u/invoke-method some-object "moveTo" 100 150)
```

## 实用示例

### 示例 1: 定期检查

```clojure
(defn setup-periodic-check []
  (u/add-updater :health-monitor
                 (fn []
                   (doseq [human (humanoid/all-entities)]
                     (let [health (u/get-field-value human "health")]
                       (when (< health 50)
                         (println (format "Low health: %d" health))))))))

(setup-periodic-check)
```

### 示例 2: 资源监控

```clojure
(defn monitor-resources []
  (u/add-standalone-updater :resource-monitor
                             (fn []
                               (let [warehouses (warehouse/all-warehouses)
                                     total-crates (reduce + 0
                                                       (map #(-> % warehouse-info :crates)
                                                            warehouses))]
                                 (when (< total-crates 100)
                                   (println "Low crate capacity!"))))))

(monitor-resources)
```

### 示例 3: 事件触发器

```clojure
(defn setup-event-triggers []
  (u/add-updater :event-checker
                 (fn []
                   ;; 检查特定条件
                   (when (some-condition)
                     (u/update-once (fn []
                                          ;; 触发一次性事件
                                          (println "Event triggered!")))))))

(setup-event-triggers)
```

### 示例 4: 动态方法调用

```clojure
(defn call-object-methods [objects method-name args]
  (doseq [obj objects]
    (try
      (apply u/invoke-method obj method-name args)
      (catch Exception e
        (println (format "Error calling %s: %s" method-name e))))))

;; 对所有小人调用 moveTo
(call-object-methods (humanoid/all-entities) "moveTo" [100 150])
```

### 示例 5: 批量属性读取

```clojure
(defn read-entity-attributes [entity fields]
  (into {}
        (for [field fields]
          [field (u/get-field-value entity field)])))

;; 读取多个属性
(read-entity-attributes (first (humanoid/all-entities))
                         ["name" "age" "health" "profession"])
```

### 示例 6: 条件更新器

```clojure
(defn conditional-updater [condition-fn action-fn]
  (u/add-updater :conditional
                 (fn []
                   (when (condition-fn)
                     (action-fn)))))

;; 当小人数量 < 10 时添加新小人
(conditional-updater #(> 10 (count (humanoid/all-entities)))
                     #(println "Need more humans"))
```

### 示例 7: 更新器管理

```clojure
(defn manage-updaters [active?]
  (if active?
    (do
      (u/add-updater :monitor-1 #(println "Monitor 1"))
      (u/add-updater :monitor-2 #(println "Monitor 2")))
    (do
      (u/remove-updater :monitor-1)
      (u/remove-updater :monitor-2))))

;; 启用监控器
(manage-updaters true)
```

### 示例 8: 自定义数据收集

```clojure
(defn collect-custom-data []
  (let [data (atom [])]
    (u/add-standalone-updater :data-collector
                               (fn []
                                 (swap! data conj
                                           {:timestamp (System/currentTimeMillis)
                                            :population (count (humanoid/all-entities))
                                            :resources (count (resource/all-resources))}))
                               true)  ;; 立即执行一次
    data))

(def data-history (collect-custom-data))
```

## 注意事项

1. **性能影响**: 频繁的字段访问和反射调用可能影响性能。
2. **更新器优先级**: 常规更新器在主循环中,独立更新器在后台。
3. **内存管理**: 更新器持续运行时注意内存使用。
4. **错误处理**: 反射调用可能失败,使用 try-catch 处理异常。
5. **唯一键**: 更新器键(:my-updater)需要唯一,避免覆盖。
6. **once 限制**: update-once 只执行一次,不适合持续任务。
7. **线程安全**: 在更新器中操作共享数据时注意线程安全。

## 相关文章

- [公共工具](/blog-posts/common-utils/)
- [家具检查](/blog-posts/furniture-inspection/)
