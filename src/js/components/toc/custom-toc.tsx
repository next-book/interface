import React, { useState } from 'react';
import { ExpandLess, ExpandMore } from '../../icons';

interface Props {
  toc: Element;
  current: string;
}

export default function CustomToc(props: Props) {
  const [toggles, setToggles] = useState<(boolean | null)[]>(getDefaultToggles(props.toc));

  const toggle = (index: number) => {
    const copy = [...toggles];
    copy[index] = !copy[index];
    setToggles(copy);
  };

  return <>{ingestToc(props.toc, props.current, toggles, toggle)}</>;
}

const getDefaultToggles = (toc: Element) =>
  [...toc.querySelectorAll('li')].map(li => {
    if (li.querySelector('ul, ol') === null) return null;
    if (li.querySelector(':scope > ul, :scope > ol:not(.headings-toc)') !== null) return true;
    return false;
  });

const ingestToc = (
  toc: Element,
  current: string,
  toggles: (boolean | null)[],
  toggleCallback: (index: number) => void
) => {
  let toggleCount: number = 0;

  const ingestEl = (el: Element) => {
    return (
      <>
        {[...el.children].map((el, index) => {
          switch (el.tagName) {
            case 'UL':
              return (
                <ul key={index} className={[...el.classList].join(' ')}>
                  {ingestEl(el)}
                </ul>
              );
            case 'OL':
              return (
                <ol key={index} className={[...el.classList].join(' ')}>
                  {ingestEl(el)}
                </ol>
              );
            case 'LI':
              const toggleIndex = toggleCount;
              const toggleState = toggles[toggleIndex];
              toggleCount += 1;

              return (
                <li
                  key={index}
                  className={toggleState !== null && toggleState ? 'unfolded' : 'folded'}
                >
                  {toggleState !== null && (
                    <button className="toggle" onClick={() => toggleCallback(toggleIndex)}>
                      {toggleState ? ExpandLess : ExpandMore}
                    </button>
                  )}
                  {ingestEl(el)}
                </li>
              );

            case 'A':
              const href = el.getAttribute('href');

              return (
                <a
                  className={current === href ? 'current-chapter' : ''}
                  href={href || undefined}
                  key={index}
                >
                  {el.textContent}
                </a>
              );
            default:
              return null;
          }
        })}
      </>
    );
  };

  return ingestEl(toc);
};
