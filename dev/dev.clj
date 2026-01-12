(ns dev
  (:require
   [datomic.api :as d]
   [powerblog.core :as blog]
   [powerpack.dev :as dev]))

(defmethod dev/configure! :default []
  blog/config)

(comment
  (dev/start)
  (dev/stop)
  (dev/reset)

  (def app (dev/get-app)) 
  (def db (d/db (:datomic/conn app)))
  
  (->> (d/entity db [:page/uri "/"]))
  (->> (d/entity db [:page/uri "/blog-posts/first-post/"])
       :blog-post/author
       (into {}))
  
  (require '[powerblog.db :as db])
  
  (db/get-blog-posts db) 

  (->> (d/q '[:find (pull ?e [:*])
              :where
              [?e :page/title]]
            db)
       (map #(d/entity db %)))

  (d/entity db [:page/uri "/blog-posts/01-what-is-trpg/"])
  (d/entity db [:person/id :me])

  (d/pull db [:person/id :person/full-name] [:person/id :me])

  :rcf)
