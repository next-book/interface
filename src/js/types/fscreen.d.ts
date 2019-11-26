declare module 'fscreen' {
  var fullscreenEnabled: boolean;

  function exitFullscreen(doc: HTMLElement | null): void;

  function requestFullscreen(doc: HTMLElement | null): void;
}
