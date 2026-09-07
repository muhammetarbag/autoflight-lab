import { useCallback, useEffect, useRef, useState } from "react";
import {
  initialState,
  sample,
  step,
  type Lab,
  type Sample,
  type State,
} from "./engine";
export function useSimulation() {
  const current = useRef(initialState("modes"));
  const historyRef = useRef<Sample[]>([sample(current.current)]);
  const [state, setState] = useState(current.current);
  const [history, setHistory] = useState(historyRef.current);
  const [running, setRunning] = useState(true);
  const [rate, setRate] = useState(1);
  const update = useCallback((fn: (s: State) => State) => {
    current.current = fn(current.current);
    setState(current.current);
  }, []);
  const reset = useCallback((lab?: Lab) => {
    current.current = initialState(lab ?? current.current.lab);
    historyRef.current = [sample(current.current)];
    setState(current.current);
    setHistory(historyRef.current);
  }, []);
  useEffect(() => {
    let frame = 0,
      last = performance.now(),
      accumulator = 0,
      lastPaint = last;
    const tick = (now: number) => {
      if (running && !document.hidden) {
        accumulator += Math.min((now - last) / 1000, 0.1) * rate;
        while (accumulator >= 0.025) {
          current.current = step(current.current, 0.025);
          accumulator -= 0.025;
        }
        if (now - lastPaint >= 75) {
          historyRef.current = [
            ...historyRef.current,
            sample(current.current),
          ].slice(-360);
          setState(current.current);
          setHistory(historyRef.current);
          lastPaint = now;
        }
      }
      last = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, rate]);
  return { state, history, running, setRunning, rate, setRate, update, reset };
}
export type Simulation = ReturnType<typeof useSimulation>;
