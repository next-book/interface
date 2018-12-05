# nb-base

_Nb-base_ is a library providing functionality that builds on the structure of a [mapped next-book][mapper]. It provides basic e-reading functionalities.

See an [example of an e-book][fc] created with the next-book tools.

## Use

Include `dist/nb-base.js` and `dist/nb-base.css` in your next-book for basic functionality.

Use `book.getState()` to get current e-book state (returns a redux state).

## Contributing

Clone repository and install devDependencies. Build a complete project with `npm run build`. Limit PRs only to changed source files.

[fc]: https://github.com/next-book/free-culture/
[mapper]: http://next-book.github.io/nb-mapper/
[api]: http://next-book.github.io/nb-mapper/api
[options]: http://next-book.github.io/nb-mapper/api/#options
