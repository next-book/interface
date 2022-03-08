import Manifest from "@next-book/publisher/shared/manifest";
const SET_MANIFEST_DATA = 'interface/manifest/SET_MANIFEST_DATA';

export function reducer(state: Manifest | null = null, action: Actions) {
  switch (action.type) {
    case SET_MANIFEST_DATA:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

reducer.setManifestData = function (data: Manifest) {
  return <const>{
    type: SET_MANIFEST_DATA,
    payload: data,
  };
};

export type Actions = ReturnType<typeof reducer.setManifestData>;
