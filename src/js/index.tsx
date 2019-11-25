/* global window */

import { Provider } from 'react-redux';
import { createStore, compose } from 'redux';
import React from 'react';
import ReactDOM from 'react-dom';
import { debounce } from 'lodash';

import { loadManifest, parseManifest, plantRoot } from './shared';
import reducer from './reducer';
import views from './views';

export function initBook() {
  loadManifest().then(manifestData => {
    const manifest = parseManifest(manifestData);

    const persistedState = localStorage.getItem(manifest.slug);

    const store = createStore(reducer, persistedState ? JSON.parse(persistedState) : { manifest });

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

    (window as any).book = store;
  });
}
