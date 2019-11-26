import React from 'react';

import { FullScreen } from './full-screen';
import { IDocument } from './manifest-reducer';

interface IProps {
  title: string;
  chapter: IDocument;
}

export function TopBar(props: IProps) {
  const chapterNumber = () => {
    if (props.chapter.order !== null) {
      return `${props.chapter.order + 1}&nbsp;/&nbsp;`;
    } else return null;
  };

  return (
    <div className="top-bar">
      <p className="info">
        <a className="book" href="./index.html">
          {props.title}
        </a>
        <span className="chapter">
          {chapterNumber()}
          {props.chapter.title}
        </span>
      </p>
      <p className="tools">
        <FullScreen />
      </p>
    </div>
  );
}
