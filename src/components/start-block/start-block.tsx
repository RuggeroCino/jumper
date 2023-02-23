import { RigidBody } from '@react-three/rapier';
import { Float, Text } from '@react-three/drei';
import React from 'react';
import { isMobile } from 'react-device-detect';
import { boxGeometry, startBlockMaterial } from '../../constants';

export interface IStartBlockProps {};

export const StartBlock: React.FC<IStartBlockProps> = () => {
    const text = isMobile ? 'Tap screen to start' : 'Press space to start';

    return (
        <>
            <Float floatIntensity={0.5} rotationIntensity={0.25}>
                <Text
                    font="./bebas-neue-v9-latin-regular.woff"
                    scale={2.5}
                    maxWidth={10}
                    lineHeight={0.75}
                    textAlign="left"
                    position={[-5, 5, 10]}
                    rotation-y={Math.PI / 2}
                >
                    {text}
                    <meshBasicMaterial toneMapped={false} />
                </Text>
            </Float>
            <RigidBody type="fixed" friction={1} position={[0, 0, 10]} rotation={[0, 0, 0]} scale={[3, 0.5, 3]}>
                <mesh geometry={boxGeometry} material={startBlockMaterial} />
            </RigidBody>
        </>
    );
};
