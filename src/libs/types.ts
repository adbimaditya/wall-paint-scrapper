export type Success<T> = {
  data: T;
  error: null;
};

export type Failure<E> = {
  data: null;
  error: E;
};

export type Result<T, E = Error> = Success<T> | Failure<E>;

export type Color = {
  id: string;
  name: string;
  code?: string;
  hexCode: string;
};

export type RGB = {
  r: number;
  g: number;
  b: number;
};
