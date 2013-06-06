TESTS += test/cache.test.js
TESTS += test/filter.test.js
TESTS += test/minilog.test.js

build:
	@mkdir -p ./dist/
	@echo 'Building dist/minilog.js'
	./node_modules/gluejs/bin/gluejs \
	--include ./lib/common \
	--include ./lib/web \
	--include ./node_modules/microee/ \
	--command 'uglifyjs --no-copyright --mangle-toplevel' \
	--global Minilog \
	--main lib/web/index.js \
	--out dist/minilog.js

build-debug:
	@mkdir -p ./dist/
	@echo 'Building dist/minilog.js'
	./node_modules/gluejs/bin/gluejs \
	--include ./lib/common \
	--include ./lib/web \
	--include ./node_modules/microee/ \
	--global Minilog \
	--main lib/web/index.js \
	--out dist/minilog.js

test:
	@mocha \
		--ui exports \
		--reporter spec \
		--slow 2000ms \
		--bail \
		$(TESTS)

formatters:
	@node test/example/themes_example.js

.PHONY: build build-debug test formatters

