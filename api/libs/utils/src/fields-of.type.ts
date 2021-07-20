export type FieldsOf<T> = {
  [index in keyof T]: T[index];
};
