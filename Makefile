exports := ./docs/index.html


all: $(exports)

.PHONY: all


./docs/index.html: ./vue3-podcast-mini-player/dist/index.html
	cp $< $@


./vue3-podcast-mini-player/dist/index.html: $(filter-out ./vue3-podcast-mini-player/dist/%,$(shell find ./vue3-podcast-mini-player -type f -print))
	cd ./vue3-podcast-mini-player && npm run build
