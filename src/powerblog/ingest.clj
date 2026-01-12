(ns powerblog.ingest
  (:require
   [datomic.api :as d]
   [powerblog.render :as render]))

(defn get-page-kind [file-name]
  (cond
    (re-find #"^blog-posts/" file-name)
    :page.kind/blog-post

    (re-find #"^index\.md" file-name)
    :page.kind/frontpage

    (re-find #"\.md$" file-name)
    :page.kind/article))

(defn create-tx [file-name txes]
  (let [kind (get-page-kind file-name)]
    (for [tx txes]
      (cond-> tx
        (and (:page/uri tx) kind) (assoc :page/kind kind)
        ;; markdown blog post 把 body 里面的连接替换
        (and (= kind :page.kind/blog-post)
             (re-find #"\.md$" file-name)) identity))))

(defn on-ingested
  "在内容导入后，为每个分类创建页面实体"
  [powerpack-app _results]
  (let [conn (:datomic/conn powerpack-app)
        db (d/db conn)
        categories [:h1 "dummy"] #_render/nav-categories]
    (->> categories
         (filter (fn [cat]
                   ;; 检查页面是否已存在，避免重复创建
                   (nil? (d/entity db [:page/uri (:uri cat)]))))
         (map (fn [cat]
                (let [uri (:uri cat)
                      uri-with-slash (if (.endsWith uri "/") uri (str uri "/"))]
                  {:page/uri uri-with-slash
                   :page/kind :page.kind/category
                   :page/title (str (:title cat) "指南")})))
         (d/transact conn)
         deref)))
