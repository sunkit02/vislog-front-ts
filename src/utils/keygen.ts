const MAX = 100000;
const MIN = 0;
const MAX_LEN = MAX.toString().length;

export function generateId(idBase: string) {
  const randNum = Math.round(MIN + Math.random() * (MAX - MIN));
  const randNumStr = randNum.toString().padStart(MAX_LEN, "0");
  return `${idBase}-${randNumStr}`;
}
