import React from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { IState as ICombinedState } from '../../reducer';
import { IState as IManifestState } from './../manifest/reducer';
import { IPosition } from './../position/reducer';
import { IState as IOfflineState, SwAvailability } from './../offline/reducer';
import { reducer, ColorScheme } from './../config/reducer';
import { withTranslation, WithTranslation } from 'react-i18next';
import { WithT } from 'i18next';
import { applyFontSize, applyColorScheme, applyBasicStyle } from './../config';
import { FontSize } from './font-size';
import AnnotationStyles from './annotation-styles';
import { IAnnotationStyle } from './../annotations/reducer';
import { scrollToIdea } from './../../doc-info';

interface IProps extends WithTranslation {
  fontSize: string;
  annotationStyles: IAnnotationStyle[];
  offline: IOfflineState;
  manifest: IManifestState;
  setFontSize(size: string): void;
  colorScheme: ColorScheme;
  setColorScheme(colorScheme: ColorScheme): void;
  basicStyle: boolean;
  setBasicStyle(basicStyle: boolean): void;
  invisibleNav: boolean;
  setInvisibleNav(invisibleNav: boolean): void;
  updateStyle(index: number, style: IAnnotationStyle): void;
  position: IPosition | null;
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
    const [{ value: month }, , { value: day }, , { value: year }] =
      dateTimeFormat.formatToParts(date);

    this.state = { dateGenerated: `${month} ${day}, ${year}` };
  }

  setFontSize = (value: number) => {
    const idea = this.props.position !== null ? this.props.position.idea : null;

    const valueString = '' + value;
    this.props.setFontSize(valueString);
    applyFontSize(valueString);

    scrollToIdea(idea);
  };

  setColorScheme = (mode: ColorScheme) => {
    this.props.setColorScheme(mode);
    applyColorScheme(mode);
  };

  setBasicStyle = (basicStyle: boolean) => {
    const idea = this.props.position !== null ? this.props.position.idea : null;

    this.props.setBasicStyle(basicStyle);
    applyBasicStyle(basicStyle);

    scrollToIdea(idea);
  };

  render() {
    return (
      <>
        <div className="scrollable-wrapper">
          <div className="scrollable nb-options">
            <div className="options-wrapper">
              <h1 className="nb-ui-big-title">{this.props.t('controls:options')}</h1>
              <FontSize
                title={this.props.t('font-size')}
                setFontSize={this.setFontSize}
                fontSize={this.props.fontSize}
              />
              <ColorSchemeComp
                t={this.props.t}
                setColorScheme={this.setColorScheme}
                colorScheme={this.props.colorScheme}
              />
              <AnnotationStyles
                styles={this.props.annotationStyles}
                updateStyle={this.props.updateStyle}
              />
              <div className="cell font-size">
                <h3 className="nb-ui-title cell__title">{this.props.t('basic-style')}</h3>
                <p>
                  <Option
                    title={this.props.t('basic-style-label')}
                    isSet={this.props.basicStyle}
                    fn={() => this.setBasicStyle(!this.props.basicStyle)}
                  />
                </p>
                <p>
                  <Option
                    title={this.props.t('invisible-nav-label')}
                    isSet={this.props.invisibleNav}
                    fn={() => this.props.setInvisibleNav(!this.props.invisibleNav)}
                  />
                </p>
              </div>
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

interface IColorSchemeProps extends WithT {
  colorScheme: ColorScheme;
  setColorScheme(colorScheme: ColorScheme): void;
  t: (key: string) => string;
}

function ColorSchemeComp(props: IColorSchemeProps) {
  const isAuto = props.colorScheme === ColorScheme.Auto;
  const isDark = props.colorScheme === ColorScheme.Dark;
  const isLight = props.colorScheme === ColorScheme.Light;
  const isSepia = props.colorScheme === ColorScheme.Sepia;

  return (
    <div className="cell font-size">
      <h3 className="nb-ui-title cell__title">{props.t('color-scheme')}</h3>
      <div className="color-scheme-select">
        <Option
          title={props.t('color-scheme-auto')}
          isSet={isAuto}
          fn={() => props.setColorScheme(ColorScheme.Auto)}
        />
        <Option
          title={props.t('color-scheme-light')}
          isSet={isLight}
          fn={() => props.setColorScheme(ColorScheme.Light)}
        />
        <Option
          title={props.t('color-scheme-dark')}
          isSet={isDark}
          fn={() => props.setColorScheme(ColorScheme.Dark)}
        />
        <Option
          title={props.t('color-scheme-sepia')}
          isSet={isSepia}
          fn={() => props.setColorScheme(ColorScheme.Sepia)}
        />
        <p className="explanation">{props.t('color-scheme-auto-explanation')}</p>
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
    colorScheme: state.config.colorScheme,
    invisibleNav: state.config.invisibleNav,
    annotationStyles: state.config.annotationStyles,
    offline: state.offline,
    manifest: state.manifest,
    position: state.position.position,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators(
    {
      setFontSize: reducer.setFontSize,
      setColorScheme: reducer.setColorScheme,
      setBasicStyle: reducer.setBasicStyle,
      setInvisibleNav: reducer.setInvisibleNav,
      updateStyle: reducer.updateStyle,
    },
    dispatch
  );
};

export default withTranslation('options')(connect(mapStateToProps, mapDispatchToProps)(Options));
