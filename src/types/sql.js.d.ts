declare module "sql.js" {
  export interface BindParams {
    [key: string]: string | number | Uint8Array | null;
  }
  export interface ParamsObject {
    [key: string]: string | number | Uint8Array | null;
  }
  export type Params = (string | number | Uint8Array | null)[] | ParamsObject;

  export interface QueryExecResult {
    columns: string[];
    values: (string | number | Uint8Array | null)[][];
  }

  export interface Database {
    run(sql: string, params?: Params): Database;
    exec(sql: string): QueryExecResult[];
    export(): Uint8Array;
    close(): void;
    getRowsModified(): number;
    create_function(name: string, fn: (...args: unknown[]) => unknown): void;
    prepare(sql: string): Statement;
  }

  export interface Statement {
    bind(params?: Params): boolean;
    step(): boolean;
    get(): (string | number | Uint8Array | null)[];
    getAsObject(): Record<string, string | number | Uint8Array | null>;
    free(): boolean;
  }

  export interface SqlJsStatic {
    Database: new (data?: Uint8Array) => Database;
  }

  export default function initSqlJs(
    config?: { locateFile?: (file: string) => string }
  ): Promise<SqlJsStatic>;
}
