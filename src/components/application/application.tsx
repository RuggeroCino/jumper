import { OrbitControls } from '@react-three/drei';
import React from 'react';
import { Perf } from 'r3f-perf';
import { Canvas } from '@react-three/fiber';
import { useControls, Leva } from 'leva';
import { Level } from '../level';
import { cameraSettings } from '../../constants';
import { Interface } from '../interface';
import './application.css';

export interface IApplicationProps {};

export const Application: React.FC<IApplicationProps> = () => {
    const { performanceEnabled, orbitControls, backgroundColor } = useControls('generic', {
        performanceEnabled: false,
        orbitControls: true,
        backgroundColor: '#1c1d1d',
    });

    const displayDebug = window.location.href.includes('#debug');

    return (
        <>
            <Leva hidden={!displayDebug} oneLineLabels={true} collapsed={false} />
            <Interface />
            <Canvas camera={{ fov: 40, near: 0.1, far: 200, position: cameraSettings.initialPosition }}>
                {performanceEnabled && (<Perf position="top-left" />)}
                {orbitControls && (<OrbitControls />)}
                <color args={[backgroundColor]} attach="background" />
                <Level />
            </Canvas>
        </>
    );
};
