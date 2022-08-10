import ReactGA from 'react-ga4';
import { SwAvailability } from '../offline/reducer';
import Tracker from '@next-book/analytics';

enum Category {
  Text = 'text',
  Interaction = 'interaction',
  UI = 'ui',
  Offline = 'offline',
}

let initialized: boolean = false;

export const init = (gaId: string, nbId: string) => {
  const path = document.location.pathname;
  const domain = document.location.host + path.substring(path.indexOf('/'), path.lastIndexOf('/'));
  Tracker.init(nbId, domain, 'http://127.0.0.1:3000', true);
  console.log('Tracker Initialized');
  Tracker.send('pageview');
  ReactGA.initialize(gaId);
  ReactGA.pageview();
  initialized = true;

  console.log('Research data collection initialized.');

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
    const time = curTime - startTime;
    send(Category.Text, 'time-read', time);
    Tracker.send({
      name: 'time-read',
      category: Category.Text,
      value: time.toString(),
    });
  };
};

const amountsToTrack = [1, 2, 3, 5, 8, 13, 21, 34, 55, 75, 98];
let trackedAmount: number[] = [];

export const trackAmountRead = (amount: number) => {
  if (amountsToTrack.includes(amount) && !trackedAmount.includes(amount)) {
    send(Category.Text, 'amount-read', amount);
    Tracker.send({
      name: 'amount-read',
      category: Category.Text,
      value: amount.toString(),
    });
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
  Tracker.send({
    name: type,
    category: Category.Interaction,
    method: controller,
  });
};

export const trackColorScheme = (scheme: string) => {
  send(Category.UI, 'color-scheme', scheme);
  Tracker.send({
    name: 'changed-color-scheme',
    category: Category.UI,
    value: scheme,
  });
};

export const trackFontSize = (size: string) => {
  send(Category.UI, 'font-size', parseInt(size, 10));
  Tracker.send({
    name: 'changed-font-size',
    category: Category.UI,
    value: size,
  });
};

const openingsToTrack = [1, 2, 10, 20, 100];
let trackedOpenings = 0;

export const trackMenuOpening = () => {
  trackedOpenings += 1;

  if (openingsToTrack.includes(trackedOpenings)) {
    send(Category.UI, 'menu-opened', trackedOpenings);
    Tracker.send({
      name: 'menu-opened',
      category: Category.UI,
      value: trackedOpenings.toString(),
    });
  }
};

export const trackAnnotationCreation = (symbol: string) => {
  send(Category.Interaction, 'annotation-created', symbol);
  Tracker.send({
    name: 'annotation-created',
    category: Category.Interaction,
    value: symbol,
  });
};

export const trackNoteCreation = () => {
  send(Category.Interaction, 'note-created');
  Tracker.send({
    name: 'note-created',
    category: Category.Interaction,
  });
};

export const trackSeqReturned = () => {
  send(Category.UI, 'seq-return', 'returned');
  Tracker.send({
    name: 'seq-return',
    category: Category.UI,
    value: 'returned',
  });
};

export const trackSeqReset = () => {
  send(Category.UI, 'seq-return', 'reset');
  Tracker.send({
    name: 'seq-return',
    category: Category.UI,
    value: 'reset',
  });
};

export const trackOfflineStatus = (swAvailable: SwAvailability) => {
  const dictionary: { [key in SwAvailability]: string } = {
    [SwAvailability.Initial]: 'initial',
    [SwAvailability.Unsecure]: 'unsecure',
    [SwAvailability.NoSw]: 'no-sw',
    [SwAvailability.Available]: 'available',
  };
  const availability = dictionary[swAvailable];
  Tracker.send({
    name: 'offline-status',
    category: Category.Offline,
    value: availability,
  });
  return send(Category.Offline, availability);
};
