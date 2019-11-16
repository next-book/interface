# nb-base

_Nb-base_ is a library providing functionality that builds on the structure of a [mapped next-book][mapper]. It provides basic e-reading functionalities.

See an [example of an e-book][fc] created with the next-book tools.

## Use

Some web tech knowledge and command line use is needed to produce a next-book at the time. But we‘re preparing an easier way right now! (If you want to know when it’s out, please subscribe to our newsletter 💌).

### 1. Add `nb-mapper` and `nb-base` dependencies

You can install nb-mapper and nb-base:

- via Yarn `yarn add nb-mapper`
- via NPM `npm install nb-mapper`

### 2\. Import `nb-base` styles in your SCSS

```scss
@import './../../node_modules/nb-base/src/scss/style.scss';
```

### 3\. Import `nb-base` module in your scripts

```javascript
import { initBook } from './../../node_modules/nb-base/src/js/index.js';

document.addEventListener('DOMContentLoaded', () => {
  initBook();
});
```

### Stand-alone use (without SCSS/JS imports)

You may include `dist/nb-base.js` and `dist/nb-base.css` in your next-book (before any other scripts.

## Getting current book state

You may use `book.getState()` to get current e-book state — it returns a serialized redux state with user data.

## Contributing

Clone repository and install devDependencies. Build a complete project with `npm run build`. Limit PRs only to changed source files.

[fc]: https://github.com/next-book/free-culture/
[mapper]: http://next-book.github.io/nb-mapper/
[api]: http://next-book.github.io/nb-mapper/api
[options]: http://next-book.github.io/nb-mapper/api/#options
