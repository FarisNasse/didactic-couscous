import type { Data, Operation } from "../domain/model";
export interface Repository {
  load(): Promise<Data>;
  commit(operations: Operation[]): Promise<void>;
  close(): Promise<void>;
}
