export interface SearchStep {
  checking?: number;
  range?: [number, number];
  found?: number;
  eliminated?: number[];
  stats: { comparisons: number };
  done?: boolean;
  notFound?: boolean;
}

type SearchGenerator = Generator<SearchStep, void, unknown>;

export function* linearSearch(arr: number[], target: number): SearchGenerator {
  let comparisons = 0;
  for (let i = 0; i < arr.length; i++) {
    comparisons++;
    yield { checking: i, found: -1, stats: { comparisons } };
    if (arr[i] === target) {
      yield { checking: -1, found: i, stats: { comparisons }, done: true };
      return;
    }
  }
  yield { checking: -1, found: -1, stats: { comparisons }, done: true, notFound: true };
}

export function* binarySearch(arr: number[], target: number): SearchGenerator {
  let lo = 0;
  let hi = arr.length - 1;
  let comparisons = 0;
  const eliminated: number[] = [];
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    comparisons++;
    yield { checking: mid, range: [lo, hi], eliminated: eliminated.slice(), found: -1, stats: { comparisons } };
    if (arr[mid] === target) {
      yield { checking: -1, found: mid, eliminated: eliminated.slice(), stats: { comparisons }, done: true };
      return;
    } else if (arr[mid] < target) {
      for (let k = lo; k <= mid; k++) eliminated.push(k);
      lo = mid + 1;
    } else {
      for (let k = mid; k <= hi; k++) eliminated.push(k);
      hi = mid - 1;
    }
  }
  yield { checking: -1, found: -1, eliminated: eliminated.slice(), stats: { comparisons }, done: true, notFound: true };
}

export function* jumpSearch(arr: number[], target: number): SearchGenerator {
  const n = arr.length;
  let step = Math.max(1, Math.floor(Math.sqrt(n)));
  let prev = 0;
  let comparisons = 0;
  const eliminated: number[] = [];

  while (arr[Math.min(step, n) - 1] < target) {
    comparisons++;
    yield {
      checking: Math.min(step, n) - 1,
      range: [prev, Math.min(step, n - 1)],
      eliminated: eliminated.slice(),
      found: -1,
      stats: { comparisons },
    };
    for (let k = prev; k < Math.min(step, n); k++) {
      if (!eliminated.includes(k)) eliminated.push(k);
    }
    prev = step;
    step += Math.max(1, Math.floor(Math.sqrt(n)));
    if (prev >= n) {
      yield { checking: -1, found: -1, eliminated: eliminated.slice(), stats: { comparisons }, done: true, notFound: true };
      return;
    }
  }

  while (prev < Math.min(step, n) && arr[prev] < target) {
    comparisons++;
    yield {
      checking: prev,
      range: [prev, Math.min(step, n - 1)],
      eliminated: eliminated.slice(),
      found: -1,
      stats: { comparisons },
    };
    if (!eliminated.includes(prev)) eliminated.push(prev);
    prev++;
  }

  if (prev < n) {
    comparisons++;
    yield {
      checking: prev,
      range: [prev, prev],
      eliminated: eliminated.slice(),
      found: -1,
      stats: { comparisons },
    };
    if (arr[prev] === target) {
      yield { checking: -1, found: prev, eliminated: eliminated.slice(), stats: { comparisons }, done: true };
      return;
    }
  }

  yield { checking: -1, found: -1, eliminated: eliminated.slice(), stats: { comparisons }, done: true, notFound: true };
}

export interface SearchAlgoMeta {
  label: string;
  fn: (arr: number[], target: number) => SearchGenerator;
  needsSorted: boolean;
  time: [string, string, string];
  space: string;
  pseudo: string;
  blurb: string;
}

export const SEARCH_ALGOS = {
  linear: {
    label: "Linear Search",
    fn: linearSearch,
    needsSorted: false,
    time: ["O(1)", "O(n)", "O(n)"],
    space: "O(1)",
    blurb: "Scans elements one by one until the target is found.",
    pseudo: "for i in 0..n:\n  if a[i] == target:\n    return i\nreturn -1",
  },
  binary: {
    label: "Binary Search",
    fn: binarySearch,
    needsSorted: true,
    time: ["O(1)", "O(log n)", "O(log n)"],
    space: "O(1)",
    blurb: "Requires a sorted array — halves the search range every step.",
    pseudo: "lo, hi = 0, n-1\nwhile lo <= hi:\n  mid = (lo+hi)/2\n  if a[mid] == target: return mid\n  elif a[mid] < target: lo = mid+1\n  else: hi = mid-1",
  },
  jump: {
    label: "Jump Search",
    fn: jumpSearch,
    needsSorted: true,
    time: ["O(1)", "O(\u221An)", "O(\u221An)"],
    space: "O(1)",
    blurb: "Jumps ahead in \u221An block increments to find the sub-interval, then scans linearly.",
    pseudo: "step = \u221An, prev = 0\nwhile a[min(step, n)-1] < target:\n  prev = step; step += \u221An\nwhile a[prev] < target:\n  prev++\nif a[prev] == target: return prev",
  },
} as const satisfies Record<string, SearchAlgoMeta>;

export type SearchAlgoKey = keyof typeof SEARCH_ALGOS;

