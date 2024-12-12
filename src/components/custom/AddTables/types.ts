export interface TableColumn {
  title: string;
  key: string;
  // type: "input" | "select" | "date" | "datetime" | "time" | "switch" | "custom";
  type: "input" | "select";
}

export interface TableDataItem {
  id: string;
  isEdit: boolean;
  isSaved: boolean;
  [key: string]: any;
}
