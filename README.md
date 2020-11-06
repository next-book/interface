# nb-base

_Nb-base_ is a library providing functionality that builds on the structure of a [mapped next-book][mapper]. It provides basic e-reading functionalities.

See an [example of an e-book][walden] created with the next-book tools.

## Use

Some web tech knowledge and command line use is needed to produce a next-book at the time. But we‘re preparing an easier way right now! (If you want to know when it’s out, please subscribe to our newsletter 💌).

### 1. Add `nb-mapper` and `nb-base` dependencies

You can install nb-mapper and nb-base:

- via Yarn `yarn add nb-mapper nb-base`
- via NPM `npm install nb-mapper nb-base`

### 2\. Import `nb-base` styles in your SCSS

```scss
@import './../../node_modules/nb-base/src/scss/style.scss';
```

### 3\. Import `nb-base` module in your scripts

```javascript
import { initBook } from 'nb-base';

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

## License

nb-base &copy; 2016–2020 next-book

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.

[walden]: https://books.next-book.info/henry-david-thoreau_walden/docs/
[mapper]: http://next-book.github.io/nb-mapper/
[api]: http://next-book.github.io/nb-mapper/api
[options]: http://next-book.github.io/nb-mapper/api/#options
