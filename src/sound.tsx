import { useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import type { PositionalAudio as PositionalAudioImpl } from "three";
import { useStore } from "./state.js";
import { PositionalAudio } from "@react-three/drei";

export const EngineAudio = () => {
  const ref = useRef<PositionalAudioImpl>(null);

  useFrame((_, delta) => {
    const { speed } = useStore.getState();
    const ratio = Math.abs(Math.min(1, speed / 0.4));
    ref.current?.setVolume(ratio * 0.9 + 0.1);
    ref.current?.setPlaybackRate(ratio + 0.5);
  });

  const interacted = useStore((state) => state.interacted);

  if (!interacted) {
    return null;
  }

  return (
    <PositionalAudio autoplay ref={ref} url="/auto/engine.mp3" loop distance={5} />
  );
};
