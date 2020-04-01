const SET_SPINE_DATA = 'nb-base/manifest/SET_SPINE_DATA';

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
  Index = 'index',
  Colophon = 'colophon',
  Other = 'other',
}

export function reducer(state: IState | null = null, action: Action) {
  switch (action.type) {
    case SET_SPINE_DATA:
      return action.payload;
    default:
      return state;
  }
}

reducer.setManifestData = function(data: IState) {
  return {
    type: SET_SPINE_DATA,
    payload: data,
  };
};

export type Action = ReturnType<typeof reducer.setManifestData>;
