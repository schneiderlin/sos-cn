:page/title 数据提取模块 - 游戏数据导出
:blog-post/tags [:songs-of-syx :clojure :extract]
:blog-post/author {:person/id :jan}
:page/body

## 概述

数据提取模块提供了将《Songs of Syx》中的游戏数据导出为结构化格式(JSON/EDN)的功能。这些模块可以导出类型、科技、结构、宗教、资源、建筑等所有游戏数据,用于文档编写、数据分析或 AI 训练。本文将全面介绍数据提取模块的所有功能。

## 提取模块列表

### 可用的提取模块

以下模块用于从游戏数据中提取信息并导出:

### extract/type.clj - 类型数据

```clojure
(ns repl.core
  (:require [extract.type :as ext-type]))

;; 提取所有类型数据
(ext-type/extract-all-types)
```

### extract/common.clj - 公共提取

通用数据导出功能,包括共享的工具函数和辅助方法。

### extract/tech.clj - 科技数据

```clojure
(:require [extract.tech :as ext-tech])

;; 提取所有科技数据
(ext-tech/extract-all-techs)
```

### extract/structure.clj - 结构数据

```clojure
(:require [extract.structure :as ext-struct])

;; 提取所有结构数据
(ext-struct/extract-all-structures)
```

### extract/religion.clj - 宗教数据

```clojure
(:require [extract.religion :as ext-rel])

;; 提取所有宗教数据
(ext-rel/extract-all-religions)
```

### extract/booster.clj - 加成数据

```clojure
(:require [extract.booster :as ext-boost])

;; 提取所有加成数据
(ext-boost/extract-all-boosters)
```

### extract/resource.clj - 资源数据

```clojure
(:require [extract.resource :as ext-res])

;; 提取所有资源数据
(ext-res/extract-all-resources)
```

### extract/building.clj - 建筑数据

```clojure
(:require [extract.building :as ext-build])

;; 提取所有建筑数据
(ext-build/extract-all-buildings)

;; 提取建筑图标
(ext-build/extract-building-icons)
```

### extract/game_sprite.clj - 游戏精灵

```clojure
(:require [extract.game-sprite :as ext-gs])

;; 提取游戏精灵数据
(ext-gs/extract-game-sprites)
```

### extract/icon.clj - 图标

```clojure
(:require [extract.icon :as ext-icon])

;; 提取图标数据
(ext-icon/extract-icons)
```

## 实用示例

### 示例 1: 批量导出所有数据

```clojure
(defn export-all-game-data []
  (println "Extracting types...")
  (ext-type/extract-all-types)

  (println "Extracting techs...")
  (ext-tech/extract-all-techs)

  (println "Extracting structures...")
  (ext-struct/extract-all-structures)

  (println "Extracting religions...")
  (ext-rel/extract-all-religions)

  (println "Extracting boosters...")
  (ext-boost/extract-all-boosters)

  (println "Extracting resources...")
  (ext-res/extract-all-resources)

  (println "Extracting buildings...")
  (ext-build/extract-all-buildings)

  (println "All data extracted!"))

(export-all-game-data)
```

### 示例 2: 选择性导出

```clojure
(defn export-selected [modules]
  (doseq [module modules]
    (case module
      :types (ext-type/extract-all-types)
      :techs (ext-tech/extract-all-techs)
      :structures (ext-struct/extract-all-structures)
      :religions (ext-rel/extract-all-religions)
      :boosters (ext-boost/extract-all-boosters)
      :resources (ext-res/extract-all-resources)
      :buildings (ext-build/extract-all-buildings)
      (println (str "Unknown module: " module)))))

;; 只导出选定的模块
(export-selected [:techs :resources :buildings])
```

### 示例 3: 数据验证

```clojure
(defn validate-exports [export-files]
  (doseq [file export-files]
    (when (.exists (java.io.File. file))
      (let [data (clojure.edn/read-string (slurp file))]
        (println (format "%s: %d records" file (count data)))))))

;; 验证导出的文件
(validate-exports ["types.edn"
                   "techs.edn"
                   "resources.edn"])
```

### 示例 4: 增量导出

```clojure
(defn incremental-export [module-file-pairs]
  (doseq [[module-fn filename] module-file-pairs]
    (println (format "Extracting to %s..." filename))
    (module-fn)
    (println (format "Done! Output: %s" filename))))

;; 增量导出,每完成一个显示进度
(incremental-export [[ext-type/extract-all-types "types.edn"]
                     [ext-tech/extract-all-techs "techs.edn"]
                     [ext-res/extract-all-resources "resources.edn"]])
```

### 示例 5: 自定义导出路径

```clojure
(defn export-to-path [module-fn output-path]
  (println (format "Exporting to %s..." output-path))
  (module-fn)  ;; 模块可能有路径参数,需要查看实现
  {:status :ok
   :path output-path})

;; 导出到自定义路径
(export-to-path ext-res/extract-all-resources "data/custom-resources.edn")
```

### 示例 6: 数据统计

```clojure
(defn export-statistics []
  (let [tech-count (count (extract.tech/extract-all-techs))
        resource-count (count (extract.resource/extract-all-resources))
        building-count (count (extract.building/extract-all-buildings))]
    {:techs tech-count
     :resources resource-count
     :buildings building-count
     :total (+ tech-count resource-count building-count)}))

(export-statistics)
```

### 示例 7: 定时导出

```clojure
(defn scheduled-export [interval-seconds]
  (while true
    (println "Running scheduled export...")
    (ext-type/extract-all-types)
    (ext-tech/extract-all-techs)
    (ext-res/extract-all-resources)
    (println "Export complete!")
    (Thread/sleep (* interval-seconds 1000))))

;; 每 300 秒(5 分钟)导出一次
(scheduled-export 300)
```

### 示例 8: 完整导出报告

```clojure
(defn full-export-report []
  (let [start-time (System/currentTimeMillis)
        data {:types (ext-type/extract-all-types)
               :techs (ext-tech/extract-all-techs)
               :structures (ext-struct/extract-all-structures)
               :religions (ext-rel/extract-all-religions)
               :boosters (ext-boost/extract-all-boosters)
               :resources (ext-res/extract-all-resources)
               :buildings (ext-build/extract-all-buildings)
               :icons (ext-build/extract-building-icons)
               :sprites (ext-gs/extract-game-sprites)
               :icons-data (ext-icon/extract-icons)}
        end-time (System/currentTimeMillis)]
    (spit "full-export-report.edn" (pr-str data))
    {:status :complete
     :duration-ms (- end-time start-time)
     :data-sizes (reduce-kv (fn [acc k v]
                                 (assoc acc k (count v)))
                               {} data)})))

(full-export-report)
```

## 数据用途

### 文档编写

导出的数据可以直接用于编写游戏 Wiki:
- [游戏资源] → [结构化数据] → [Wiki 页面]

### AI 训练

结构化数据可以用作 AI 的上下文:
- 让 AI 读取数据
- 制作 Datalog 数据库
- 微调小模型(如 function-gemma)

### 数据分析

- 资源平衡分析
- 科技树可视化
- 宗教关系图谱

## 注意事项

1. **文件覆盖**: 重复导出会覆盖已有文件,注意备份。
2. **数据量**: 某些模块导出大量数据,确保有足够磁盘空间。
3. **游戏状态**: 导出时游戏应该处于稳定状态,避免数据不一致。
4. **内存使用**: 批量导出所有数据可能消耗大量内存。
5. **性能影响**: 复杂提取操作可能短暂影响游戏性能。
6. **格式选择**: EDN 格式适合 Clojure,JSON 更通用,根据需求选择。

## 相关文章

- [资源系统](/blog-posts/resource-system/)
- [科技系统](/blog-posts/technology-system/)
- [建筑与房间](/blog-posts/building-room/)
