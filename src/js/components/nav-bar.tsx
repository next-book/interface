import React from 'react';
import { IDocument } from './manifest-reducer';

interface IProps {
  scrollRatio: number;
  isChapter: boolean;
  chapter: IDocument;
  totalWords: number;
  readingOrder: IDocument[];
}

export function NavBar(props: IProps) {
  return (
    <ul className="nav-bar">
      {props.isChapter && (
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
  chapter: IDocument;
  totalWords: number;
}

function Pointer(props: PointerProps) {
  const { offset, width } = getChapterPixels(props.chapter, props.totalWords);
  const left = offset + width * props.scrollRatio;

  return <li className="pointer" style={{ left: left + '%' }} />;
}

interface ChapterProps {
  chapter: IDocument;
  totalWords: number;
}

function Chapter(props: ChapterProps) {
  const { offset, width } = getChapterPixels(props.chapter, props.totalWords);

  return (
    <li
      className="chapter"
      style={{ left: `${offset}%`, width: `${width}%` }}
      data-order={props.chapter.order}
      title={props.chapter.title}
    ></li>
  );
}

function getChapterPixels(chapter, totalWords) {
  if (!chapter || !totalWords) return { offset: 0, width: 0 };

  const offset = (chapter.offsetWords / totalWords) * 100;
  const width = (chapter.words / totalWords) * 100;

  return { offset, width };
}
