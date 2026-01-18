(ns powerblog.core
  (:require
   [datomic.api :as d]
   [powerblog.render :as render]
   [powerblog.ingest :as ingest]
   [powerblog.static.index :as index]))

(comment
  (require '[powerpack.dev :as dev])
  (def app (dev/get-app))
  (def db (d/db (:datomic/conn app)))
  :rcf)

(def config
  {:site/title "The Powerblog"
   :datomic/schema-file "resources/schema.edn"
   :powerpack/port 8000
   :powerpack/log-level :debug
   :powerpack/render-page #'render/render-page
   :powerpack/create-ingest-tx #'ingest/create-tx
   #_#_:powerpack/on-ingested #'ingest/on-ingested
   :optimus/bundles {"app.css"
                     {:public-dir "public"
                      :paths ["/styles.css" "/css/visualizations.css"]}}
   :optimus/assets [{:public-dir "public"
                     :paths ["/js/race-visualizations.js"]}]
   :optimus/options {:minify-js-assets? false}})
