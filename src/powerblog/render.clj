(ns powerblog.render
  (:require 
   [powerpack.markdown :as md]
   [powerblog.static.index :as index]))

(defn layout [opts & content]
  [:html
   [:head
    (when (:title opts) [:title (:title opts)])
    [:meta {:charset "UTF-8"}]
    [:meta {:name "viewport" :content "width=device-width, initial-scale=1.0"}]]
   [:body
    content
    [:script {:src "https://d3js.org/d3.v7.min.js"}]
    [:script {:src "/js/race-visualizations.js"}]]])

(defn render-article [_context page]
  (layout {:title (:page/title page)}
          [:div {:class ["mx-auto" "bg-white" "rounded-xl" "p-10" "shadow-sm"]}
           [:h1 {:class ["text-3xl" "text-[#1e3a5f]" "mb-5"]} (:page/title page)]
           [:div {:class ["flex" "gap-2" "flex-wrap" "mt-2.5"]}
              (for [tag (:blog-post/tags page)]
                (when tag
                  [:span {:class ["bg-gray-200" "text-gray-700" "px-2.5" "py-1" "rounded-xl" "text-xs"]}
                   (name tag)]))]
           [:hr {:class ["my-5" "border-0" "border-t" "border-gray-200"]}]
           [:div {:class ["prose" "prose-lg" "max-w-none"]}
              (md/render-html (:page/body page))]]))

(defn render-blog-post [context page] 
  (render-article context page))

(defn render-page [context page]
  (let [{:keys [uri]} context]
    (or
     ;; 静态页面
     (case uri
       "/" (index/page context page)
       nil)
     ;; 动态页面类型
     (case (:page/kind page)
       #_#_:page.kind/frontpage (render-frontpage context page)
       :page.kind/blog-post (render-blog-post context page) 
       nil))))
