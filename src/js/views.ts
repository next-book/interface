import React from 'react';
import annotations from './components/annotations';
import navigation from './components/navigation';
import manifest from './components/manifest';
import peeks from './components/peeks';
import trace from './components/trace';
import offline from './components/offline';

type IViews = { [key: string]: React.SFC };

const views: IViews = {
  annotations,
  navigation,
  manifest,
  peeks,
  trace,
  offline,
};

export default views;
