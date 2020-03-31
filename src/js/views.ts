import React from 'react';
import annotations from './components/annotations';
import navigation from './components/navigation';
import position from './components/position';
import manifest from './components/manifest';
import peeks from './components/peeks';
import trace from './components/trace';
import offline from './components/offline';
import controls from './components/controls';

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
};

export default views;
