TESTS += test/cache.test.js
TESTS += test/filter.test.js
TESTS += test/minilog.test.js

test:
	@mocha \
		--ui exports \
		--reporter spec \
		--slow 2000ms \
		--bail \
		$(TESTS)

formatters:
	@node test/example/themes_example.js

.PHONY: test formatters

