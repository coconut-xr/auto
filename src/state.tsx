import { RefObject } from "react";
import { create } from "zustand";
import { combine } from "zustand/middleware";
import { RevoluteImpulseJoint } from "@dimforge/rapier3d-compat";

type State = {
  interacted: boolean;
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  keyboardSpeed: number;
  keyboardSteering: number;
  nauterlichSpeed: number;
  natuerlichSteering: number;
  steering: number;
  speed: number;

  steeringRefs: Array<RefObject<RevoluteImpulseJoint | undefined>>;
  motorRefs: Array<RefObject<RevoluteImpulseJoint | undefined>>;
};

const initialState: State = {
  down: false,
  up: false,
  left: false,
  right: false,
  keyboardSpeed: 0,
  keyboardSteering: 0,
  natuerlichSteering: 0,
  nauterlichSpeed: 0,
  steering: 0,
  speed: 0,
  motorRefs: [],
  steeringRefs: [],
  interacted: false,
};

export const useStore = create(
  combine(initialState, (set, get) => ({
    onClick() {
      set({ interacted: true });
    },
    updateControls() {
      const {
        motorRefs,
        steeringRefs,
        keyboardSpeed,
        keyboardSteering,
        natuerlichSteering,
        nauterlichSpeed,
      } = get();
      const speed = nauterlichSpeed + keyboardSpeed;
      const steering = keyboardSteering + natuerlichSteering;
      set({ steering, speed });
      for (const ref of motorRefs) {
        if (ref.current == null) {
          continue;
        }
        ref.current.configureMotorVelocity(speed * 110, 1000);
      }
      for (const ref of steeringRefs) {
        if (ref.current == null) {
          continue;
        }
        ref.current.configureMotorPosition(steering * 0.25, 1000000, 5);
      }
    },
    setNatuerlichSteering(natuerlichSteering: number) {
      set({
        natuerlichSteering,
      });
      this.updateControls();
    },
    setNatuerlichSpeed(nauterlichSpeed: number) {
      set({
        nauterlichSpeed,
      });
      this.updateControls();
    },
    updateKeyboard() {
      const { up, down, left, right } = get();
      let keyboardSpeed = 0;
      let keyboardSteering = 0;
      if (up) {
        keyboardSpeed += 0.4;
      }
      if (down) {
        keyboardSpeed -= 0.4;
      }
      if (right) {
        keyboardSteering += 200;
      }
      if (left) {
        keyboardSteering -= 200;
      }
      set({
        keyboardSpeed,
        keyboardSteering,
      });
      this.updateControls();
    },
    onKeyDown(key: string) {
      switch (key) {
        case "ArrowUp":
          set({ up: true });
          break;
        case "ArrowDown":
          set({ down: true });
          break;
        case "ArrowLeft":
          set({ left: true });
          break;
        case "ArrowRight":
          set({ right: true });
          break;
        default:
          return;
      }
      this.updateKeyboard();
    },
    onKeyUp(key: string) {
      switch (key) {
        case "ArrowUp":
          set({ up: false });
          break;
        case "ArrowDown":
          set({ down: false });
          break;
        case "ArrowLeft":
          set({ left: false });
          break;
        case "ArrowRight":
          set({ right: false });
          break;
        default:
          return;
      }
      this.updateKeyboard();
    },
  }))
);

window.addEventListener("keydown", (e) => {
  useStore.getState().onKeyDown(e.key);
});

window.addEventListener("keyup", (e) => {
  useStore.getState().onKeyUp(e.key);
});

window.addEventListener("click", useStore.getState().onClick);
