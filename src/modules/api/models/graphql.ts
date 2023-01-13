export type GraphQlRequest = {
  query: string;
  variables: Record<string, never>;
};

export type GraphQlResponse<D> = {
  data: D;
};
