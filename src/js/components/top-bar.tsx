import React from 'react';

import { FullScreen } from './full-screen';
import { IDocument } from './manifest-reducer';

interface IProps {
  title: string;
  chapter: IDocument;
}

export function TopBar(props: IProps) {
  return (
    <div className="top-bar">
      <p className="info">
        <a className="book" href="./index.html">
          {props.title}
        </a>
        <span className="chapter">
          {props.chapter.order + 1}&nbsp;/&nbsp;{props.chapter.title}
        </span>
      </p>
      <p className="tools">
        <FullScreen />
      </p>
    </div>
  );
}
