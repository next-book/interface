import React from 'react';
import { INavDocument, IDocMap } from './position-reducer';
import { DocRole } from './manifest-reducer';
import { getProgress } from './progress';

interface IProps {
  scrollRatio: number;
  docRole: DocRole;
  chapter: INavDocument | null;
  totalWords: number;
  readingOrder: string[];
  documents: IDocMap;
}

export function NavBar(props: IProps) {
  return (
    <ul className="nav-bar">
      {props.chapter && props.docRole === DocRole.Chapter && (
        <Pointer
          scrollRatio={props.scrollRatio}
          chapter={props.chapter}
          totalWords={props.totalWords}
        />
      )}
      {props.readingOrder.map((file, index) => {
        const chapter = props.documents[file];
        return (
          chapter.order !== null && (
            <Chapter key={chapter.order} chapter={chapter} totalWords={props.totalWords} />
          )
        );
      })}
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
  const width = offset + fraction * props.scrollRatio;

  return <li className="pointer" style={{ width: width + '%' }} />;
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
