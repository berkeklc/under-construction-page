import { Text, OrbitControls, useFBO } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Leva, folder, useControls } from "leva";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import "/styles/scene.css";

import vertexShader from "/shaders/vertexShader";
import fragmentShader from "/shaders/fragmentShader";

const Geometries = () => {
  // This reference gives us direct access to our mesh
  const mesh = useRef();

  // This is our main render target where we'll render and store the scene as a texture
  const mainRenderTarget = useFBO();
  const backRenderTarget = useFBO();

  const {
    light,
    shininess,
    diffuseness,
    fresnelPower,
    iorR,
    iorY,
    iorG,
    iorC,
    iorB,
    iorP,
    saturation,
    chromaticAberration,
    refraction
  } = useControls({
    light: {
      value: new THREE.Vector3(-1.0, 1.0, 1.0)
    },
    diffuseness: {
      value: 0.2
    },
    shininess: {
      value: 40.0
    },
    fresnelPower: {
      value: 8.0
    },
    ior: folder({
      iorR: { min: 1.0, max: 2.333, step: 0.001, value: 1.15 },
      iorY: { min: 1.0, max: 2.333, step: 0.001, value: 1.16 },
      iorG: { min: 1.0, max: 2.333, step: 0.001, value: 1.18 },
      iorC: { min: 1.0, max: 2.333, step: 0.001, value: 1.22 },
      iorB: { min: 1.0, max: 2.333, step: 0.001, value: 1.22 },
      iorP: { min: 1.0, max: 2.333, step: 0.001, value: 1.22 }
    }),
    saturation: { value: 1.08, min: 1, max: 1.25, step: 0.01 },
    chromaticAberration: {
      value: 0.6,
      min: 0,
      max: 1.5,
      step: 0.01
    },
    refraction: {
      value: 0.4,
      min: 0,
      max: 1,
      step: 0.01
    }
  });

  const uniforms = useMemo(
    () => ({
      uTexture: {
        value: null
      },
      uTime: { value: 0.0 },
      uIorR: { value: 1.0 },
      uIorY: { value: 1.0 },
      uIorG: { value: 1.0 },
      uIorC: { value: 1.0 },
      uIorB: { value: 1.0 },
      uIorP: { value: 1.0 },
      uRefractPower: {
        value: 0.2
      },
      uChromaticAberration: {
        value: 1.0
      },
      uSaturation: { value: 0.0 },
      uShininess: { value: 40.0 },
      uDiffuseness: { value: 0.2 },
      uFresnelPower: { value: 8.0 },
      uLight: {
        value: new THREE.Vector3(-1.0, 1.0, 1.0)
      },
      winResolution: {
        value: new THREE.Vector2(
          window.innerWidth,
          window.innerHeight
        ).multiplyScalar(Math.min(window.devicePixelRatio, 2)) // if DPR is 3 the shader glitches 🤷‍♂️
      }
    }),
    []
  );

  const { viewport } = useThree();

  useFrame((state) => {
    const { gl, scene, camera } = state;
    const t = state.clock.getElapsedTime();
    const x = (state.mouse.x * viewport.width) / 2;
    const y = (state.mouse.y * viewport.height) / 2;

    mesh.current.rotation.set(-y / 7, x / 7, 0);
    mesh.current.rotation.z += -0.2 - (1 + Math.sin(t / 1.5)) / 20;
    mesh.current.rotation.x += Math.cos(t / 4) / 8;
    mesh.current.rotation.y += Math.sin(t / 4) / 8;
    mesh.current.position.y = (1 + Math.sin(t / 1.5)) / 10;

    mesh.current.material.uniforms.uTime.value = t;

    mesh.current.visible = false;

    mesh.current.material.uniforms.uDiffuseness.value = diffuseness;
    mesh.current.material.uniforms.uShininess.value = shininess;
    mesh.current.material.uniforms.uLight.value = new THREE.Vector3(
      light.x,
      light.y,
      light.z
    );
    mesh.current.material.uniforms.uFresnelPower.value = fresnelPower;

    mesh.current.material.uniforms.uIorR.value = iorR;
    mesh.current.material.uniforms.uIorY.value = iorY;
    mesh.current.material.uniforms.uIorG.value = iorG;
    mesh.current.material.uniforms.uIorC.value = iorC;
    mesh.current.material.uniforms.uIorB.value = iorB;
    mesh.current.material.uniforms.uIorP.value = iorP;

    mesh.current.material.uniforms.uSaturation.value = saturation;
    mesh.current.material.uniforms.uChromaticAberration.value = chromaticAberration;
    mesh.current.material.uniforms.uRefractPower.value = refraction;

    gl.setRenderTarget(backRenderTarget);
    gl.render(scene, camera);

    mesh.current.material.uniforms.uTexture.value = backRenderTarget.texture;
    mesh.current.material.side = THREE.BackSide;

    mesh.current.visible = true;

    gl.setRenderTarget(mainRenderTarget);
    gl.render(scene, camera);

    mesh.current.material.uniforms.uTexture.value = mainRenderTarget.texture;
    mesh.current.material.side = THREE.FrontSide;

    gl.setRenderTarget(null);
  });
  return (
    <>
      <color attach="background" args={["black"]} />
      <Text color="white" fontSize="3" anchorX="center" anchorY="middle">
        1453 Otto
      </Text>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[3, 0]} />
        <shaderMaterial
          key={uuidv4()}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
        />
      </mesh>
    </>
  );
};

const Scene = () => {
  return (
    <div className="webgl">
      <Leva collapsed />
      <Canvas camera={{ position: [0, 0, 7] }} dpr={[1, 2]}>
        <ambientLight intensity={1.0} />
        <Geometries />
        {/* <OrbitControls /> */}
      </Canvas>
    </div>
  );
};

export default Scene;
