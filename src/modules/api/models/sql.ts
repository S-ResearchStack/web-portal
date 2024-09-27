export type SqlResponse<R> = {
  metadata: {
    columns: (keyof R)[];
    count: number;
  };
  data: R[];
};
