/* global window */

import { Provider } from 'react-redux';
import { createStore } from 'redux';
import React from 'react';
import ReactDOM from 'react-dom';
import { debounce } from 'lodash';
import i18n from './i18n';
import { I18nextProvider } from 'react-i18next';

import { loadManifest, assignManifest, plantRoot, addReadyBodyClass } from './shared';
import docInfo from './doc-info';
import reducer, { IState } from './reducer';
import views from './views';

import { setDocumentValues } from './components/config';

export function initBook() {
  if (docInfo.identifier === null) {
    console.error('Book identifier not found.');
    return;
  }

  const persistedState = localStorage.getItem(docInfo.identifier);

  if (persistedState) init(docInfo.identifier, JSON.parse(persistedState));
  else {
    loadManifest(docInfo.links.manifest).then(manifestData => {
      init(docInfo.identifier, { manifest: assignManifest(manifestData) });
    });
  }
}

function init(identifier: string, state: IState) {
  const store = createStore(reducer, state);
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
