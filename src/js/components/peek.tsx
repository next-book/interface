import React from 'react';
import { reducer, IPeek, Action } from './peeks-reducer';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

export interface IProps {
  content?: object;
  rawContent?: string;
  title: string;
  source: string;
  showSource: boolean;
  destroy(index: number): void;
  index: number;
}

export default function Peek(props: IProps) {
  function html() {
    return { __html: props.rawContent };
  }

  if (props.content !== null && !React.isValidElement(props.content)) {
    console.log(props.content);
    props.destroy(props.index);
    return null;
  }

  return (
    <div className="peek">
      <div className="peek-head">
        <div className="peek-info">
          <p>
            {props.showSource && <a href={props.source}>{props.title}</a>}
            {!props.showSource && props.title}
          </p>
        </div>
        <button className="peek-close" onClick={() => props.destroy(props.index)}>
          ╳
        </button>
      </div>
      {props.content && <div className="peek-content">{props.content}</div>}
      {props.rawContent && <div className="peek-content" dangerouslySetInnerHTML={html()} />}
    </div>
  );
}
