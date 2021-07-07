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
};

const send = (category: Category, action: string, value?: string | number) => {
  console.log(initialized);
  if (initialized) {
    if (value === undefined) ReactGA.event({ category, action });
    if (typeof value === 'number') ReactGA.event({ category, action, value: value });
    else ReactGA.event({ category, action, label: value });
  }
};

let trackedMinutes = 0;

export const trackReadingTime = (minutes: number) => {
  if (trackedMinutes !== minutes && minutes % 10 === 0) {
    send(Category.Text, 'time-read', minutes);

    trackedMinutes = minutes;
  }
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

let lastControlTypeTracked = new Date().getTime() / 1000;

export const trackScroll = () => {
  trackControlType(ControlType.Scrolled);
};

export const trackPagination = () => {
  trackControlType(ControlType.Paginated);
};

const trackControlType = (type: ControlType) => {
  const curTime = new Date().getTime() / 1000;
  if (curTime - lastControlTypeTracked > 60) {
    send(Category.Interaction, type);

    lastControlTypeTracked = curTime;
  }
};

export const trackColorSchemeChange = (scheme: string) => {
  send(Category.UI, 'color-scheme', scheme);
};

export const trackFontSizeChange = (size: number) => {
  send(Category.UI, 'font-size', size);
};

const openingsToTrack = [1, 2, 10, 20, 100];
let trackedOpenings = 0;

export const trackMenuOpening = () => {
  trackedOpenings += 1;

  if (openingsToTrack.includes(trackedOpenings)) {
    send(Category.UI, 'menu-opened', trackedOpenings);
  }
};

export const trackAnnotationCreation = () => {
  send(Category.Interaction, 'annotation-created');
};

export const trackNoteCreation = () => {
  send(Category.Interaction, 'note-created');
};

export const trackSeqReturned = () => {
  send(Category.UI, 'seq-return', 'returned');
};

export const trackSeqContinued = () => {
  send(Category.UI, 'seq-return', 'continued');
};

export const trackOfflineStatus = (swAvailable: SwAvailability, cacheAvailable: boolean) => {
  switch (swAvailable) {
    case SwAvailability.Initial:
      return send(Category.Offline, 'initial', cacheAvailable ? 'cached' : 'not-cached');
    case SwAvailability.Unsecure:
      return send(Category.Offline, 'unsecure', cacheAvailable ? 'cached' : 'not-cached');
    case SwAvailability.NoSw:
      return send(Category.Offline, 'no-sw', cacheAvailable ? 'cached' : 'not-cached');
    case SwAvailability.Available:
      return send(Category.Offline, 'available', cacheAvailable ? 'cached' : 'not-cached');
  }
};
