import { useGLTF, useKeyboardControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { RigidBodyApi } from '@react-three/rapier/dist/declarations/src/types';
import { useControls } from 'leva';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Euler, Quaternion, Vector3 } from 'three';
import { KeyboardControl, playerSettings } from '../../constants';
import { useGameStore } from '../../stores';
import { GameState } from '../../stores/game-store';

export interface IPlayerProps {};

export const Player: React.FC<IPlayerProps> = () => {
    const playerRef = useRef<RigidBodyApi>(null);
    const flooz = useGLTF('/assets/models/flooz.glb');

    const jumpPressed = useKeyboardControls<KeyboardControl>(state => state.JUMP);

    const [isReady, setIsReady] = useState(false);

    const gameState = useGameStore((state) => state.state);
    const startGame = useGameStore((state) => state.startGame);
    const restartGame = useGameStore((state) => state.restartGame);
    const endGame = useGameStore((state) => state.endGame);

    const { jumpForce, linearDamping, angularDamping, speed, godMode, disableTorque } = useControls('player', {
        jumpForce: 13,
        linearDamping: 0.1,
        angularDamping: 0.1,
        speed: 1.1,
        godMode: true,
        disableTorque: false,
    })

    const jump = useCallback(() => {
        const position = playerRef.current?.translation();

        const isInitialJump = Math.floor(position?.z ?? 0) === playerSettings.initialPosition.z;
        const initialZForce = isInitialJump ? -4 : 0;

        playerRef.current?.applyImpulse({ x: 0, y: jumpForce, z: initialZForce });

        if (!disableTorque) {
            playerRef.current?.applyTorqueImpulse({ x: jumpForce * -0.01, y: 0, z: 0 });
        }
    }, [jumpForce, disableTorque])

    const handleCollision = useCallback(() => {
        if (gameState === GameState.PLAYING && !godMode) {
            endGame();
        }
    }, [endGame, gameState, godMode])

    useFrame((state) => {
        const playerPosition = playerRef.current?.translation() ?? playerSettings.initialPosition;

        // Follow player while playing
        state.camera.position.z = playerPosition.z;
        state.camera.lookAt(new Vector3(0, 0, playerPosition.z));

        if (playerPosition.y > 10 || playerPosition.y < -10) {
            endGame()
        }
    })

    useEffect(() => {
        if (jumpPressed) {
            jump();
        }
    }, [jumpPressed, jump])

    useEffect(() => {
        if (jumpPressed && gameState === GameState.ENDED) {
            restartGame();
        }
    }, [jumpPressed, gameState, restartGame, startGame]);

    useEffect(() => {
        if (gameState === GameState.READY && jumpPressed) {
            startGame();
            playerRef.current?.addForce({ x: 0, y: 0, z: speed * -1 });
        }
    }, [jumpPressed, gameState, speed, startGame])

    useEffect(() => {
        if (gameState === GameState.ENDED) {
            playerRef.current?.resetForces();
            playerRef.current?.resetTorques();
            playerRef.current?.setLinvel({ x: 0, y: 0, z: 0 });
            playerRef.current?.setAngvel({ x: 0, y: 0, z: 0 });
            playerRef.current?.setTranslation({ x: 0, y: 0, z: 10 });
            playerRef.current?.setRotation(new Quaternion().setFromEuler(new Euler(0, 0, 0)));

        }
    }, [gameState])

    // Quick fix for intial physics issues
    useEffect(() => {
        setTimeout(() => setIsReady(true), 500)
    }, [])

    if (!isReady) {
        return null;
    }

    return (
        <RigidBody
            type="dynamic"
            ref={playerRef}
            restitution={0}
            friction={0}
            linearDamping={linearDamping}
            angularDamping={angularDamping}
            position={[0, 0, 10]}
            rotation={[0, 0, 0]}
            mass={0.3}
            onCollisionEnter={handleCollision}
            scale={0.6}
        >
            <primitive object={flooz.scene} />
        </RigidBody>
    );
};
