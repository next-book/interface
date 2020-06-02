import React from 'react';
import { IPeek } from './peeks-reducer';

export interface IProps extends IPeek {
  destroy(index: number): void;
}

export default function Peek(props: IProps) {
  return (
    <div className="peek">
      <div className="peek-head">
        <div className="peek-info">
          <p>
            {props.showSource && <a href={props.source}>{props.title}</a>}
            {!props.showSource && props.title}
          </p>
        </div>
        <button className="peek-close" onClick={() => props.destroy(props.hash)}>
          ╳
        </button>
      </div>
      {<div className="peek-content" dangerouslySetInnerHTML={{ __html: props.content }} />}
    </div>
  );
}
