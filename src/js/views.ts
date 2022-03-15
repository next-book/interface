import React from 'react';
import { ComponentClass } from '@next-book/publisher';
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

type IViews = { [key in ComponentClass]: React.ComponentType };

const views: IViews = {
  [ComponentClass.Annotations]: annotations,
  [ComponentClass.Navigation]: navigation,
  [ComponentClass.Position]: position,
  [ComponentClass.Manifest]: manifest,
  [ComponentClass.Peeks]: peeks,
  [ComponentClass.Trace]: trace,
  [ComponentClass.Offline]: offline,
  [ComponentClass.Controls]: controls,
  [ComponentClass.Config]: config,
  [ComponentClass.Onboarding]: onboarding,
  [ComponentClass.Research]: research,
};

export default views;
