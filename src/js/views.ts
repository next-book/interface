import React from 'react';
import annotations from './components/annotations';
import navigation from './components/navigation';
import position from './components/position';
import manifest from './components/manifest';
import peeks from './components/peeks';
import trace from './components/trace';
import offline from './components/offline';
import controls from './components/controls';
import config from './components/config';
import onboarding from './components/onboarding';
import research from './components/research';

type IViews = { [key: string]: React.ComponentType };

const views: IViews = {
  annotations,
  navigation,
  position,
  manifest,
  peeks,
  trace,
  offline,
  controls,
  config,
  onboarding,
  research,
};

export default views;
