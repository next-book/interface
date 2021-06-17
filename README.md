# @next-book/interface

_Nb-base_ is a library providing functionality that builds on the structure of a [mapped next-book][mapper]. It provides basic e-reading functionalities.

See an [example of an e-book][walden] created with the next-book tools.

## Use

Some web tech knowledge and command line use is needed to produce a next-book at the time. But we‘re preparing an easier way right now! (If you want to know when it’s out, please subscribe to our newsletter 💌).

### 1. Add `@next-book/publisher` and `@next-book/interface` dependencies

You can install publisher and interface:

- via Yarn `yarn add @next-book/publisher @next-book/interface`
- via NPM `npm install @next-book/publisher @next-book/interface`

### 2\. Import `@next-book/interface` styles in your SCSS

```scss
@import './../../node_modules/@next-book/interface/src/scss/style.scss';
```

### 3\. Import `@next-book/interface` module in your scripts

```javascript
import { initBook } from '@next-book/interface';

document.addEventListener('DOMContentLoaded', () => {
  initBook();
});
```

### Stand-alone use (without SCSS/JS imports)

You may include `dist/interface.js` and `dist/interface.css` in your web book (before any other scripts.

## Getting current book state

You may use `book.getState()` to get current e-book state — it returns a serialized redux state with user data.

## Contributing

Clone repository and install devDependencies. Build a complete project with `npm run build`. Limit PRs only to changed source files.

## License

@next-book/interface &copy; 2016–2020 next-book

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.

[walden]: https://books.next-book.info/henry-david-thoreau_walden/docs/
[mapper]: http://next-book.github.io/publisher/
[api]: http://next-book.github.io/publisher/api
[options]: http://next-book.github.io/publisher/api/#options
