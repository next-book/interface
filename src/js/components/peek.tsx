import React from 'react';

export interface IProps {
  content: object | null;
  rawContent: string | null;
  title: string;
  source: string;
  showSource: boolean;
  destroy(index: number): void;
  index: number;
}

export default function Peek(props: IProps) {
  function html() {
    if (props.rawContent !== null && props.rawContent !== undefined)
      return { __html: props.rawContent };

    return { __html: '' };
  }

  if (props.content !== null && !React.isValidElement(props.content)) {
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
      {<div className="peek-content" dangerouslySetInnerHTML={html()} />}
    </div>
  );
}
