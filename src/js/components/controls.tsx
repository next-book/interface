import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';

import Progress, { ProgressForm } from './progress';
import Toc from './toc';
import Options from './options';
import Notes from './annotations/desk';

export enum Control {
  None = 'none',
  Toc = 'toc',
  Notes = 'notes',
  Options = 'options',
}

interface IProps extends WithTranslation {}

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
    this.setState({ ...this.state, opened: control });

    if (control === Control.None) document.body.classList.remove('nb-controls-open');
    else document.body.classList.add('nb-controls-open');
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
    window.document.body.addEventListener('click', this.closeControls);
  }

  componentWillUnmount() {
    window.document.body.removeEventListener('click', this.closeControls);
  }

  closeControls = (event: MouseEvent) => {};

  render() {
    return this.state.opened === Control.Toc ? (
      this.renderWrapper(<Toc />)
    ) : this.state.opened === Control.Notes ? (
      this.renderWrapper(<Notes />)
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
        {[Control.Notes, Control.Options, Control.Toc].map((control, index) => (
          <div key={index} title={props.t(`show-${control}`)} onClick={() => props.open(control)} />
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
  const buttons = [
    {
      target: Control.Toc,
      title: props.t('toc'),
    },
    {
      target: Control.Notes,
      title: props.t('annotations'),
    },
    {
      target: Control.Options,
      title: props.t('options'),
    },
  ];

  return (
    <div className="control-bar">
      {buttons.map((button, index) => (
        <span
          key={index}
          className={button.target === props.opened ? 'tab tab--selected' : 'tab'}
          onClick={() => props.open(button.target)}
        >
          {button.title}
        </span>
      ))}
      <span className="close" onClick={() => props.open(Control.None)}>
        ╳
      </span>
    </div>
  );
}

export default withTranslation('controls')(Controls);
