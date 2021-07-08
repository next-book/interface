import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';

import Progress, { ProgressForm } from './progress';
import Toc from './toc';
import Options from './options';
import Annotations from './annotations/desk';
import { Note, Format, Menu, Close } from './../icons';

import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { IState as ICombinedState } from '../reducer';
import { reducer as onboardingReducer, ShowOnboarding, ColorScheme } from './config/reducer';
import { trackFontSize, trackMenuOpening, trackColorScheme } from './research/tracker';

enum Control {
  None = 'none',
  Toc = 'toc',
  Annotations = 'annotations',
  Options = 'options',
}

const buttons = [
  {
    target: Control.Annotations,
    icon: Note,
  },
  {
    target: Control.Options,
    icon: Format,
  },
  {
    target: Control.Toc,
    icon: Menu,
  },
];

interface IProps extends WithTranslation {
  isOnboardingShown: ShowOnboarding;
  fontSize: string;
  colorScheme: ColorScheme;
  hideOnboarding(): void;
}

interface IState {
  opened: Control;
}

class Controls extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      opened: Control.None,
    };
  }

  open = (control: Control) => {
    if (this.props.isOnboardingShown === ShowOnboarding.Initial) this.props.hideOnboarding();

    this.setState({ ...this.state, opened: control });

    if (control === Control.None) {
      document.body.classList.remove('nb-controls-open');
      trackColorScheme(this.props.colorScheme);
      trackFontSize(this.props.fontSize);
    } else {
      trackMenuOpening();
      document.body.classList.add('nb-controls-open');
    }
  };

  renderWrapper = (control: JSX.Element) => (
    <div className="control ui-target">
      <Tabs opened={this.state.opened} open={this.open} t={this.props.t} />
      <div className={['control__opened', `control__opened-${this.state.opened}`].join(' ')}>
        {control}
      </div>
    </div>
  );

  componentDidMount() {
    document.body.addEventListener('click', this.closeControls);
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.closeControls);
  }

  closeControls = (event: MouseEvent) => {};

  render() {
    return this.state.opened === Control.Toc ? (
      this.renderWrapper(<Toc />)
    ) : this.state.opened === Control.Annotations ? (
      this.renderWrapper(<Annotations />)
    ) : this.state.opened === Control.Options ? (
      this.renderWrapper(<Options />)
    ) : (
      <Launchbar open={this.open} t={this.props.t} />
    );
  }
}

interface ILaunchbarProps {
  open: (control: Control) => void;
  t: (key: string) => string;
}

function Launchbar(props: ILaunchbarProps) {
  return (
    <>
      <div className="controls-launcher ui-target">
        {buttons.map((button, index) => (
          <div
            key={index}
            title={props.t(`show-${button.target}`)}
            onClick={() => props.open(button.target)}
          >
            {button.icon}
          </div>
        ))}
      </div>
      <Progress form={ProgressForm.Display} />
    </>
  );
}

interface ITabsProps {
  opened: Control;
  open: (control: Control) => void;
  t: (key: string) => string;
}

function Tabs(props: ITabsProps) {
  return (
    <div className="control-bar">
      {buttons.map((button, index) => (
        <span
          key={button.target}
          className={button.target === props.opened ? 'tab tab--selected' : 'tab'}
          onClick={() => props.open(button.target)}
        >
          {props.t(button.target)}
        </span>
      ))}
      <span key="close" className="close" onClick={() => props.open(Control.None)}>
        <span>{Close}</span>
      </span>
    </div>
  );
}

const mapStateToProps = (state: ICombinedState) => {
  return {
    isOnboardingShown: state.config.showOnboarding,
    fontSize: state.config.fontSize,
    colorScheme: state.config.colorScheme,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators(
    {
      hideOnboarding: onboardingReducer.hideOnboarding,
    },
    dispatch
  );
};

export default withTranslation('controls')(connect(mapStateToProps, mapDispatchToProps)(Controls));
