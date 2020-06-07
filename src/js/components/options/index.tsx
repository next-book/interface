import React from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { IState as ICombinedState } from '../../reducer';
import { IState as IManifestState } from './../manifest-reducer';
import { IState as IOfflineState, SwAvailability } from './../offline-reducer';
import { reducer } from './../config-reducer';
import { withTranslation, WithTranslation } from 'react-i18next';
import { applyFontSize } from './../config';
import { FontSize } from './font-size';
import AnnotationStyles from './annotation-styles';
import { IAnnotationStyle } from './../annotations/reducer';

interface IProps extends WithTranslation {
  fontSize: string;
  annotationStyles: IAnnotationStyle[];
  offline: IOfflineState;
  manifest: IManifestState;
  setFontSize(size: string): void;
  updateStyle(index: number, style: IAnnotationStyle): void;
  showOnboarding(): void;
}

interface IState {
  dateGenerated: string;
}

class Options extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    const date = new Date(this.props.manifest.generatedAt.date);

    const dateTimeFormat = new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
    const [{ value: month }, , { value: day }, , { value: year }] = dateTimeFormat.formatToParts(
      date
    );

    this.state = { dateGenerated: `${month} ${day}, ${year}` };
  }

  setFontSize = (value: number) => {
    const valueString = '' + value;
    this.props.setFontSize(valueString);
    applyFontSize(valueString);
  };

  render() {
    return (
      <>
        <div className="scrollable-wrapper">
          <div className="scrollable nb-options">
            <div className="options-wrapper">
              <h1 className="nb-ui-big-title">{this.props.t('controls:options')}</h1>
              <div className="cell show-tips">
                <h3 className="nb-ui-title cell__title">{this.props.t('show-tips-title')}</h3>
                <button onClick={this.props.showOnboarding}>{this.props.t('show-tips')}</button>
              </div>
              <FontSize
                title={this.props.t('font-size')}
                setFontSize={this.setFontSize}
                fontSize={this.props.fontSize}
              />
              <AnnotationStyles
                styles={this.props.annotationStyles}
                updateStyle={this.props.updateStyle}
              />
            </div>
          </div>
        </div>
        <div className="control__details">
          <div>
            <h3 className="nb-ui-title">{this.props.t('offline-mode')}</h3>
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
          <div>
            <h3 className="nb-ui-title">{this.props.t('about-this-book')}</h3>
            <p>
              {this.props.t('revision')} {this.props.manifest.revision}
              <br />
              {this.props.t('generated-at')} {this.state.dateGenerated}
            </p>
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state: ICombinedState) => {
  return {
    fontSize: state.config.fontSize,
    annotationStyles: state.config.annotationStyles,
    offline: state.offline,
    manifest: state.manifest,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators(
    {
      showOnboarding: reducer.showOnboarding,
      setFontSize: reducer.setFontSize,
      updateStyle: reducer.updateStyle,
    },
    dispatch
  );
};

export default withTranslation('options')(connect(mapStateToProps, mapDispatchToProps)(Options));
