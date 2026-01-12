(ns powerblog.export
  (:require [powerblog.core :as blog]
            [powerpack.export :as export]))

(defn ^:export export! [& args]
  (-> blog/config
      (assoc :site/base-url (or (System/getenv "SITE_BASE_URL")
                                (when-let [vercel-url (System/getenv "VERCEL_URL")]
                                  (str "https://" vercel-url))))
      export/export!))

(comment
  (export!)
  :rcf)

