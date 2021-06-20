import { IState as IManifest } from './components/manifest/reducer';

import cuid from 'cuid';

export function plantRoot(componentName: string, parent: HTMLElement = document.body): HTMLElement {
  const id = cuid();

  const el = document.createElement('div');
  el.classList.add(`nb-${componentName}`);
  el.setAttribute('id', id);
  parent.appendChild(el);
  return el;
}

function status(response: Response): Promise<Response> {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response);
  }
  return Promise.reject(new Error(response.statusText));
}

function json(response: Response): object {
  return response.json();
}

export function loadManifest(link: string | null): Promise<object> {
  if (link === null) return Promise.reject(new Error('Manifest not available.'));

  return fetch(link)
    .then(status)
    .then(json);
}

export function addReadyBodyClass() {
  document.body.classList.add('nb-ready');
}

export function assignManifest(data: any): IManifest {
  return Object.assign(
    {
      title: data.title,
      identifier: data.identifier,
      revision: data.revision,
      generatedAt: {
        date: data.generatedAt.date,
        unix: data.generatedAt.unix,
      },
      documents: data.documents,
      totals: {
        all: {
          words: data.totals.all.words,
          chars: data.totals.all.chars,
        },
        chapters: {
          words: data.totals.chapters.words,
          chars: data.totals.chapters.chars,
        },
      },
    },
    data.author && { author: data.author },
    data.subtitle && { subtitle: data.subtitle },
    data.published && { published: data.published },
    data.keywords && { keywords: data.keywords }
  );
}
