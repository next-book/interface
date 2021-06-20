import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';

import { Consent } from './reducer';

interface IProps extends WithTranslation {}

export interface IState {
  consent: Consent;
}

class Research extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = { consent: Consent.None };
  }
}

export default withTranslation('research')(Research);
