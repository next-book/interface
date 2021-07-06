import React from 'react';
import { Close } from './../../icons';

interface IProps {
  title: string;
  fontSize: string;
  setFontSize(value: number): void;
}

interface IState {
  isShown: boolean;
}

const fontSizes = {
  max: 3,
  min: 0.6,
  step: 0.1,
};

export class FontSize extends React.Component<IProps, IState> {
  constructor(props: IProps) {
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
        <button className="button font-size-slider__toggle">
          {Math.floor(parseFloat(this.props.fontSize) * 100)} %
        </button>
        <div className={`font-size-slider ${this.state.isShown ? 'font-size-slider--show' : ''}`}>
          <span className="font-size-slider__close">{Close}</span>
          <p>
            <strong>{this.props.title}</strong>
          </p>
          <p>
            {Math.floor(parseFloat(this.props.fontSize) * 100)} %
            <br />
            <button className="button shrink-font-size" onClick={() => this.enlargeFontSize(-0.1)}>
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
            <button className="button enlarge-font-size" onClick={() => this.enlargeFontSize(0.1)}>
              A
            </button>
          </p>
        </div>
      </div>
    );
  }
}
