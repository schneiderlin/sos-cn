(ns powerblog.db
  (:require
   [datomic.api :as d]))


(comment
  (do
    (require '[powerpack.dev :as dev])
    (def app (dev/get-app))
    (def db (d/db (:datomic/conn app))))
  
  :rcf)

(defn get-posts-by-tags [db tags]
  (->> (d/q '[:find [?e ...]
              :in $ [?tag ...]
              :where
              [?e :blog-post/tags ?tag]]
            db (mapcat #(if (keyword? %) [%] %) tags))
       (map #(d/entity db %))
       distinct))

(defn get-posts-by-category [db category]
  (get-posts-by-tags db (:tags category)))

(defn get-blog-posts [db]
  (->> (d/q '[:find [?e ...]
              :where
              [?e :blog-post/author]]
            db)
       (map #(d/entity db %))))

(comment
  (for [post (get-blog-posts db)] 
    (:page/body post))
  :rcf)

(defn get-posts-by-tag [db tag]
  (->> (d/q '[:find [?e ...]
              :in $ ?tag
              :where
              [?e :blog-post/tags ?tag]]
            db tag)
       (map #(d/entity db %))))