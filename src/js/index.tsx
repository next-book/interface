/* global window */

import { Provider } from 'react-redux';
import { createStore } from 'redux';
import React from 'react';
import ReactDOM from 'react-dom';
import { debounce } from 'lodash';
import i18n from './i18n';
import { I18nextProvider } from 'react-i18next';

import { loadManifest, assignManifest, plantRoot } from './shared';
import reducer from './reducer';
import views from './views';

export function initBook() {
  loadManifest().then(manifestData => {
    const manifest = assignManifest(manifestData);

    const persistedState = localStorage.getItem(manifest.slug);

    const store = createStore(reducer, persistedState ? JSON.parse(persistedState) : { manifest });

    Object.keys(views).forEach(key => {
      const wrapper = plantRoot(key);
      if (!wrapper) return;

      ReactDOM.render(
        <I18nextProvider i18n={i18n}>
          <Provider store={store}>{React.createElement(views[key], null)}</Provider>
        </I18nextProvider>,
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
