import React from 'react';
import { INavDocument } from './navigation-reducer';
import { getProgress } from './navigation';

interface IProps {
  scrollRatio: number;
  isChapter: boolean;
  chapter: INavDocument | null;
  totalWords: number;
  readingOrder: INavDocument[];
}

export function NavBar(props: IProps) {
  return (
    <ul className="nav-bar">
      {props.chapter && props.isChapter && (
        <Pointer
          scrollRatio={props.scrollRatio}
          chapter={props.chapter}
          totalWords={props.totalWords}
        />
      )}
      {props.readingOrder.map(
        (chapter, index) =>
          chapter.order !== null && (
            <Chapter key={chapter.order} chapter={chapter} totalWords={props.totalWords} />
          )
      )}
    </ul>
  );
}

interface PointerProps {
  scrollRatio: number;
  chapter: INavDocument;
  totalWords: number;
}

function Pointer(props: PointerProps) {
  const { offset, fraction } = getProgress(props.chapter, props.totalWords);
  const left = offset + fraction * props.scrollRatio;

  return <li className="pointer" style={{ left: left + '%' }} />;
}

interface ChapterProps {
  chapter: INavDocument;
  totalWords: number;
}

function Chapter(props: ChapterProps) {
  const { offset, fraction } = getProgress(props.chapter, props.totalWords);

  return (
    <li
      className="chapter"
      style={{ left: `${offset}%`, width: `${fraction}%` }}
      data-order={props.chapter.order}
      title={props.chapter.title}
    ></li>
  );
}
