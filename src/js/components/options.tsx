import React from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { IState as ICombinedState } from '../reducer';
import { IState as IManifestState } from './manifest-reducer';
import { IState as IOfflineState, SwAvailability } from './offline-reducer';
import { reducer } from './config-reducer';
import { withTranslation, WithTranslation } from 'react-i18next';
import { applyFontSize } from './config';

interface IProps extends WithTranslation {
  fontSize: string;
  offline: IOfflineState;
  manifest: IManifestState;
  setFontSize(size: string): void;
  toggleOnboarding(): void;
}

class Options extends React.Component<IProps> {
  setFontSize = (event: React.SyntheticEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    this.props.setFontSize(value);
    applyFontSize(value);
  };

  render() {
    return (
      <div className="scrollable-wrapper">
        <div className="scrollable nb-options">
          <div className="cols">
            <h1 className="nb-ui-big-title">{this.props.t('controls:options')}</h1>
            <div className="cell show-tips">
              <h3 className="nb-ui-title cell__title">{this.props.t('show-tips-title')}</h3>
              <button onClick={this.props.toggleOnboarding}>{this.props.t('show-tips')}</button>
            </div>
            <FontSize
              title={this.props.t('font-size')}
              setFontSize={this.setFontSize}
              fontSize={this.props.fontSize}
            />
            <div className="cell">
              <h3 className="nb-ui-title cell__title">{this.props.t('about-this-book')}</h3>
              <p>
                <strong>{this.props.t('revision')}</strong>: {this.props.manifest.revision}
                <br />
                <strong>{this.props.t('generated-at')}</strong>:{' '}
                {this.props.manifest.generatedAt.date}
              </p>
            </div>
            <div className="cell">
              <h3 className="nb-ui-title cell__title">{this.props.t('offline-mode')}</h3>
              <p>
                {this.props.offline.cacheIsAvailable
                  ? this.props.t('offline:cache-available')
                  : this.props.offline.swIsAvailable === SwAvailability.NoSw
                  ? this.props.t('offline:nosw')
                  : this.props.offline.swIsAvailable === SwAvailability.Unsecure
                  ? this.props.t('offline:unsecure')
                  : this.props.t('offline:problem')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

interface IFontSizeProps {
  title: string;
  fontSize: string;
  setFontSize(event: React.SyntheticEvent<HTMLInputElement>): void;
}

function FontSize(props: IFontSizeProps) {
  return (
    <div className="cell font-size">
      <h3 className="nb-ui-title cell__title">
        {props.title} <span className="val">({Math.floor(parseFloat(props.fontSize) * 100)}%)</span>
      </h3>
      <p>
        <small>A</small>
        <input
          type="range"
          min="0.8"
          max="2"
          defaultValue={props.fontSize}
          onChange={props.setFontSize}
          step="0.1"
        />
        <big>A</big>
      </p>
    </div>
  );
}

const mapStateToProps = (state: ICombinedState) => {
  return {
    fontSize: state.config.fontSize,
    offline: state.offline,
    manifest: state.manifest,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators(
    {
      toggleOnboarding: reducer.toggleOnboarding,
      setFontSize: reducer.setFontSize,
    },
    dispatch
  );
};

export default withTranslation('options')(connect(mapStateToProps, mapDispatchToProps)(Options));
