import React from 'react';
import { reducer, ShowOnboarding } from './config/reducer';
import { IState as ICombinedState } from '../reducer';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { withTranslation, WithTranslation } from 'react-i18next';

import docInfo from '../doc-info';
import { DocRole } from '@next-book/publisher';
import { Close } from './../icons';

interface IProps extends WithTranslation {
  offline: boolean;
  isShown: ShowOnboarding;
  show(): void;
  hide(): void;
}

interface IState {
  card: number;
}

enum Cards {
  Pagination = 'pagination',
  Remember = 'remember',
  Annotations = 'annotations',
}

export class Onboarding extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      card: 0,
    };
  }

  show = (card: number) => {
    this.setState({ ...this.state, card });
  };

  render() {
    const cards = Object.values(Cards);

    const showOpener =
      docInfo.role !== DocRole.Cover && this.props.isShown === ShowOnboarding.Initial;

    const showOnboarding = this.props.isShown === ShowOnboarding.Enabled;

    if (showOpener)
      return (
        <div className="onboarding-opener ui-target">
          <div className="onboarding-opener-bubble">
            <div className="onboarding-opener-intro">
              <strong>{this.props.t('intro-head')}</strong> {this.props.t('intro')}{' '}
            </div>
            <div className="buttons">
              <a onClick={() => this.props.show()}>{this.props.t('intro-show')}</a>
              <a onClick={this.props.hide}>{this.props.t('intro-hide')}</a>
            </div>
          </div>
        </div>
      );

    if (showOnboarding)
      return (
        <>
          <div className="onboarding-overlay ui-target"></div>
          <div className="onboarding ui-target">
            <span className="close" onClick={this.props.hide}>
              {Close}
            </span>
            <div className="onboarding__card">
              <h2>{this.props.t(`${cards[this.state.card]}-heading`)}</h2>
              <div className="onboarding__content">
                {Svgs[cards[this.state.card]]()}
                <div className="tip">
                  {this.props
                    .t(cards[this.state.card])
                    .split(/\|/g)
                    .map((text, index) => (
                      <p key={index}>{text}</p>
                    ))}
                  {!this.props.offline && this.state.card === 1 && this.props.t('read-offline')}
                </div>
              </div>
              <div className="onboarding__controls">
                {this.state.card > 0 && (
                  <div
                    className="onboarding__controls__back-button"
                    onClick={() => this.show(this.state.card - 1)}
                  >
                    &larr;
                  </div>
                )}
                {this.state.card < Object.keys(Cards).length - 1 ? (
                  <div
                    className="onboarding__controls__button"
                    onClick={() => this.show(this.state.card + 1)}
                  >
                    {this.props.t('next')}
                  </div>
                ) : (
                  <div className="onboarding__controls__button" onClick={this.props.hide}>
                    {this.props.t('close')}
                  </div>
                )}
                <div className="dots">
                  {cards.map((card, index) => (
                    <span
                      onClick={() => this.show(index)}
                      key={index}
                      className={(this.state.card === index && 'current') || ''}
                    >
                      ●
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      );

    return null;
  }
}

const Svgs = {
  pagination: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fillRule="evenodd"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit="1.5"
      clipRule="evenodd"
      viewBox="0 0 286 552"
    >
      <path id="pagination" fill="none" d="M0 0H286V552H0z"></path>
      <path
        id="phone"
        fill="#fff6de"
        stroke="#9a4663"
        strokeWidth="5"
        d="M280 32.4C280 17.278 267.722 5 252.6 5H33.4C18.278 5 6 17.278 6 32.4v487.2C6 534.722 18.278 547 33.4 547h219.2c15.122 0 27.4-12.278 27.4-27.4V32.4z"
      ></path>
      <path fill="#d9d3ca" d="M27.347 33H258.653V41H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 52H258.653V60H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 72H258.653V80H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 90H258.653V98H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 111H258.653V119H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 130H116.65299999999999V138H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 164.453H258.653V172.453H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 281.141H258.653V289.141H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 394.836H258.653V402.836H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 183.453H258.653V191.453H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 300.141H242.65300000000002V308.141H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 413.836H258.653V421.836H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 203.453H258.653V211.453H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 433.836H258.653V441.836H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 221.453H258.653V229.453H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 338.141H258.653V346.141H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 451.836H258.653V459.836H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 242.453H258.653V250.453H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 359.141H258.653V367.141H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 472.836H258.653V480.836H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 261.453H258.653V269.453H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 378.141H174V386.141H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 491.836H236.65300000000002V499.836H27.347z"></path>
      <path
        fill="#9a4663"
        d="M43.875 178c9.176 0 16.625 7.45 16.625 16.625v162.75c0 9.176-7.449 16.625-16.625 16.625h-33.25c-1.605 0-3.156-.228-4.625-.653V178.653a16.609 16.609 0 014.625-.653h33.25zM242.125 374c-9.176 0-16.625-7.45-16.625-16.625v-162.75c0-9.176 7.449-16.625 16.625-16.625h33.25c1.605 0 3.156.228 4.625.653v194.694c-1.468.425-3.02.653-4.625.653h-33.25z"
      ></path>

      <path
        fill="#fff6de"
        d="M249.294 267.6v-6.064l20.3 14.464-20.3 14.464V284.4h-12.888v-16.8h12.888zM36.956 103.9v6.064L16.656 95.5l20.3-14.464V87.1h12.888v16.8H36.956zM29.544 267.6v-6.064L49.844 276l-20.3 14.464V284.4H16.656v-16.8h12.888zM256.706 103.9v6.064l-20.3-14.464 20.3-14.464V87.1h12.888v16.8h-12.888z"
      ></path>
    </svg>
  ),
  annotations: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fillRule="evenodd"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit="1.5"
      clipRule="evenodd"
      viewBox="0 0 286 552"
    >
      <path fill="none" d="M0 0H286V552H0z"></path>
      <path
        fill="#fff6de"
        stroke="#9a4663"
        strokeWidth="5"
        d="M280 32.4C280 17.278 267.722 5 252.6 5H33.4C18.278 5 6 17.278 6 32.4v487.2C6 534.722 18.278 547 33.4 547h219.2c15.122 0 27.4-12.278 27.4-27.4V32.4z"
      ></path>
      <path fill="#d9d3ca" d="M27.347 33H258.653V41H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 52H258.653V60H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 72H258.653V80H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 90H258.653V98H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 111H258.653V119H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 130H116.65299999999999V138H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 164.453H258.653V172.453H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 281.141H258.653V289.141H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 394.836H258.653V402.836H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 183.453H258.653V191.453H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 300.141H242.65300000000002V308.141H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 413.836H258.653V421.836H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 203.453H258.653V211.453H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 433.836H258.653V441.836H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 221.453H258.653V229.453H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 338.141H258.653V346.141H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 451.836H258.653V459.836H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 242.453H258.653V250.453H27.347z"></path>
      <g fill="#9a4663">
        <path d="M27.347 178.492H258.653V197.09199999999998H27.347z"></path>
        <path d="M135 158.888H258.653V177.488H135z"></path>
        <path d="M27.347 198.096H258.653V216.696H27.347z"></path>
        <path d="M27.347 217.7H172V236.29999999999998H27.347z"></path>
      </g>
      <path fill="#d9d3ca" d="M27.347 359.141H258.653V367.141H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 472.836H258.653V480.836H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 261.453H258.653V269.453H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 378.141H174V386.141H27.347z"></path>
      <path fill="#d9d3ca" d="M27.347 491.836H236.65300000000002V499.836H27.347z"></path>
      <path
        fill="#9a4663"
        fillRule="nonzero"
        d="M140.659 142.952h2.975l1.708 8.08 1.75-8.08h3.057l-3.253 11.219h-3.015l-1.76-8.172-1.781 8.172h-3.046l-3.15-11.219h3.15l1.749 8.049 1.616-8.049zM156.797 152.102c.858 0 1.517-.305 1.976-.916.46-.611.69-1.479.69-2.604s-.23-1.991-.69-2.599c-.459-.607-1.118-.911-1.976-.911-.857 0-1.518.304-1.981.911-.463.608-.695 1.474-.695 2.599 0 1.125.232 1.993.695 2.604.463.611 1.124.916 1.981.916zm5.743-3.52c0 1.647-.473 3.055-1.42 4.225-.947 1.17-2.384 1.755-4.312 1.755-1.928 0-3.366-.585-4.313-1.755-.947-1.17-1.42-2.578-1.42-4.225 0-1.619.473-3.022 1.42-4.209.947-1.187 2.385-1.781 4.313-1.781s3.365.594 4.312 1.781c.947 1.187 1.42 2.59 1.42 4.209zM169.93 142.952h2.975l1.708 8.08 1.75-8.08h3.057l-3.253 11.219h-3.015l-1.76-8.172-1.781 8.172h-3.046l-3.15-11.219h3.15l1.749 8.049 1.616-8.049z"
      ></path>
    </svg>
  ),
  remember: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fillRule="evenodd"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit="1.5"
      clipRule="evenodd"
      viewBox="0 0 286 552"
    >
      <path id="return" fill="none" d="M0 0H286V552H0z"></path>
      <path
        id="phone"
        fill="#fff6de"
        stroke="#9a4663"
        strokeWidth="5"
        d="M280 32.4C280 17.278 267.722 5 252.6 5H33.4C18.278 5 6 17.278 6 32.4v487.2C6 534.722 18.278 547 33.4 547h219.2c15.122 0 27.4-12.278 27.4-27.4V32.4z"
      ></path>
      <path
        fill="none"
        stroke="#d9d3ca"
        strokeLinejoin="miter"
        strokeMiterlimit="4"
        strokeWidth="5"
        d="M106.114 219.753l73.772 39.309M179.886 219.753l-73.772 39.309"
      ></path>
      <path fill="#d9d3ca" d="M43.173 69H242.826V116.407H43.173z"></path>
      <path fill="#d9d3ca" d="M33 124H253V171.40699999999998H33z"></path>
      <path fill="#d9d3ca" d="M91.673 312H194.32600000000002V330H91.673z"></path>
      <path fill="#d9d3ca" d="M74.173 334.977H211.826V352.977H74.173z"></path>
      <path fill="#d9d3ca" d="M27.347 491.836H236.65300000000002V499.836H27.347z"></path>
      <g>
        <path
          fill="#fff6de"
          stroke="#9a4663"
          strokeWidth="5"
          d="M258.653 433.312c0-6.83-5.545-12.375-12.375-12.375H39.722c-6.83 0-12.375 5.545-12.375 12.375v79.049c0 6.83 5.545 12.375 12.375 12.375h206.556c6.83 0 12.375-5.545 12.375-12.375v-79.049z"
        ></path>
        <path
          fill="#9a4663"
          fillRule="nonzero"
          d="M113.594 450.638c0 .995.16 1.817.48 2.469.594 1.2 1.674 1.8 3.24 1.8a3.59 3.59 0 002.511-.986c.714-.657 1.071-1.603 1.071-2.837 0-1.634-.663-2.725-1.988-3.274-.754-.308-1.943-.463-3.566-.463v-3.497c1.589-.022 2.697-.177 3.326-.462 1.085-.48 1.628-1.452 1.628-2.914 0-.949-.277-1.72-.831-2.314-.554-.595-1.334-.892-2.34-.892-1.154 0-2.003.366-2.545 1.097-.543.732-.803 1.709-.78 2.931h-4.56c.046-1.234.257-2.405.634-3.514.4-.971 1.029-1.868 1.886-2.691a6.574 6.574 0 012.28-1.337c.88-.308 1.96-.463 3.239-.463 2.377 0 4.294.615 5.751 1.843 1.457 1.229 2.186 2.877 2.186 4.945 0 1.463-.434 2.697-1.303 3.703-.548.628-1.12 1.057-1.714 1.286.446 0 1.086.382 1.92 1.148 1.245 1.154 1.868 2.731 1.868 4.731 0 2.103-.728 3.951-2.185 5.545-1.457 1.594-3.614 2.391-6.471 2.391-3.52 0-5.965-1.148-7.337-3.445-.72-1.223-1.12-2.823-1.2-4.8h4.8zM128.49 458.266c.046-1.782.428-3.411 1.148-4.885.697-1.657 2.343-3.411 4.937-5.262 2.251-1.612 3.708-2.766 4.371-3.463 1.017-1.086 1.526-2.274 1.526-3.565 0-1.052-.292-1.926-.875-2.623-.582-.697-1.417-1.046-2.502-1.046-1.486 0-2.497.555-3.034 1.663-.309.64-.492 1.657-.549 3.051h-4.748c.08-2.114.463-3.822 1.149-5.125 1.302-2.48 3.616-3.72 6.942-3.72 2.628 0 4.719.729 6.274 2.186 1.554 1.457 2.331 3.385 2.331 5.785 0 1.84-.549 3.474-1.646 4.903-.72.948-1.902 2.005-3.548 3.171l-1.954 1.388c-1.223.869-2.06 1.497-2.511 1.886-.452.388-.832.84-1.14 1.354h10.85v4.302H128.49zM154.099 442.633c.754 0 1.397-.265 1.928-.797a2.623 2.623 0 00.797-1.928c0-.754-.265-1.397-.797-1.928a2.624 2.624 0 00-1.928-.798c-.754 0-1.397.266-1.928.798a2.623 2.623 0 00-.797 1.928c0 .754.265 1.397.797 1.928a2.623 2.623 0 001.928.797zm6.377-2.725c0 1.76-.62 3.263-1.86 4.508-1.24 1.246-2.746 1.869-4.517 1.869-1.76 0-3.263-.623-4.508-1.869-1.246-1.245-1.869-2.748-1.869-4.508 0-1.76.623-3.263 1.869-4.508 1.245-1.246 2.748-1.869 4.508-1.869 1.76 0 3.263.623 4.508 1.869 1.246 1.245 1.869 2.748 1.869 4.508zm13.01 12.479a2.63 2.63 0 00-.797-1.929 2.63 2.63 0 00-1.929-.797c-.754 0-1.397.266-1.928.797a2.63 2.63 0 00-.797 1.929c0 .754.266 1.397.797 1.928a2.623 2.623 0 001.928.797c.755 0 1.397-.265 1.929-.797a2.627 2.627 0 00.797-1.928zm3.651 0c0 1.76-.623 3.262-1.868 4.508-1.246 1.246-2.749 1.868-4.509 1.868-1.759 0-3.262-.622-4.508-1.868-1.245-1.246-1.868-2.748-1.868-4.508 0-1.771.623-3.277 1.868-4.517 1.246-1.24 2.749-1.86 4.508-1.86 1.76 0 3.263.623 4.509 1.869 1.245 1.245 1.868 2.748 1.868 4.508zm-9.102-18.976h2.605l-13.85 25.507h-2.657l13.902-25.507z"
        ></path>
        <path fill="none" stroke="#9a4663" strokeWidth="5" d="M27.347 472.836h231.306"></path>
        <path
          fill="#9a4663"
          d="M139.294 490.664V484.6l20.3 14.464-20.3 14.464v-6.064h-12.888v-16.8h12.888z"
        ></path>
      </g>
    </svg>
  ),
};

const mapStateToProps = (state: ICombinedState) => {
  return { offline: state.offline.cacheIsAvailable, isShown: state.config.showOnboarding };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators(
    {
      show: reducer.showOnboarding,
      hide: reducer.hideOnboarding,
    },
    dispatch
  );
};

export default withTranslation('onboarding')(
  connect(mapStateToProps, mapDispatchToProps)(Onboarding)
);
