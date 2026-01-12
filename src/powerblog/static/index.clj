(ns powerblog.static.index
  (:require 
   [datomic.api :as d]
   [powerblog.db :as db]))

(defn page [context page]
  [:ul
   (for [blog-post (db/get-blog-posts (:app/db context))]
     [:li [:a {:href (:page/uri blog-post)} (:page/title blog-post)]])])