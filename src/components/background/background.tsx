import { useFrame } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import { ShaderMaterial, Vector2 } from 'three';
import { backgroundShader } from '../../shaders';

export interface IBackgroundProps {};

export const Background: React.FC<IBackgroundProps> = () => {
    const shaderRef = useRef<ShaderMaterial>(null);

    const uniforms = useMemo(
        () => ({ uResolution: { value: new Vector2(window.innerHeight, window.innerWidth), }, uTime: { value: 0.0 } }),
        []
    );

    useFrame((state) => {
        if (shaderRef.current) {
            shaderRef.current.uniforms.uTime.value = 0.4 * state.clock.getElapsedTime();
        }
    });

    return (
        <>
            <mesh position={[-10, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[window.innerWidth, window.innerHeight]}/>
                <shaderMaterial
                    fragmentShader={backgroundShader.fragmentShader}
                    vertexShader={backgroundShader.vertexShader}
                    uniforms={uniforms}
                    ref={shaderRef}
                />
            </mesh>
        </>
    );
};
