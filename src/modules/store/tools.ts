export type ErrorType = string;

export interface WithError<E = ErrorType> {
  error?: E;
}

export interface WithLoading<E = string> extends WithError<E> {
  isLoading?: boolean;
  user?: { name?: string; email?: string };
}

export interface WithDeleting<E = string> extends WithError<E> {
  isDeleting?: boolean;
}

export interface WithProcessing<E = string> extends WithError<E> {
  isProcessing?: boolean;
}

export interface WithSending<E = string> extends WithError<E> {
  isSending?: boolean;
}

export interface WithData<T = unknown> {
  data?: T;
}

export interface WithLoadableData<T = unknown, E = ErrorType> extends WithLoading<E>, WithData<T> {}

export interface WithFilter<F> {
  filter: F;
}

export interface WithSort<S> {
  sort: S;
}
