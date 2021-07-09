import ReactGA from 'react-ga4';
import { SwAvailability } from '../offline/reducer';

enum Category {
  Text = 'text',
  Interaction = 'interaction',
  UI = 'ui',
  Offline = 'offline',
}

let initialized: boolean = false;

export const init = (id: string) => {
  ReactGA.initialize(id);
  ReactGA.pageview();
  initialized = true;

  console.log('Research data collection initialized');

  setInterval(trackReadingTime(), 1000 * 60 * 10);
};

const getMinutes = () => {
  return Math.round(new Date().getTime() / (60 * 1000));
};

const send = (category: Category, action: string, value?: string | number) => {
  if (initialized) {
    console.log(`Event: ${category}, ${action} (${value}).`);

    if (value === undefined) ReactGA.event({ category, action });
    if (typeof value === 'number') ReactGA.event({ category, action, value: value });
    else ReactGA.event({ category, action, label: value });
  }
};

export const trackReadingTime = () => {
  const startTime = getMinutes();

  return () => {
    const curTime = getMinutes();
    send(Category.Text, 'time-read', curTime - startTime);
  };
};

const amountsToTrack = [1, 2, 3, 5, 8, 13, 21, 34, 55, 75, 98];
let trackedAmount: number[] = [];

export const trackAmountRead = (amount: number) => {
  if (amountsToTrack.includes(amount) && !trackedAmount.includes(amount)) {
    send(Category.Text, 'amount-read', amount);
    trackedAmount.push(amount);
  }
};

enum ControlType {
  Scrolled = 'scrolled',
  Paginated = 'paginated',
}

export enum Controller {
  Keyboard = 'keyboard',
  Swipe = 'swipe',
  Buttons = 'buttons',
  Scroll = 'scroll',
}

export const trackScroll = () => {
  trackControlType(ControlType.Scrolled, Controller.Scroll);
};

export const trackPagination = (controller: Controller) => {
  trackControlType(ControlType.Paginated, controller);
};

const trackControlType = (type: ControlType, controller: Controller) => {
  send(Category.Interaction, type, controller);
};

export const trackColorScheme = (scheme: string) => {
  send(Category.UI, 'color-scheme', scheme);
};

export const trackFontSize = (size: string) => {
  send(Category.UI, 'font-size', parseInt(size, 10));
};

const openingsToTrack = [1, 2, 10, 20, 100];
let trackedOpenings = 0;

export const trackMenuOpening = () => {
  trackedOpenings += 1;

  if (openingsToTrack.includes(trackedOpenings)) {
    send(Category.UI, 'menu-opened', trackedOpenings);
  }
};

export const trackAnnotationCreation = (symbol: string) => {
  send(Category.Interaction, 'annotation-created', symbol);
};

export const trackNoteCreation = () => {
  send(Category.Interaction, 'note-created');
};

export const trackSeqReturned = () => {
  send(Category.UI, 'seq-return', 'returned');
};

export const trackSeqReset = () => {
  send(Category.UI, 'seq-return', 'reset');
};

export const trackOfflineStatus = (swAvailable: SwAvailability) => {
  switch (swAvailable) {
    case SwAvailability.Initial:
      return send(Category.Offline, 'initial');
    case SwAvailability.Unsecure:
      return send(Category.Offline, 'unsecure');
    case SwAvailability.NoSw:
      return send(Category.Offline, 'no-sw');
    case SwAvailability.Available:
      return send(Category.Offline, 'available');
  }
};
