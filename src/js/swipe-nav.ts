import { Direction } from './components/navigation';

let preventClick: boolean = false;
let xDown: number | null = null;
let yDown: number | null = null;
let callback: callbackFn | null = null;

type callbackFn = (e: TouchEvent, dir: Direction) => void;

export function initSwipeNav(fn: callbackFn) {
  callback = fn;

  document.addEventListener('touchstart', handleSwipeStart, false);
  document.addEventListener('touchmove', handleSwipeMove, { passive: false });
  document.addEventListener('touchend', handleSwipeEnd, true);
}

function getTouches(e: TouchEvent) {
  return e.touches;
}

function handleSwipeEnd(e: TouchEvent) {
  if (preventClick) {
    e.preventDefault();
    e.stopPropagation();
    preventClick = false;
  }
}

function handleSwipeStart(e: TouchEvent) {
  const firstTouch = getTouches(e)[0];
  xDown = firstTouch.clientX;
  yDown = firstTouch.clientY;
}

function handleSwipeMove(e: TouchEvent) {
  if (preventClick) e.preventDefault();

  if (!xDown || !yDown) {
    return;
  }

  var xUp = e.touches[0].clientX;
  var yUp = e.touches[0].clientY;

  var xDiff = xDown - xUp;
  var yDiff = yDown - yUp;

  if (callback != null && Math.abs(xDiff) > Math.abs(yDiff)) {
    if (xDiff > 8) callback(e, Direction.Forward);
    else callback(e, Direction.Back);

    preventClick = true;
    e.preventDefault();
  }

  xDown = null;
  yDown = null;
}
