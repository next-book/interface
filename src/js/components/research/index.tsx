import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

import { IState as ICombinedState } from '../../reducer';
import { getResearchParams } from '../../doc-info';
import { reducer, Consent } from './reducer';
import { init as initTracking } from './tracker';

interface IProps extends WithTranslation {
  consent: Consent;
  denyConsent(): void;
  grantConsent(ga: string): void;
}

export interface IState {
  active: boolean;
  text?: string;
  orgs?: string;
  ga?: string;
}

class Research extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = { active: false };
  }

  componentDidMount() {
    const params = getResearchParams();

    if (params !== null) {
      this.setState({ ...this.state, ...params, active: true });

      if (this.props.consent === Consent.Granted) initTracking(params.ga);
    }
  }

  grantConsent = () => {
    if (this.state.ga) this.props.grantConsent(this.state.ga);
    else this.props.denyConsent();
  };

  render() {
    return !this.state.active || this.props.consent === Consent.Denied ? null : this.props
        .consent === Consent.None ? (
      <div className="_nb-research">
        <h2>{this.props.t('plea-title')}</h2>
        {this.state.text && (
          <p className="plea" dangerouslySetInnerHTML={{ __html: this.state.text }}></p>
        )}

        <p>
          {this.props.t('researcher')}: <strong>{this.state.orgs}</strong>
        </p>

        <div className="buttons">
          <a className="decline" onClick={this.props.denyConsent}>
            {this.props.t('decline')}
          </a>
          <a className="agree" onClick={this.grantConsent}>
            {this.props.t('agree')}
          </a>
        </div>
      </div>
    ) : null;
  }
}

const mapStateToProps = (state: ICombinedState) => {
  return {
    consent: state.research.consent,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators(
    {
      denyConsent: reducer.denyConsent,
      grantConsent: reducer.grantConsent,
    },
    dispatch
  );
};

export default withTranslation('research')(connect(mapStateToProps, mapDispatchToProps)(Research));
