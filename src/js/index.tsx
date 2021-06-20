/* global window */

import { Provider } from 'react-redux';
import { createStore, Store } from 'redux';
import React from 'react';
import ReactDOM from 'react-dom';
import { debounce } from 'lodash';
import i18n from './i18n';
import { I18nextProvider } from 'react-i18next';

import { loadManifest, assignManifest, plantRoot, addReadyBodyClass } from './shared';
import docInfo from './doc-info';
import reducer from './reducer';
import views from './views';

import { reducer as manifestReducer } from './components/manifest/reducer';
import { setDocumentValues } from './components/config';

export function initBook() {
  const id = docInfo.identifier;

  if (id !== null) {
    const persistedState = localStorage.getItem(id);

    if (persistedState) {
      init(id, createStore(reducer, JSON.parse(persistedState)));
    } else {
      loadManifest(docInfo.links.manifest).then(manifestData => {
        const store = createStore(reducer);
        store.dispatch(manifestReducer.setManifestData(assignManifest(manifestData)));
        init(id, store);
      });
    }
  } else {
    console.error('Book identifier not found.');
    return;
  }
}

function init(identifier: string, store: Store) {
  setDocumentValues(store.getState().config);

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
      localStorage.setItem(identifier, JSON.stringify(store.getState()));
    }, 500)
  );

  addReadyBodyClass();
  (window as any).book = store;
}
