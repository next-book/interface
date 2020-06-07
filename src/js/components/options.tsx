import React from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { IState as ICombinedState } from '../reducer';
import { IState as IManifestState } from './manifest-reducer';
import { IState as IOfflineState, SwAvailability } from './offline-reducer';
import { reducer } from './config-reducer';
import { withTranslation, WithTranslation } from 'react-i18next';
import { applyFontSize } from './config';
import Icons from './../icons';

interface IProps extends WithTranslation {
  fontSize: string;
  offline: IOfflineState;
  manifest: IManifestState;
  setFontSize(size: string): void;
  toggleOnboarding(): void;
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
                <button onClick={this.props.toggleOnboarding}>{this.props.t('show-tips')}</button>
              </div>
              <FontSize
                title={this.props.t('font-size')}
                setFontSize={this.setFontSize}
                fontSize={this.props.fontSize}
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

interface IFontSizeProps {
  title: string;
  fontSize: string;
  setFontSize(value: number): void;
}

interface IFontSizeState {
  isShown: boolean;
}

const fontSizes = {
  max: 3,
  min: 0.6,
  step: 0.1,
};

class FontSize extends React.Component<IFontSizeProps, IFontSizeState> {
  constructor(props: IFontSizeProps) {
    super(props);

    this.state = { isShown: false };
  }

  toggleSlider = () => {
    this.setState({ ...this.state, isShown: !this.state.isShown });
  };

  setFontSize = (event: React.SyntheticEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    this.props.setFontSize(parseFloat(value));
  };

  enlargeFontSize = (amount: number) => {
    const oldSize = parseFloat(this.props.fontSize);
    const newSize = Math.round((oldSize + amount) * 10) / 10;

    this.props.setFontSize(
      newSize <= fontSizes.min ? fontSizes.min : newSize >= fontSizes.max ? fontSizes.max : newSize
    );
  };

  collapseOnClickOutside = (e: Event) => {
    const el = e.target as Element;

    const clickedButton =
      el.classList.contains('font-size-slider__toggle') ||
      el.classList.contains('font-size-slider__close') ||
      el.closest('.font-size-slider__close') !== null;
    const clickedOutside =
      !el.classList.contains('font-size-slider') && el.closest('.font-size-slider') === null;

    if (clickedButton || (this.state.isShown && clickedOutside)) this.toggleSlider();
  };

  componentDidMount() {
    window.addEventListener('click', this.collapseOnClickOutside);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.collapseOnClickOutside);
  }

  render() {
    return (
      <div className="cell font-size">
        <h3 className="nb-ui-title cell__title">{this.props.title}</h3>
        <button className="font-size-slider__toggle">
          {Math.floor(parseFloat(this.props.fontSize) * 100)} %
        </button>
        <div className={`font-size-slider ${this.state.isShown ? 'font-size-slider--show' : ''}`}>
          <span className="font-size-slider__close">{Icons.Close}</span>
          <p>
            <strong>{this.props.title}</strong>
          </p>
          <p>
            {Math.floor(parseFloat(this.props.fontSize) * 100)} %
            <br />
            <button className="shrink-font-size" onClick={() => this.enlargeFontSize(-0.1)}>
              A
            </button>
            <input
              className="set-font-size"
              type="range"
              min={fontSizes.min}
              max={fontSizes.max}
              defaultValue={this.props.fontSize}
              onChange={this.setFontSize}
              step={fontSizes.step}
            />
            <button className="enlarge-font-size" onClick={() => this.enlargeFontSize(0.1)}>
              A
            </button>
          </p>
        </div>
      </div>
    );
  }
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
