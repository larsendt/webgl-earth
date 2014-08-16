CLJSC = ~/git/clojurescript/bin/cljsc
OPT = '{:optimizations :advanced}'

all: background

background: background.cljs
	$(CLJSC) background.cljs $(OPT) > background.js
