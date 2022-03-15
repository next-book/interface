import React from 'react';
import { DocumentMetadata } from '@next-book/publisher';

interface IProps {
  title: string;
  chapter: DocumentMetadata;
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
    </div>
  );
}
