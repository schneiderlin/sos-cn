:page/title 时间控制 - 游戏速度管理
:blog-post/tags [:songs-of-syx :clojure :time]
:blog-post/author {:person/id :jan}
:page/body

## 概述

时间控制是《Songs of Syx》中管理游戏进度的核心功能。通过 REPL,你可以暂停游戏、设置不同的速度级别(0x, 1x, 5x, 25x)、查看当前和目标速度。本文将全面介绍时间控制相关的所有 REPL 功能。

## 获取游戏速度对象

```clojure
(ns repl.core
  (:require [repl.tutorial1 :as t1]))

;; 获取游戏速度对象
(def game-speed (t1/get-game-speed))
```

## 设置时间速度

### 基本速度控制

```clojure
;; 设置时间速度
(t1/set-time-speed 0)   ;; 暂停
(t1/set-time-speed 1)   ;; 正常速度(1x)
(t1/set-time-speed 5)   ;; 快速(5x)
(t1/set-time-speed 25)  ;; 非常快(25x)
```

速度级别说明:
- `0`: 游戏暂停,时间不流动
- `1`: 正常速度,每秒 1 天
- `5`: 5 倍速,每秒 5 天
- `25`: 25 倍速,每秒 25 天

## 查询速度状态

### 当前速度

```clojure
;; 获取当前时间速度
(t1/get-time-speed)  ;; 0, 1, 5, 或 25
```

### 目标速度

```clojure
;; 获取目标速度
(t1/get-time-speed-target)
```

当前速度和目标速度可能不同,特别是在速度切换过程中。

## 快捷操作

### 暂停和恢复

```clojure
;; 暂停游戏
(t1/pause-time)

;; 恢复正常速度
(t1/resume-time)

;; 切换暂停状态
(t1/toggle-pause)
```

`toggle-pause` 在暂停和恢复之间切换。

### 预设速度

```clojure
;; 暂停(0x)
(t1/time-speed-0x)

;; 正常速度(1x)
(t1/time-speed-1x)

;; 快速(5x)
(t1/time-speed-5x)

;; 非常快(25x)
(t1/time-speed-25x)
```

## 实用示例

### 示例 1: 速度循环

```clojure
(defn cycle-speeds [duration]
  (let [speeds [1 5 25 1 0]]
    (doseq [speed speeds]
      (t1/set-time-speed speed)
      (Thread/sleep duration))))

;; 每 5 秒切换速度,循环 5 次
(cycle-speeds 5000)
```

### 示例 2: 智能速度调整

```clojure
(defn smart-speed [task-type]
  (case task-type
    :planning (t1/time-speed-0x)      ;; 规划时暂停
    :building (t1/time-speed-1x)       ;; 建造时正常速度
    :waiting (t1/time-speed-5x)       ;; 等待时加速
    :long-term (t1/time-speed-25x)))   ;; 长期加速

(smart-speed :planning)
(smart-speed :long-term)
```

### 示例 3: 速度监控

```clojure
(defn monitor-speed []
  (loop []
    (let [current (t1/get-time-speed)
          target (t1/get-time-speed-target)]
      (println (format "Current: %d, Target: %d" current target))
      (Thread/sleep 1000)
      (recur))))

(monitor-speed)
```

### 示例 4: 逐步加速

```clojure
(defn gradual-speed-up [max-speed steps duration]
  (let [speed-step (/ max-speed steps)]
    (doseq [i (range steps)]
      (t1/set-time-speed (* (inc i) speed-step))
      (Thread/sleep (/ duration steps)))))

;; 10 秒内从 1x 加速到 25x
(gradual-speed-up 25 10 10000)
```

### 示例 5: 条件速度控制

```clojure
(defn conditional-speed [condition-fn]
  (while true
    (if (condition-fn)
      (t1/time-speed-1x)    ;; 条件满足时正常速度
      (t1/time-speed-25x))   ;; 否则加速
    (Thread/sleep 1000)))

;; 例如:有紧急任务时用正常速度
(conditional-speed #(has-urgent-tasks?))
```

### 示例 6: 速度对比测试

```clojure
(defn speed-benchmark [task speed]
  (println (format "Testing at speed %d..." speed))
  (t1/set-time-speed speed)
  (let [start-time (System/currentTimeMillis)]
    (task)
    (let [end-time (System/currentTimeMillis)
          elapsed (- end-time start-time)]
      (println (format "Speed %d: %d ms" speed elapsed)))))

;; 对比不同速度下完成同样任务的时间
(speed-benchmark #(build-small-farm) 1)
(speed-benchmark #(build-small-farm) 5)
(speed-benchmark #(build-small-farm) 25)
```

### 示例 7: 自动暂停

```clojure
(defn auto-pause-when-done []
  (loop []
    (let [active-tasks (count-active-tasks)]
      (if (zero? active-tasks)
        (do
          (t1/pause-time)
          (println "All tasks done, paused"))
        (do
          (t1/time-speed-1x)
          (Thread/sleep 5000)
          (recur))))))

;; 无任务时自动暂停
(auto-pause-when-done)
```

### 示例 8: 速度同步

```clojure
(defn sync-speed [reference-game]
  (let [ref-speed (get-reference-speed reference-game)]
    (t1/set-time-speed ref-speed)
    {:status :synced
     :speed ref-speed}))

;; 与参考游戏同步速度
(sync-speed some-other-game)
```

## 注意事项

1. **速度限制**: 0, 1, 5, 25 是标准速度级别,其他值可能不稳定。

2. **性能影响**: 高速(25x)对硬件要求更高,可能导致性能问题。

3. **事件处理**: 极高速度下某些事件可能被跳过或处理延迟。

4. **网络同步**: 多人游戏中,速度可能受服务器限制。

5. **保存建议**: 重要操作前建议暂停,避免意外进度。

6. **状态持久化**: 速度状态不会保存到存档,每次加载重置。

7. **目标延迟**: 从当前速度到目标速度可能有短暂延迟。

## 相关文章

- [相机控制](/blog-posts/camera-control/)
- [家具检查](/blog-posts/furniture-inspection/)
