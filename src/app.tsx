import {
  XR,
  NonImmersiveCamera,
  ImmersiveSessionOrigin,
  useEnterXR,
} from "@coconut-xr/natuerlich/react";
import { XWebPointers } from "@coconut-xr/xinteraction/react";
import {
  CuboidCollider,
  CylinderCollider,
  MeshCollider,
  Physics,
  RapierRigidBody,
  RigidBody,
  interactionGroups,
  useRevoluteJoint,
} from "@react-three/rapier";
import { RevoluteImpulseJoint } from "@dimforge/rapier3d-compat";
import { RefObject, Suspense, useEffect, useRef } from "react";
import { Model as Car } from "./car.js";
import { Environment, Gltf, OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Euler, Quaternion } from "three";
import { useStore } from "./state.js";
import { Controllers, Hands } from "@coconut-xr/natuerlich/defaults";
import { EngineAudio } from "./sound.js";

const options: XRSessionInit = {
  requiredFeatures: ["local-floor"],
  optionalFeatures: ["hand-tracking"],
};

export default function App() {
  const enterVR = useEnterXR("immersive-vr", options);
  useEffect(() => {
    const element = document.getElementById("enter-vr");
    if (element == null) {
      return;
    }

    element.addEventListener("click", enterVR);
    return () => element.removeEventListener("click", enterVR);
  }, []);
  return (
    <>
      <XR />
      <Environment preset="sunset" blur={0.2} background />
      <XWebPointers />
      <Suspense>
        <Physics debug>
          <Suspense>
            <CarPhysics />
          </Suspense>
          <ambientLight intensity={10} />
          <directionalLight intensity={10} position={[1, 1, 1]} />
          <RigidBody gravityScale={0} position={[0, -5, 0]}>
            <Gltf scale={0.3} src="/auto/track.glb" />
          </RigidBody>
        </Physics>
      </Suspense>
    </>
  );
}

const wheelDefaultOrientation = new Quaternion().setFromEuler(
  new Euler(0, 0, Math.PI / 2)
);

const { motorRefs, steeringRefs } = useStore.getState();

function CarPhysics() {
  const body = useRef<RapierRigidBody>(null);

  const wheel1 = useRef<RapierRigidBody>(null);
  const wheel2 = useRef<RapierRigidBody>(null);
  const wheel3 = useRef<RapierRigidBody>(null);
  const wheel4 = useRef<RapierRigidBody>(null);
  const stearing1 = useRef<RapierRigidBody>(null);
  const stearing2 = useRef<RapierRigidBody>(null);

  motorRefs[0] = useRevoluteJoint(wheel1, body, [
    [0, 0, 0],
    [3 * 0.35, 0.4, 5 * 0.35],
    [1, 0, 0],
  ]);

  motorRefs[1] = useRevoluteJoint(wheel2, body, [
    [0, 0, 0],
    [-3 * 0.35, 0.4, 5 * 0.35],
    [1, 0, 0],
  ]);

  useRevoluteJoint(wheel3, stearing1, [
    [0, 0, 0],
    [0, 0, 0],
    [1, 0, 0],
  ]);

  useRevoluteJoint(wheel4, stearing2, [
    [0, 0, 0],
    [0, 0, 0],
    [1, 0, 0],
  ]);

  steeringRefs[0] = useRevoluteJoint(body, stearing1, [
    [3 * 0.35, 0.4, -5 * 0.35],
    [0, 0, 0],
    [0, 1, 0],
  ]);

  steeringRefs[1] = useRevoluteJoint(body, stearing2, [
    [-3 * 0.35, 0.4, -5 * 0.35],
    [0, 0, 0],
    [0, 1, 0],
  ]);

  return (
    <>
      <RigidBody ref={body} colliders={false} restitution={0.1}>
        <CuboidCollider
          collisionGroups={interactionGroups(1, 1)}
          position={[0, 0.85, 0]}
          args={[0.8, 0.7, 2.8]}
          mass={0.01}
        >
          <Car scale={0.35} position={[0, -0.85, 0]} rotation-y={Math.PI} />
          <EngineAudio />
          <NonImmersiveCamera position={[-0.5, 0.4, 0.5]} />
          <ImmersiveSessionOrigin position={[-0.5, -0.9, 0.5]}>
            <Hands type="grab" />
            <Controllers type="grab" />
          </ImmersiveSessionOrigin>
        </CuboidCollider>
      </RigidBody>
      <RigidBody
        collisionGroups={interactionGroups([], [])}
        ref={stearing1}
        canSleep={false}
        position={[3 * 0.35, 0.4, -5 * 0.35]}
        restitution={0.01}
      >
        <CuboidCollider args={[0.1, 0.1, 0.1]} />
      </RigidBody>
      <RigidBody
        collisionGroups={interactionGroups([], [])}
        ref={stearing2}
        position={[-3 * 0.35, 0.4, -5 * 0.35]}
        canSleep={false}
        restitution={0.01}
      >
        <CuboidCollider args={[0.1, 0.1, 0.1]} />
      </RigidBody>
      <RigidBody
        canSleep={false}
        ref={wheel1}
        position={[3 * 0.35, 0.4, 5 * 0.35]}
        colliders={false}
        restitution={0.01}
        friction={1}
        collisionGroups={interactionGroups(0, 0)}
      >
        <CylinderCollider
          quaternion={wheelDefaultOrientation}
          args={[0.2, 0.35]}
        />
      </RigidBody>
      <RigidBody
        canSleep={false}
        ref={wheel2}
        position={[-3 * 0.35, 0.4, 5 * 0.35]}
        colliders={false}
        restitution={0.01}
        friction={1}
        collisionGroups={interactionGroups(0, 0)}
      >
        <CylinderCollider
          quaternion={wheelDefaultOrientation}
          args={[0.2, 0.35]}
        />
      </RigidBody>
      <RigidBody
        canSleep={false}
        ref={wheel3}
        position={[3 * 0.35, 0.4, -5 * 0.35]}
        colliders={false}
        restitution={0.01}
        friction={1}
        collisionGroups={interactionGroups(0, 0)}
      >
        <CylinderCollider
          quaternion={wheelDefaultOrientation}
          args={[0.2, 0.35]}
        />
      </RigidBody>
      <RigidBody
        canSleep={false}
        ref={wheel4}
        position={[-3 * 0.35, 0.4, -5 * 0.35]}
        colliders={false}
        restitution={0.01}
        friction={1}
        collisionGroups={interactionGroups(0, 0)}
      >
        <CylinderCollider
          quaternion={wheelDefaultOrientation}
          args={[0.2, 0.35]}
        />
      </RigidBody>
    </>
  );
}
