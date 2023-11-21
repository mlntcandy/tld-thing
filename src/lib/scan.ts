export type Variant = [string, number]; // name, complexity
type Vowel = "a" | "e" | "i" | "o" | "u";

function* transformationCrop([src, co]: Variant): Generator<Variant> {
  yield [src, co];
  for (let i = 3; i <= src.length; i++) {
    yield [src.slice(0, i), co + (src.length - i)];
  }
}

function* transformationNoVowel([src, co]: Variant): Generator<Variant> {
  // yield all variations of src with removed vowels
  // e.g. "hello" -> "hllo", "hell", "hll"

  const vowelIndices = [];
  for (let i = 0; i < src.length; i++) {
    if (["a", "e", "i", "o", "u"].includes(src[i])) {
      vowelIndices.push(i);
    }
  }

  if (vowelIndices.length > 20)
    throw new Error("too many vowels, this will crash the browser");

  // yield original string
  yield [src, co];

  // generate all variations of src with removed vowels
  if (vowelIndices.length === 0) return;

  for (let i = 0; i < 2 ** vowelIndices.length; i++) {
    let result = src;
    let c = 0;
    for (let j = 0; j < vowelIndices.length; j++) {
      if ((i >> j) & 1) {
        result =
          result.slice(0, vowelIndices[j]) + result.slice(vowelIndices[j] + 1);
        c++;
      }
    }
    yield [result, co + c];
  }
}

function* transformationSwapVowel([src, co]: Variant): Generator<Variant> {
  const swaps = {
    a: ["e", "u"],
    e: ["a", "i"],
    i: ["e", "u"],
    o: ["u"],
    u: ["a", "i"],
  };

  // yield original string
  yield [src, co];

  // only swap last vowel
  let lastI = -1;
  for (let i = 0; i < src.length; i++) {
    if (["a", "e", "i", "o", "u"].includes(src[i])) {
      lastI = i;
    }
  }
  if (lastI === -1) return;

  const sw = swaps[src[lastI] as Vowel];
  for (let v = 0; v < sw.length; v++) {
    yield [
      src.slice(0, lastI) +
        swaps[src[lastI] as Vowel][v] +
        src.slice(lastI + 1),
      co + (v + 1) / 4,
    ];
  }
}

const transformations = [
  transformationNoVowel,
  transformationCrop,
  // transformationSwapVowel,
];

export function* runTransformations(v: Variant, ti = 0): Generator<Variant> {
  // apply the first transformation, then the second to the result of the first, etc. and yield all results
  // e.g. "hello" -> "hello", "hllo", "hell", "hll", "hell", "hel", "hll", "hl", "hll", "hl"

  if (ti >= transformations.length)
    throw new Error("transformation index out of bounds");

  for (const result of transformations[ti](v)) {
    yield result;
    if (ti < transformations.length - 1)
      yield* runTransformations(result, ti + 1);
  }
}

export function runTransformationsArray(src: string) {
  // same as runTransformations, but returns an array instead of a generator
  const a = [...runTransformations([src, 0])];
  // remove duplicates
  const b: Variant[] = [];
  for (const x of a) {
    if (!b.some((y) => y[0] === x[0])) b.push(x);
  }
  // sort by ascending complexity
  b.sort((a, b) => a[1] - b[1]);

  return b;
}

function partiallyEndsWith(src: string, suffix: string) {
  // "hello", "locomotive" -> true
  // "hello", "loco" -> true
  // "hello", "lo" -> true
  // "hello", "l" -> false

  if (src.length < suffix.length) return false;

  for (let i = 0; i < suffix.length; i++) {
    const slice = suffix.slice(0, i + 1);
    if (src.endsWith(slice)) return src.slice(0, -slice.length);
  }
  return null;
}

export function getCombos(src: string, tlds: string[]) {
  const combos: Variant[] = [];
  const txs = runTransformationsArray(src);
  for (const [txn, txc] of txs) {
    for (const tld of tlds) {
      const result = partiallyEndsWith(txn, tld);
      if (result) {
        let c = txc;
        if (tld.length > 3) c += (tld.length - 3) / 2;
        combos.push([`${result}.${tld}`, c]);
      }
    }
  }
  const b: Variant[] = [];
  for (const x of combos) {
    if (!b.some((y) => y[0] === x[0])) b.push(x);
  }
  return b.sort((a, b) => a[1] - b[1]);
}
