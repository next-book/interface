const SET_MANIFEST_DATA = 'interface/manifest/SET_MANIFEST_DATA';

export interface IState {
  title: string;
  author?: string;
  subtitle?: string;
  published?: string | number;
  keywords?: string[];
  identifier: string;
  revision: string;
  generatedAt: IDate;
  documents: IDocument[];
  tocBase: IBaseTocItem[];
  totals: {
    all: ITotalCounts;
    chapters: ITotalCounts;
  };
}

interface ITotalCounts {
  words: number;
  chars: number;
}

interface IDate {
  date: string;
  unix: number;
}

export interface IToc {
  index: number;
  level: number;
  name: string;
  id: string;
  children: IToc[];
}

export interface IBaseTocItem {
  link: string;
  title: string;
  children?: IBaseTocItem[];
  numberedChildren?: boolean;
}

export interface IDocument {
  title: string;
  file: string;
  words: number;
  chars: number;
  ideas: number;
  role: DocRole;
  order: number | null;
  prev: string | null;
  next: string | null;
  toc: IToc[];
}

export enum DocRole {
  Chapter = 'chapter',
  Cover = 'cover',
  Break = 'break',
  Colophon = 'colophon',
  Other = 'other',
}

export function reducer(state: IState | null = null, action: Actions) {
  switch (action.type) {
    case SET_MANIFEST_DATA:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

reducer.setManifestData = function (data: IState) {
  return <const>{
    type: SET_MANIFEST_DATA,
    payload: data,
  };
};

export type Actions = ReturnType<typeof reducer.setManifestData>;
