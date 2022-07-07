export const updateCache = () => {
  navigator?.serviceWorker?.controller?.postMessage({ message: 'updateCache' });
};
