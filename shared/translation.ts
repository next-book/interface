type Concat<K extends string, P extends string> = `${K}${'' extends P ? '' : ':'}${P}`;

/**
 * Gets keys like "footer" | "header" | "footer.copyright"
 */
type DeepKeys<T> = T extends object
  ? {
      [K in keyof T]-?: `${K & string}` | Concat<K & string, DeepKeys<T[K]>>;
    }[keyof T]
  : '';
/**
 * Gets only keys like "footer.copyright" | "header.logo" | "header.link"
 */
type DeepLeafKeys<T> = T extends object
  ? { [K in keyof T]-?: Concat<K & string, DeepKeys<T[K]>> }[keyof T]
  : '';
type GetDictValue<T extends string, O> = T extends `${infer A}:${infer B}`
  ? A extends keyof O
    ? GetDictValue<B, O[A]>
    : never
  : T extends keyof O
  ? O[T]
  : never;