export interface SortStep {
  array: number[];
  comparing?: [number, number];
  swapping?: [number, number];
  pivot?: number;
  sortedMark?: number[];
  stats: { comparisons: number; swaps: number };
  done?: boolean;
}

type SortGenerator = Generator<SortStep, void, unknown>;

function range(lo: number, hi: number): number[] {
  const r: number[] = [];
  for (let i = lo; i < hi; i++) r.push(i);
  return r;
}

export function* bubbleSort(input: number[]): SortGenerator {
  const a = input.slice();
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;
  const sortedMark: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    let swappedAny = false;
    for (let j = 0; j < n - 1 - i; j++) {
      comparisons++;
      yield { array: a.slice(), comparing: [j, j + 1], sortedMark: sortedMark.slice(), stats: { comparisons, swaps } };
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swaps++;
        swappedAny = true;
        yield { array: a.slice(), swapping: [j, j + 1], sortedMark: sortedMark.slice(), stats: { comparisons, swaps } };
      }
    }
    sortedMark.unshift(n - 1 - i);
    if (!swappedAny) break;
  }
  for (let k = 0; k < n; k++) if (!sortedMark.includes(k)) sortedMark.push(k);
  yield { array: a.slice(), sortedMark, stats: { comparisons, swaps }, done: true };
}

export function* selectionSort(input: number[]): SortGenerator {
  const a = input.slice();
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;
  const sortedMark: number[] = [];
  for (let i = 0; i < n; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      comparisons++;
      yield { array: a.slice(), comparing: [minIdx, j], sortedMark: sortedMark.slice(), stats: { comparisons, swaps } };
      if (a[j] < a[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      swaps++;
      yield { array: a.slice(), swapping: [i, minIdx], sortedMark: sortedMark.slice(), stats: { comparisons, swaps } };
    }
    sortedMark.push(i);
  }
  yield { array: a.slice(), sortedMark, stats: { comparisons, swaps }, done: true };
}

export function* insertionSort(input: number[]): SortGenerator {
  const a = input.slice();
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;
  for (let i = 1; i < n; i++) {
    let j = i;
    while (j > 0) {
      comparisons++;
      yield { array: a.slice(), comparing: [j - 1, j], sortedMark: range(0, i), stats: { comparisons, swaps } };
      if (a[j - 1] > a[j]) {
        [a[j - 1], a[j]] = [a[j], a[j - 1]];
        swaps++;
        yield { array: a.slice(), swapping: [j - 1, j], sortedMark: range(0, i), stats: { comparisons, swaps } };
        j--;
      } else {
        break;
      }
    }
  }
  yield { array: a.slice(), sortedMark: range(0, n), stats: { comparisons, swaps }, done: true };
}

export function* mergeSort(input: number[]): SortGenerator {
  const a = input.slice();
  let comparisons = 0;
  let swaps = 0;

  function* sort(lo: number, hi: number): SortGenerator {
    if (hi - lo <= 1) return;
    const mid = (lo + hi) >> 1;
    yield* sort(lo, mid);
    yield* sort(mid, hi);
    const left = a.slice(lo, mid);
    const right = a.slice(mid, hi);
    let i = 0;
    let j = 0;
    let k = lo;
    while (i < left.length && j < right.length) {
      comparisons++;
      yield { array: a.slice(), comparing: [lo + i, mid + j], stats: { comparisons, swaps } };
      if (left[i] <= right[j]) {
        a[k] = left[i];
        i++;
      } else {
        a[k] = right[j];
        j++;
      }
      swaps++;
      yield { array: a.slice(), swapping: [k, k], stats: { comparisons, swaps } };
      k++;
    }
    while (i < left.length) {
      a[k] = left[i];
      i++;
      k++;
      swaps++;
      yield { array: a.slice(), swapping: [k - 1, k - 1], stats: { comparisons, swaps } };
    }
    while (j < right.length) {
      a[k] = right[j];
      j++;
      k++;
      swaps++;
      yield { array: a.slice(), swapping: [k - 1, k - 1], stats: { comparisons, swaps } };
    }
  }

  yield* sort(0, a.length);
  yield { array: a.slice(), sortedMark: range(0, a.length), stats: { comparisons, swaps }, done: true };
}

export function* quickSort(input: number[]): SortGenerator {
  const a = input.slice();
  let comparisons = 0;
  let swaps = 0;
  const sortedMark: number[] = [];

  function* qs(lo: number, hi: number): SortGenerator {
    if (lo >= hi) {
      if (lo === hi) sortedMark.push(lo);
      return;
    }
    const pivot = a[hi];
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      comparisons++;
      yield { array: a.slice(), comparing: [j, hi], pivot: hi, sortedMark: sortedMark.slice(), stats: { comparisons, swaps } };
      if (a[j] < pivot) {
        i++;
        [a[i], a[j]] = [a[j], a[i]];
        swaps++;
        yield { array: a.slice(), swapping: [i, j], pivot: hi, sortedMark: sortedMark.slice(), stats: { comparisons, swaps } };
      }
    }
    [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
    swaps++;
    sortedMark.push(i + 1);
    yield { array: a.slice(), swapping: [i + 1, hi], sortedMark: sortedMark.slice(), stats: { comparisons, swaps } };
    yield* qs(lo, i);
    yield* qs(i + 2, hi);
  }

  yield* qs(0, a.length - 1);
  for (let k = 0; k < a.length; k++) if (!sortedMark.includes(k)) sortedMark.push(k);
  yield { array: a.slice(), sortedMark, stats: { comparisons, swaps }, done: true };
}

export function* heapSort(input: number[]): SortGenerator {
  const a = input.slice();
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;
  const sortedMark: number[] = [];

  function* heapify(size: number, root: number): SortGenerator {
    let largest = root;
    const l = 2 * root + 1;
    const r = 2 * root + 2;
    if (l < size) {
      comparisons++;
      yield { array: a.slice(), comparing: [l, largest], sortedMark: sortedMark.slice(), stats: { comparisons, swaps } };
      if (a[l] > a[largest]) largest = l;
    }
    if (r < size) {
      comparisons++;
      yield { array: a.slice(), comparing: [r, largest], sortedMark: sortedMark.slice(), stats: { comparisons, swaps } };
      if (a[r] > a[largest]) largest = r;
    }
    if (largest !== root) {
      [a[root], a[largest]] = [a[largest], a[root]];
      swaps++;
      yield { array: a.slice(), swapping: [root, largest], sortedMark: sortedMark.slice(), stats: { comparisons, swaps } };
      yield* heapify(size, largest);
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) yield* heapify(n, i);

  for (let end = n - 1; end > 0; end--) {
    [a[0], a[end]] = [a[end], a[0]];
    swaps++;
    sortedMark.unshift(end);
    yield { array: a.slice(), swapping: [0, end], sortedMark: sortedMark.slice(), stats: { comparisons, swaps } };
    yield* heapify(end, 0);
  }
  sortedMark.unshift(0);
  yield { array: a.slice(), sortedMark: range(0, n), stats: { comparisons, swaps }, done: true };
}

export interface AlgoMeta {
  label: string;
  fn: (input: number[]) => SortGenerator;
  time: [string, string, string];
  space: string;
  pseudo: string;
  blurb: string;
}

export const SORT_ALGOS = {
  bubble: {
    label: "Bubble Sort",
    fn: bubbleSort,
    time: ["O(n)", "O(n\u00B2)", "O(n\u00B2)"],
    space: "O(1)",
    blurb: "Repeatedly steps through the array, swapping adjacent elements that are out of order.",
    pseudo: "for i in 0..n:\n  for j in 0..n-i-1:\n    if a[j] > a[j+1]:\n      swap(a[j], a[j+1])",
  },
  selection: {
    label: "Selection Sort",
    fn: selectionSort,
    time: ["O(n\u00B2)", "O(n\u00B2)", "O(n\u00B2)"],
    space: "O(1)",
    blurb: "Finds the minimum of the unsorted region and swaps it into place each pass.",
    pseudo: "for i in 0..n:\n  min = i\n  for j in i+1..n:\n    if a[j] < a[min]: min = j\n  swap(a[i], a[min])",
  },
  insertion: {
    label: "Insertion Sort",
    fn: insertionSort,
    time: ["O(n)", "O(n\u00B2)", "O(n\u00B2)"],
    space: "O(1)",
    blurb: "Builds the sorted array one element at a time, inserting each into its correct position.",
    pseudo: "for i in 1..n:\n  j = i\n  while j > 0 and a[j-1] > a[j]:\n    swap(a[j-1], a[j]); j--",
  },
  merge: {
    label: "Merge Sort",
    fn: mergeSort,
    time: ["O(n log n)", "O(n log n)", "O(n log n)"],
    space: "O(n)",
    blurb: "Recursively splits the array in half, sorts each half, then merges the results.",
    pseudo: "sort(lo, hi):\n  if hi-lo <= 1: return\n  mid = (lo+hi)/2\n  sort(lo, mid); sort(mid, hi)\n  merge(lo, mid, hi)",
  },
  quick: {
    label: "Quick Sort",
    fn: quickSort,
    time: ["O(n log n)", "O(n log n)", "O(n\u00B2)"],
    space: "O(log n)",
    blurb: "Partitions the array around a pivot, then recursively sorts each side.",
    pseudo: "qs(lo, hi):\n  if lo >= hi: return\n  p = partition(lo, hi)\n  qs(lo, p-1); qs(p+1, hi)",
  },
  heap: {
    label: "Heap Sort",
    fn: heapSort,
    time: ["O(n log n)", "O(n log n)", "O(n log n)"],
    space: "O(1)",
    blurb: "Builds a max-heap, then repeatedly extracts the maximum into the sorted region.",
    pseudo: "buildMaxHeap(a)\nfor end in n-1..1:\n  swap(a[0], a[end])\n  heapify(a, 0, end)",
  },
} as const satisfies Record<string, AlgoMeta>;

export type SortAlgoKey = keyof typeof SORT_ALGOS;
