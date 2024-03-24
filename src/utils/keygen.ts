import { v4 as uuidv4 } from "uuid";

export function generateId(idBase: string): string {
  return `${idBase}-${uuidv4()}`;
}
