/* global window */

import { Provider } from 'react-redux';
import { createStore, compose } from 'redux';
import React from 'react';
import ReactDOM from 'react-dom';
import { debounce } from 'lodash';

import Headroom from 'headroom.js';

import { loadSpine, plantRoot } from './shared';
import reducer from './reducer';
import views from './views';

loadSpine().then(spine => {
  const persistedState = localStorage.getItem(spine.slug);

  const store = createStore(
    reducer,
    persistedState ? JSON.parse(persistedState) : { spine },
    compose(window.devToolsExtension ? window.devToolsExtension() : f => f)
  );

  Object.keys(views).forEach(key => {
    ReactDOM.render(
      <Provider store={store}>{React.createElement(views[key], null)}</Provider>,
      plantRoot(key)
    );
  });

  store.subscribe(
    debounce(() => {
      localStorage.setItem(spine.slug, JSON.stringify(store.getState()));
    }, 500)
  );

  window.book = store;
});

document.addEventListener('DOMContentLoaded', () => {
  const headroom = new Headroom(window.document.body);
  headroom.init();
});
