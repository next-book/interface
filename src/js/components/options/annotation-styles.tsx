import React from 'react';
import { IAnnotationStyle, bgColors, textColors } from './../annotations/reducer';
import { withTranslation, WithTranslation } from 'react-i18next';

interface IProps extends WithTranslation {
  styles: IAnnotationStyle[];
  updateStyle(index: number, style: IAnnotationStyle): void;
}

interface IState {
  edited: number | null;
  prev: IAnnotationStyle | null;
}

class AnnotationStyles extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = { edited: null, prev: null };
  }

  selectStyle = (index: number) => {
    if (this.state.edited === index) this.setState({ ...this.state, edited: null });
    else this.setState({ ...this.state, edited: index, prev: this.props.styles[index] });
  };

  updateName = (event: React.SyntheticEvent<HTMLInputElement>) => {
    if (this.state.edited !== null)
      this.props.updateStyle(this.state.edited, {
        ...this.props.styles[this.state.edited],
        name: event.currentTarget.value,
      });
  };

  updateSymbol = (event: React.SyntheticEvent<HTMLInputElement>) => {
    if (this.state.edited !== null)
      this.props.updateStyle(this.state.edited, {
        ...this.props.styles[this.state.edited],
        symbol: event.currentTarget.value,
      });
  };

  updateQuick = (event: React.SyntheticEvent<HTMLInputElement>) => {
    if (this.state.edited !== null)
      this.props.updateStyle(this.state.edited, {
        ...this.props.styles[this.state.edited],
        quick: event.currentTarget.checked,
      });
  };

  updateColor = (color: string) => {
    if (this.state.edited !== null)
      this.props.updateStyle(this.state.edited, {
        ...this.props.styles[this.state.edited],
        color,
      });
  };

  updateBgColor = (color: string) => {
    if (this.state.edited !== null)
      this.props.updateStyle(this.state.edited, {
        ...this.props.styles[this.state.edited],
        backgroundColor: color,
      });
  };

  collapseOnClickOutside = (e: Event) => {
    const el = e.target as Element;
    if (
      !el.classList.contains('style') &&
      !el.classList.contains('style-editor') &&
      el.closest('.style') === null &&
      el.closest('.style-editor') === null
    )
      this.setState({ ...this.state, edited: null });
  };

  componentDidMount() {
    window.addEventListener('click', this.collapseOnClickOutside);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.collapseOnClickOutside);
  }

  render() {
    const values = this.state.edited !== null ? this.props.styles[this.state.edited] : null;

    return (
      <div className="cell annotation-styles">
        <h3 className="nb-ui-title cell__title">{this.props.t('annotation-styles')}</h3>
        <div className="styles">
          {this.props.styles.map((style, index) => {
            const colors: { color?: string; backgroundColor?: string } = {};
            if (style.color) colors.color = style.color;
            if (style.backgroundColor) colors.backgroundColor = style.backgroundColor;

            return (
              <span
                key={index}
                onClick={() => this.selectStyle(index)}
                className={`style ${this.state.edited === index ? 'style-edited' : ''}`}
                style={colors}
              >
                <span className="emoji">{style.symbol}</span> {style.name}
                <span className="quick">{style.quick && '‧‧‧'}</span>
              </span>
            );
          })}
        </div>
        {values !== null && (
          <div className="style-editor">
            <input type="text" onChange={this.updateName} value={values.name} />
            <input
              type="text"
              maxLength={4}
              size={4}
              className="emoji"
              onChange={this.updateSymbol}
              value={values.symbol}
            />
            <div className="color-select">
              {bgColors.map(color => (
                <div
                  key={color}
                  onClick={() => this.updateBgColor(color)}
                  style={{ backgroundColor: color }}
                >
                  A
                </div>
              ))}
            </div>
            <div className="color-select">
              {textColors.map(color => (
                <div key={color} onClick={() => this.updateColor(color)} style={{ color: color }}>
                  Text
                </div>
              ))}
            </div>
            <label>
              <input type="checkbox" onChange={this.updateQuick} checked={values.quick} />{' '}
              {this.props.t('create-quick-note')}
            </label>
            <p className="nb-ui-note">{this.props.t('change-does-overwrite-existing')}</p>
          </div>
        )}
      </div>
    );
  }
}

export default withTranslation('options')(AnnotationStyles);
