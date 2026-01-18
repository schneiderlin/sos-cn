:page/title 相机控制 - 视角管理与缩放
:blog-post/tags [:songs-of-syx :clojure :camera]
:blog-post/author {:person/id :jan}
:page/body

## 概述

相机控制是《Songs of Syx》中管理游戏视角的核心功能。通过 REPL,你可以移动相机到特定位置、使用 WASD 方向控制、调整缩放级别。本文将全面介绍相机控制相关的所有 REPL 功能。

## 获取游戏窗口

```clojure
(ns repl.core
  (:require [repl.tutorial1 :as t1]))

;; 获取游戏窗口对象
(def game-window (t1/get-game-window))
```

## 移动相机

### 移动到像素坐标

```clojure
;; 移动相机到指定像素坐标
(t1/move-camera-to 3200 4800)
```

像素坐标是游戏内的实际像素位置。

### 移动到瓦片坐标

```clojure
;; 移动相机到指定瓦片坐标
(t1/move-camera-to-tile 100 150)
```

瓦片坐标会自动转换为像素坐标(乘以 32)。

### 增量移动

```clojure
;; 相对移动相机
(t1/move-camera-by 100 50)  ;; 向右移动 100 像素,向下移动 50 像素
```

### 方向移动

```clojure
;; WASD 方向移动
(t1/move-camera-direction :north {:speed 10.0})
(t1/move-camera-direction :south {:speed 10.0})
(t1/move-camera-direction :east {:speed 10.0})
(t1/move-camera-direction :west {:speed 10.0})

;; 默认速度
(t1/move-camera-direction :north)  ;; 使用默认速度
```

方向选项:
- `:north` - 向上
- `:south` - 向下
- `:east` - 向右
- `:west` - 向左

可选项:
- `:speed` - 移动速度(像素/秒)

## 缩放控制

### 获取缩放级别

```clojure
;; 获取当前缩放级别
(t1/get-zoom)  ;; 例如: 1.0, 2.0, 0.5
```

### 设置缩放级别

```clojure
;; 设置缩放级别
(t1/set-zoom 2.0)  ;; 放大到 2 倍
(t1/set-zoom 0.5)  ;; 缩小到 0.5 倍
```

### 快捷缩放

```clojure
;; 放大
(t1/zoom-in)

;; 缩小
(t1/zoom-out)

;; 缩放增量
(t1/zoom-by 0.5)  ;; 增加 0.5 倍缩放
(t1/zoom-by -0.5)  ;; 减少 0.5 倍缩放
```

## 实用示例

### 示例 1: 巡航关键位置

```clojure
(defn tour-locations [locations]
  (doseq [[x y] locations]
    (t1/move-camera-to-tile x y)
    (Thread/sleep 2000)))  ;; 停留 2 秒

;; 巡航重要位置
(tour-locations [[100 100] [200 150] [150 200]])
```

### 示例 2: 自动平移

```clojure
(defn smooth-pan [target-x target-y duration]
  (let [window (t1/get-game-window)
        current-x (get-in window [:camera :x])
        current-y (get-in window [:camera :y])
        steps 60
        dx (/ (- target-x current-x) steps)
        dy (/ (- target-y current-y) steps)]
    (doseq [i (range steps)]
      (t1/move-camera-by dx dy)
      (Thread/sleep (/ duration steps)))))

;; 10 秒内平移到目标位置
(smooth-pan 5000 5000 10000)
```

### 示例 3: 缩放到合适级别

```clojure
(defn zoom-to-fit [center-x center-y width height]
  ;; 移动到中心
  (t1/move-camera-to-tile center-x center-y)
  ;; 根据区域大小计算合适的缩放
  (let [screen-width 1920  ;; 假设屏幕宽度
        screen-height 1080  ;; 假设屏幕高度
        zoom-x (/ screen-width (* width 32))
        zoom-y (/ screen-height (* height 32))
        zoom (min zoom-x zoom-y)]
    (t1/set-zoom (max 0.5 zoom))))  ;; 限制最小缩放

(zoom-to-fit 100 100 30 30)
```

### 示例 4: 跟随实体

```clojure
(defn follow-entity [entity-fn duration]
  (doseq [_ (range duration)]
    (let [entity (entity-fn)
          x (:x entity)
          y (:y entity)]
      (t1/move-camera-to-tile x y)
      (Thread/sleep 1000))))

;; 跟随第一个小人 30 秒
(follow-entity #(first (humanoid/all-entities)) 30)
```

### 示例 5: 快速跳转

```clojure
(defn quick-jumps [locations]
  (doseq [[x y zoom] locations]
    (t1/move-camera-to-tile x y)
    (t1/set-zoom zoom)
    (Thread/sleep 1000)))  ;; 短暂停

;; 快速跳转到预设位置
(quick-jumps [[100 100 1.5]
              [200 200 1.0]
              [150 150 2.0]])
```

### 示例 6: 渐进缩放

```clojure
(defn gradual-zoom [target-zoom duration]
  (let [current-zoom (t1/get-zoom)
        steps 60
        dz (/ (- target-zoom current-zoom) steps)]
    (doseq [_ (range steps)]
      (t1/zoom-by dz)
      (Thread/sleep (/ duration steps)))))

;; 5 秒内缩放到 2 倍
(gradual-zoom 2.0 5000)
```

### 示例 7: 区域扫描

```clojure
(defn scan-area [start-x start-y width height step-size]
  (doseq [x (range start-x (+ start-x width) step-size)
           y (range start-y (+ start-y height) step-size)]
    (t1/move-camera-to-tile x y)
    (Thread/sleep 500)))  ;; 每个位置停留 0.5 秒

;; 扫描 100x100 区域,每 20 瓦片停一次
(scan-area 100 100 100 100 20)
```

### 示例 8: 相机动画

```clojure
(defn animate-camera [start-x start-y end-x end-y duration frames]
  (let [dx (/ (- end-x start-x) frames)
        dy (/ (- end-y start-y) frames)]
    (doseq [i (range (inc frames))]
      (let [x (+ start-x (* i dx))
            y (+ start-y (* i dy))]
        (t1/move-camera-to x y)
        (Thread/sleep (/ duration frames))))))

;; 3 秒内完成移动,30 帧
(animate-camera 3200 3200 6400 4800 3000 30)
```

## 注意事项

1. **坐标系统**: 注意区分瓦片坐标和像素坐标。
2. **缩放限制**: 过大或过小的缩放可能导致显示问题。
3. **性能影响**: 频繁的相机移动和缩放可能影响性能。
4. **小人工人**: 相机移动不会影响小人工人,只是视角变化。
5. **边界限制**: 相机移动受地图边界限制。
6. **线程安全**: 在动画中调整缩放时注意线程安全。

## 相关文章

- [时间控制](/blog-posts/time-control/)
- [家具检查](/blog-posts/furniture-inspection/)
