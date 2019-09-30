import cuid from 'cuid';

function plantRoot(componentName, parent = document.querySelector('body')) {
  const id = cuid();

  const el = document.createElement('div');
  el.classList.add(`nb-${componentName}`);
  el.setAttribute('id', id);
  parent.appendChild(el);
  return el;
}

function status(response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response);
  }
  return Promise.reject(new Error(response.statusText));
}

function json(response) {
  return response.json();
}

function loadManifest() {
  const uri = document.querySelector('link[rel="publication"]').getAttribute('href');
  return fetch(uri)
    .then(status)
    .then(json);
}

module.exports = { plantRoot, loadManifest };
