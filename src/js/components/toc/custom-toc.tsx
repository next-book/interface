import React, { useState } from 'react';
import { ExpandLess, ExpandMore } from '../../icons';

interface Props {
  toc: Element;
  current: string;
}

export default function CustomToc(props: Props) {
  const [toggles, setToggles] = useState<boolean[]>([]);

  const toggle = (index: number) => {
    const copy = [...toggles];
    copy[index] = !copy[index];
    setToggles(copy);
  };

  const ingestedToc = ingestToc(props.toc, props.current, toggles, toggle);
  if (ingestedToc.toggleCount > toggles.length)
    setToggles(new Array(ingestedToc.toggleCount).fill(false));

  return <>{ingestedToc.comp}</>;
}

const ingestToc = (
  toc: Element,
  current: string,
  toggles: boolean[],
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
              const hasChildList = el.querySelector('ul,ol') !== null;
              const toggleIndex = hasChildList ? toggleCount : null;
              const toggleOn = toggleIndex !== null && toggles[toggleIndex];
              toggleCount += 1;

              return (
                <li key={index} className={toggleOn ? 'unfolded' : 'folded'}>
                  {toggleIndex !== null && (
                    <button className="toggle" onClick={() => toggleCallback(toggleIndex)}>
                      {toggleOn ? ExpandLess : ExpandMore}
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

  const comp = ingestEl(toc);

  return { toggleCount, comp };
};
