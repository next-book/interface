import React from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { IState as ICombinedState } from '../../reducer';
import { IState as IManifestState } from './../manifest-reducer';
import { IState as IOfflineState, SwAvailability } from './../offline-reducer';
import { reducer, DarkMode } from './../config-reducer';
import { withTranslation, WithTranslation } from 'react-i18next';
import { WithT } from 'i18next';
import { applyFontSize, applyDarkMode, applyBasicStyle } from './../config';
import { FontSize } from './font-size';
import AnnotationStyles from './annotation-styles';
import { IAnnotationStyle } from './../annotations/reducer';

interface IProps extends WithTranslation {
  fontSize: string;
  annotationStyles: IAnnotationStyle[];
  offline: IOfflineState;
  manifest: IManifestState;
  setFontSize(size: string): void;
  darkMode: DarkMode;
  setDarkMode(darkMode: DarkMode): void;
  basicStyle: boolean;
  setBasicStyle(basicStyle: boolean): void;
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

  setDarkMode = (mode: DarkMode) => {
    this.props.setDarkMode(mode);
    applyDarkMode(mode);
  };

  setBasicStyle = (basicStyle: boolean) => {
    this.props.setBasicStyle(basicStyle);
    applyBasicStyle(basicStyle);
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
                <button className="button" onClick={this.props.showOnboarding}>
                  {this.props.t('show-tips')}
                </button>
              </div>
              <FontSize
                title={this.props.t('font-size')}
                setFontSize={this.setFontSize}
                fontSize={this.props.fontSize}
              />
              <DarkModeComp
                t={this.props.t}
                setDarkMode={this.setDarkMode}
                darkMode={this.props.darkMode}
              />
              <div className="cell font-size">
                <h3 className="nb-ui-title cell__title">{this.props.t('basic-style')}</h3>
                <div>
                  <Option
                    title={this.props.t('basic-style-label')}
                    isSet={this.props.basicStyle}
                    fn={() => this.setBasicStyle(!this.props.basicStyle)}
                  />
                </div>
              </div>
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

interface IDarkModeProps extends WithT {
  darkMode: DarkMode;
  setDarkMode(darkMode: DarkMode): void;
}

function DarkModeComp(props: IDarkModeProps) {
  const isAuto = props.darkMode === DarkMode.Auto;
  const isDark = props.darkMode === DarkMode.Dark;
  const isLight = props.darkMode === DarkMode.Light;

  return (
    <div className="cell font-size">
      <h3 className="nb-ui-title cell__title">{props.t('dark-mode')}</h3>
      <div className="dark-mode-select">
        <Option
          title={props.t('dark-mode-auto')}
          isSet={isAuto}
          fn={() => props.setDarkMode(DarkMode.Auto)}
        />
        <Option
          title={props.t('dark-mode-light')}
          isSet={isLight}
          fn={() => props.setDarkMode(DarkMode.Light)}
        />
        <Option
          title={props.t('dark-mode-dark')}
          isSet={isDark}
          fn={() => props.setDarkMode(DarkMode.Dark)}
        />
      </div>
    </div>
  );
}

interface IOptionProps {
  title: string;
  isSet: boolean;
  fn(): void;
}

function Option(props: IOptionProps) {
  return (
    <label className={`dot-select ${props.isSet ? 'dot-selected' : ''}`} onClick={props.fn}>
      {props.isSet ? '● ' : '○ '}
      {props.title}
    </label>
  );
}

const mapStateToProps = (state: ICombinedState) => {
  return {
    fontSize: state.config.fontSize,
    basicStyle: state.config.basicStyle,
    darkMode: state.config.darkMode,
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
      setDarkMode: reducer.setDarkMode,
      setBasicStyle: reducer.setBasicStyle,
      updateStyle: reducer.updateStyle,
    },
    dispatch
  );
};

export default withTranslation('options')(connect(mapStateToProps, mapDispatchToProps)(Options));
