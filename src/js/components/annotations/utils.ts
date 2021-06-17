import { IAnnotation, IAnnotations, IAnnotationStyle, IIdeas, IIdeaRange } from './reducer';

type IHighlightFn = (selection: Selection, range: Range) => IAnnotation | null;
type IRangeCheckFn = (range: Range) => boolean;

const checkRange = (fn: IRangeCheckFn) => {
  const selection = window.getSelection();
  if (selection === null) return false;
  if (selection.isCollapsed === true) return false;
  if (selection.rangeCount === 0) return false;

  const range = selection.getRangeAt(0);
  return fn(range);
};

export const isRangeWithoutOverlap = () => {
  return checkRange(
    (range: Range) =>
      isNodeSelectable(range.startContainer) &&
      areInBetweenNodesSelectable(range.startContainer, range.endContainer) &&
      isNodeSelectable(range.endContainer)
  );
};

export const doesRangeOverlap = () => {
  return checkRange((range: Range) => {
    const startEl = getElement(range.startContainer);
    const endEl = getElement(range.endContainer);

    const startSelectable = isNodeSelectable(range.startContainer);
    const endSelectable = isNodeSelectable(range.endContainer);

    // XOR could make this more understanable
    if (startSelectable != endSelectable) {
      const unselectable = startSelectable ? endEl : startEl;

      if (isElementInsideIdea(unselectable)) {
        const id = getAnnotationId(unselectable);
        if (id !== null)
          return areInBetweenNodesSelectable(range.startContainer, range.endContainer, id);
      }
    }

    return false;
  });
};

const workOnHighlight = (fn: IHighlightFn) => {
  const selection = window.getSelection();
  if (selection === null) return null;
  if (selection.isCollapsed === true) return null;
  if (selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);

  return fn(selection, range);
};

export const extendHighlight = (annotations: IAnnotations) => {
  return workOnHighlight((selection: Selection, range: Range) => {
    const startEl = getElement(range.startContainer);
    const endEl = getElement(range.endContainer);

    const startSelectable = isNodeSelectable(range.startContainer);
    const endSelectable = isNodeSelectable(range.endContainer);

    // XOR could make this more understanable
    if (startSelectable != endSelectable) {
      const unselectable = startSelectable ? endEl : startEl;
      const annotation = annotations[getAnnotationId(unselectable)];

      const spans = [...document.querySelectorAll(`.annotation[data-id="${annotation.id}"]`)];
      const newRange = range.cloneRange();

      if (startSelectable) {
        newRange.setStart(range.startContainer, range.startOffset);
        newRange.setEndAfter(spans[spans.length - 1]);
      }

      if (endSelectable) {
        newRange.setStartBefore(spans[0]);
        newRange.setEnd(range.endContainer, range.endOffset);
      }

      const ideaRanges = getIdeaRanges(newRange);
      for (let i = 0; i < ideaRanges.length; i++) markTempRange(ideaRanges[i]);
      removeAnnotation(annotation.id);
      highlightTempRanges(annotation);
      updateHead(annotation);

      selection.removeAllRanges();
      return annotation;
    }

    return null;
  });
};

export const cropHighlight = (annotations: IAnnotations): IAnnotation | null => {
  return workOnHighlight((selection: Selection, range: Range) => {
    const startEl = getElement(range.startContainer);
    const endEl = getElement(range.endContainer);

    const startSelectable = isNodeSelectable(range.startContainer);
    const endSelectable = isNodeSelectable(range.endContainer);

    // XOR could make this more understanable
    if (startSelectable != endSelectable) {
      const unselectable = startSelectable ? endEl : startEl;
      const annotation = annotations[getAnnotationId(unselectable)];

      const spans = [...document.querySelectorAll(`.annotation[data-id="${annotation.id}"]`)];
      const newRange = document.createRange();

      if (startSelectable) {
        newRange.setStart(range.endContainer, range.endOffset);
        newRange.setEndAfter(spans[spans.length - 1]);
      }

      if (endSelectable) {
        newRange.setStartBefore(spans[0]);
        newRange.setEnd(range.startContainer, range.startOffset);
      }

      const ideaRanges = getIdeaRanges(newRange);
      for (let i = 0; i < ideaRanges.length; i++) markTempRange(ideaRanges[i]);
      removeAnnotation(annotation.id);
      highlightTempRanges(annotation);
      updateHead(annotation);

      selection.removeAllRanges();
      return annotation;
    }

    return null;
  });
};

export const getRangeBounds = (range: Range): IIdeaRange => {
  const start = getIdeaId(range.startContainer);
  const end = getIdeaId(range.endContainer);

  return { start, end };
};

const getElement = (node: Node): Element => {
  return node.nodeType === Node.TEXT_NODE ? <Element>node.parentNode : <Element>node;
};

const getIdeaId = (node: Node): string => {
  const el = getElement(node);
  const idea = <Element>el.closest('.idea');
  return idea.getAttribute('id') as string;
};

const getAnnotationId = (node: Node): number => {
  const el = getElement(node);
  const annotation = el.classList.contains('annotation') ? el : <Element>el.closest('.annotation');
  const id = annotation.getAttribute('data-id') as string;
  return parseInt(id, 10);
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

  const head = document.querySelector(selector) as HTMLElement | null;
  if (head === null) return;

  const note =
    annotation.note.length > 30
      ? annotation.note
          .replace(/&nbsp;|<[^>]+>/g, ' ')
          .substr(0, 40)
          .split(/\s+/)
          .slice(0, 5)
          .join(' ') + '…'
      : annotation.note.replace(/&nbsp;|<[^>]+>/g, ' ');
  head.setAttribute('data-note', note);

  head.innerHTML = annotation.style.symbol;
};

export const removeAnnotation = (id: number, doNotNormalize?: boolean) => {
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

  if (!doNotNormalize)
    toNormalize.forEach(el => {
      el.normalize();
    });
};

const areInBetweenNodesSelectable = (start: Node, end: Node, ignoreAnnotationId?: number) => {
  // Not implemented
  // TODO: check in-between
  // MUST NOT be inside existing annotation
  return true;
};

const isNodeSelectable = (node: Node) => {
  const el = getElement(node);

  if (!isElementInsideIdea(el)) return false;

  // MUST NOT be inside existing annotation
  if (el.closest('.annotation') !== null) return false;
  return true;
};

const isElementInsideIdea = (el: Element) => {
  if (el === null) return false;

  // MUST BE inside an idea
  if (el.closest('.idea') === null) return false;

  return true;
};

export const getIdeaRanges = (range: Range) => {
  return getSafeRanges(range)
    .filter(range => !range.collapsed)
    .reduce((acc, range) => {
      if (isNodeSelectable(range.startContainer)) {
        acc.push(range);
      } else if (range.startContainer === range.endContainer) {
        for (let i = range.startOffset; i < range.endOffset; i++) {
          const child = range.startContainer.childNodes[i];
          if (!child.nodeType || child.nodeType == Node.TEXT_NODE) continue;
          if (child.classList.contains('idea')) acc.push(rangeFromElContents(child));
          else
            child.querySelectorAll('.idea').forEach((idea: Node) => {
              acc.push(rangeFromElContents(idea));
            });
        }
      } else {
        acc.push(range);
      }

      return acc;
    }, []);
};

const rangeFromElContents = (el: Node) => {
  const range = document.createRange();
  range.setStart(el, 0);
  range.setEndAfter(el.lastChild as Node);
  return range;
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

  applyStyle(span, annotation.style);

  span.setAttribute('data-id', annotation.id.toString());
  range.surroundContents(span);

  if (isFirst) addHead(annotation.id.toString(), span);
};

function applyStyle(el: HTMLElement, style: IAnnotationStyle) {
  if (style.color) el.style.color = style.color;
  if (style.backgroundColor) el.style.backgroundColor = style.backgroundColor;
}

export const markTempRange = (range: Range) => {
  const span = document.createElement('SPAN');
  span.classList.add('annotation-temp');
  range.surroundContents(span);
};

const addHead = (id: string, span: Element) => {
  const head = document.createElement('SPAN');
  head.classList.add('annotation__head');
  head.setAttribute('data-id', id);
  span.insertBefore(head, span.firstChild);
};

export const highlightTempRanges = (annotation: IAnnotation) => {
  const spans = document.querySelectorAll('.annotation-temp');
  spans.forEach((span, index) => {
    span.setAttribute('class', 'annotation');
    span.setAttribute('data-id', annotation.id.toString());

    applyStyle(span as HTMLElement, annotation.style);

    if (index === 0) addHead(annotation.id.toString(), span);
  });
};

export const updateRanges = (annotation: IAnnotation) => {
  const spans = document.querySelectorAll(`.annotation[data-id="${annotation.id}"]`);
  spans.forEach(span => {
    span.setAttribute('class', 'annotation');

    applyStyle(span as HTMLElement, annotation.style);
  });
};
