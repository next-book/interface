/* global window */

import { Provider } from 'react-redux';
import { createStore, compose } from 'redux';
import React from 'react';
import ReactDOM from 'react-dom';
import { debounce } from 'lodash';

import Headroom from 'headroom.js';

import { loadManifest, plantRoot } from './shared';
import reducer from './reducer';
import views from './views';

document.addEventListener('DOMContentLoaded', () => {
  initBook();
  initHeadroom();
});

function initBook() {
  loadManifest().then(manifest => {
    const persistedState = localStorage.getItem(manifest.slug);

    const store = createStore(
      reducer,
      persistedState ? JSON.parse(persistedState) : { manifest },
      compose(window.devToolsExtension ? window.devToolsExtension() : f => f)
    );

    Object.keys(views).forEach(key => {
      const wrapper = views[key].wrapperId
        ? document.getElementById(views[key].wrapperId)
        : plantRoot(key);

      if (!wrapper) return;

      ReactDOM.render(
        <Provider store={store}>{React.createElement(views[key], null)}</Provider>,
        wrapper
      );
    });

    store.subscribe(
      debounce(() => {
        localStorage.setItem(manifest.slug, JSON.stringify(store.getState()));
      }, 500)
    );

    window.book = store;
  });
}

function initHeadroom() {
  const headroom = new Headroom(window.document.body);
  headroom.init();
}
