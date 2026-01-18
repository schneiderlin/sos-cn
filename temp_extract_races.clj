(ns extract-race-basic-info
  (:require [clojure.edn :as edn]))

(def races-data
  (->> "C:/Users/zihao/Desktop/workspace/opensource/sos-mod/output/wiki/data/races.edn"
       slurp
       read-string
       :races))

(defn extract-basic-info [race]
  {:race-key (:key race)
   :name (get-in race [:info :name])
   :playable (if (:playable race) "✓" "✗")
   :height (get-in race [:physics :height])
   :death-age (->> race
                 :boosts
                 (filter #(= "PHYSICS_DEATH_AGE" (:boostable-key %)))
                 first
                 :to)
   :slave-price (get-in race [:physics :slave-price])
   :adult-at (get-in race [:physics :adult-at-day])})

(defn format-row [info]
  (format "| %s | %s | %s | %s | %s | %s |"
          (:name info)
          (:playable info)
          (:height info)
          (:death-age info)
          (:slave-price info)
          (:adult-at info)))

(defn generate-table []
  (let [races (map extract-basic-info races-data)]
    (println "#### 种族基本信息表")
    (println "")
    (println "| 种族 | 可玩 | 身高 | 寿命(年) | 奴隶价格 | 成年天数 |")
    (println "|------|------|---------|----------|----------|----------|")
    (doseq [race races]
      (println (format-row race)))))

(generate-table)
