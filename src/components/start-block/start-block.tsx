import { RigidBody } from '@react-three/rapier';
import React from 'react';

export interface IStartBlockProps {};

export const StartBlock: React.FC<IStartBlockProps> = () => {
    return (
        <RigidBody type="fixed" friction={1} position={[0, -1, 10]}>
            <mesh>
                <boxGeometry args={[2, 0.25, 2]} />
                <meshStandardMaterial color="limegreen" />
            </mesh>
        </RigidBody>
    );
};
