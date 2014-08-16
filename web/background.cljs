(ns background)


(defn fmt_color [r g b]
  (str "#"
    (format "%x" r)
    (format "%x" g)
    (format "%x" b)))


(defn draw_bg_square [ctx xi yi sz heat]
  (def color
    (if (or (and (odd? xi) (odd? yi)) (and (even? xi) (even? yi)))
      50
      35))
  (.log js/console color)
  ; (set! (.-fillStyle ctx) (fmt_color base_color))
  (.fillRect ctx (* xi sz) (* yi sz) sz sz))


(defn draw_bg [ctx]
  (def sz 8)
  (def xn (/ (.-innerWidth js/window) sz))
  (def yn (/ (.-innerHeight js/window) sz))
  (.log js/console
    (for [x (range 0 xn)
          y (range 0 yn)
          :let [heat (* (/ x xn) (/ y yn))]]
      (draw_bg_square ctx x y sz heat))))


(defn ^:export draw [n]
  (def canvas (.getElementById js/document (name n)))
  (def ctx (.getContext canvas "2d"))
  (set! (.-width canvas) (.-innerWidth js/window))
  (set! (.-height canvas) (.-innerHeight js/window))
  (draw_bg ctx))


