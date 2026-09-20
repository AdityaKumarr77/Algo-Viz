import { useCallback, useEffect, useRef, useState } from "react";

interface StepLike {
  done?: boolean;
}

/**
 * Drives any step-generator algorithm (sorting / searching / pathfinding)
 * with Play, Pause and Step controls, without the algorithm code needing
 * to know anything about timing or React.
 */
export function useAlgorithmRunner<TStep extends StepLike>(
  buildGenerator: () => Generator<TStep, void, unknown>,
  onStep: (step: TStep) => void,
  delayMs: number
) {
  const genRef = useRef<Generator<TStep, void, unknown> | null>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const delayRef = useRef(delayMs);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);

  delayRef.current = delayMs;

  const ensureGenerator = useCallback(() => {
    if (!genRef.current) genRef.current = buildGenerator();
  }, [buildGenerator]);

  const stop = useCallback(() => {
    setPlaying(false);
    if (timerRef.current !== undefined) {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  const stepOnce = useCallback((): boolean => {
    ensureGenerator();
    const result = genRef.current!.next();
    if (result.done) {
      setFinished(true);
      return true;
    }
    onStep(result.value);
    if (result.value.done) {
      setFinished(true);
      return true;
    }
    return false;
  }, [ensureGenerator, onStep]);

  const tick = useCallback(() => {
    const done = stepOnce();
    if (done) {
      stop();
      return;
    }
    timerRef.current = window.setTimeout(tick, delayRef.current);
  }, [stepOnce, stop]);

  const play = useCallback(() => {
    ensureGenerator();
    setPlaying(true);
  }, [ensureGenerator]);

  const toggle = useCallback(() => {
    if (playing) stop();
    else play();
  }, [playing, play, stop]);

  const reset = useCallback(() => {
    stop();
    genRef.current = null;
    setFinished(false);
  }, [stop]);

  // Kick off (or keep alive) the tick loop whenever playing turns on.
  useEffect(() => {
    if (!playing) return;
    timerRef.current = window.setTimeout(tick, delayRef.current);
    return () => {
      if (timerRef.current !== undefined) window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  useEffect(() => () => stop(), [stop]);

  return { playing, finished, toggle, stepOnce, reset, stop };
}

/** Maps a 1–5 UI speed value to a millisecond delay between steps. */
export function delayForSpeed(speed: number): number {
  return Math.round(420 - speed * 78); // 342ms .. 30ms
}
