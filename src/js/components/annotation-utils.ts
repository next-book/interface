import { IAnnotation, IIdeas, IStyle, IIdeaRange } from './annotations-reducer';

export const checkSelection = () => {
  const selection = window.getSelection();
  if (selection === null) return false;
  if (selection.isCollapsed === true) return false;
  if (selection.rangeCount === 0) return false;

  const range = selection.getRangeAt(0);

  return (
    isNodeSelectable(range.startContainer) &&
    areInBetweenNodesSelectable(range.startContainer, range.endContainer) &&
    isNodeSelectable(range.endContainer)
  );
};

export const getRangeBounds = (range: Range): IIdeaRange => {
  const start = getIdeaId(range.startContainer);
  const end = getIdeaId(range.endContainer);

  return { start, end };
};

const getIdeaId = (node: Node): string => {
  const el = node.nodeType === Node.TEXT_NODE ? <Element>node.parentNode : <Element>node;
  const idea = <Element>el.closest('.idea');
  return idea.getAttribute('id') as string;
};

export const getAnnotatedIdeas = (): IIdeas => {
  return [...document.querySelectorAll('.annotation')]
    .reduce((acc: Element[], annotation: Element) => {
      const idea = annotation.closest('.idea');
      if (idea !== null && !acc.includes(idea)) acc.push(idea);
      return acc;
    }, [])
    .reduce((acc: IIdeas, idea) => {
      const el = <Element>idea.cloneNode(true);
      const id = el.getAttribute('id');
      if (el !== null && id !== null) acc[id] = el.innerHTML;
      return acc;
    }, {});
};

export const updateHead = (annotation: IAnnotation) => {
  const selector = `.annotation__head[data-id="${annotation.id}"]`;

  const head = document.querySelector(selector);
  if (head === null) return;

  const note = annotation.note
    .replace(/<[^>]+>/g, ' ')
    .split(' ')
    .slice(0, 5)
    .join(' ');
  head.setAttribute('data-note', note);

  head.setAttribute('data-style', annotation.style);
  head.innerHTML = annotation.symbol;
};

export const removeAnnotation = (id: number) => {
  const toNormalize: Element[] = [];

  const head = document.querySelector(`.annotation__head[data-id="${id}"]`);
  if (head !== null) (head.parentNode as Element).removeChild(head);

  const ranges = document.querySelectorAll(`.annotation[data-id="${id}"]`);
  [...ranges].forEach(range => {
    var parent = <Element>range.parentNode;
    while (range.firstChild) parent.insertBefore(range.firstChild, range);
    parent.removeChild(range);

    if (!toNormalize.includes(parent)) toNormalize.push(parent);
  });

  toNormalize.forEach(el => {
    el.normalize();
  });
};

const areInBetweenNodesSelectable = (start: Node, end: Node) => {
  // Not implemented
  // TODO: check in-between
  // MUST NOT be inside existing annotation
  return true;
};

const isNodeSelectable = (node: Node) => {
  const el = node.nodeType === Node.TEXT_NODE ? <Element>node.parentNode : <Element>node;

  // no parent
  if (el === null) return false;

  // MUST BE inside an idea
  if (el.closest('.idea') === null) return false;

  // MUST NOT be inside existing annotation
  if (el.closest('.annotation') !== null) return false;
  return true;
};

// based on code from https://stackoverflow.com/a/12823606/3270421
export const getSafeRanges = (dangerous: Range) => {
  const a = dangerous.commonAncestorContainer;
  // Starts -- Work inward from the start, selecting the largest safe range
  const s = new Array(0),
    rs = new Array(0);
  if (dangerous.startContainer != a)
    for (let i = dangerous.startContainer; i != a; i = <Element>i.parentNode) {
      if (i !== null) s.push(i);
    }
  if (0 < s.length)
    for (let i = 0; i < s.length; i++) {
      const xs = document.createRange();
      if (i) {
        xs.setStartAfter(s[i - 1]);
        xs.setEndAfter(s[i].lastChild);
      } else {
        xs.setStart(s[i], dangerous.startOffset);
        xs.setEndAfter(s[i].nodeType == Node.TEXT_NODE ? s[i] : s[i].lastChild);
      }
      rs.push(xs);
    }

  // Ends -- basically the same code reversed
  const e = new Array(0),
    re = new Array(0);
  if (dangerous.endContainer != a)
    // ts
    for (let i = dangerous.endContainer; i != a; i = <Element>i.parentNode) e.push(i);
  if (0 < e.length)
    for (let i = 0; i < e.length; i++) {
      const xe = document.createRange();
      if (i) {
        xe.setStartBefore(e[i].firstChild);
        xe.setEndBefore(e[i - 1]);
      } else {
        xe.setStartBefore(e[i].nodeType == Node.TEXT_NODE ? e[i] : e[i].firstChild);
        xe.setEnd(e[i], dangerous.endOffset);
      }
      re.unshift(xe);
    }

  // Middle -- the uncaptured middle
  if (0 < s.length && 0 < e.length) {
    const xm = document.createRange();
    xm.setStartAfter(s[s.length - 1]);
    xm.setEndBefore(e[e.length - 1]);
    rs.push(xm);
  } else {
    return [dangerous];
  }

  // Concat
  const response = rs.concat(re);

  // Send to Console
  return response;
};

export const highlightRange = (range: Range, annotation: IAnnotation, isFirst: boolean) => {
  const span = document.createElement('SPAN');
  span.classList.add('annotation');
  if (annotation.style !== IStyle.Default) span.classList.add(`annotation--${annotation.style}`);
  span.setAttribute('data-id', annotation.id.toString());
  range.surroundContents(span);

  if (isFirst) {
    const head = document.createElement('SPAN');
    head.classList.add('annotation__head');
    head.setAttribute('data-id', annotation.id.toString());
    span.insertBefore(head, span.firstChild);
  }
};

export const updateRanges = (annotation: IAnnotation) => {
  const spans = document.querySelectorAll(`.annotation[data-id="${annotation.id}"]`);
  spans.forEach(span => {
    span.setAttribute('class', 'annotation');
    if (annotation.style !== IStyle.Default) span.classList.add(`annotation--${annotation.style}`);
  });
};
