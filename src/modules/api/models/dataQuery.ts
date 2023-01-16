type TableDefinition = {
  name?: string;
  columns?: {
    name?: string;
    type?: string;
  }[];
};

export type GetTablesResponse = {
  tables?: TableDefinition[];
};
