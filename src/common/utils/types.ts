export type ExtendProps<B, E> = Omit<B, keyof E> & E;
