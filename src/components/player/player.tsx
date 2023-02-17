import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { RigidBodyApi } from '@react-three/rapier/dist/declarations/src/types';
import { useControls } from 'leva';
import React, { useCallback, useEffect, useRef } from 'react';
import { Euler, Quaternion, Vector3 } from 'three';
import { playerSettings } from '../../constants';
import { useGameStore } from '../../stores';
import { GameState } from '../../stores/game-store';

export interface IPlayerProps {};

export const Player: React.FC<IPlayerProps> = () => {
    const playerRef = useRef<RigidBodyApi>(null);

    const flooz = useGLTF('/assets/models/flooz.glb');

    const gameState = useGameStore((state) => state.state);
    const startGame = useGameStore((state) => state.startGame);
    const restartGame = useGameStore((state) => state.restartGame);
    const endGame = useGameStore((state) => state.endGame);

    const { jumpForce, linearDamping, angularDamping, speed, godMode, disableTorque } = useControls('player', {
        jumpForce: 13,
        linearDamping: 0.1,
        angularDamping: 0.1,
        speed: 1.1,
        godMode: false,
        disableTorque: false,
    });

    const jump = useCallback(() => {
        const position = playerRef.current?.translation();

        const isInitialJump = Math.floor(position?.z ?? 0) === playerSettings.initialPosition.z;
        const initialZForce = isInitialJump ? -4 : 0;

        playerRef.current?.applyImpulse({ x: 0, y: jumpForce, z: initialZForce });

        if (!disableTorque) {
            playerRef.current?.applyTorqueImpulse({ x: jumpForce * -0.01, y: 0, z: 0 });
        }
    }, [jumpForce, disableTorque])

    const handleJumpPressed = useCallback(() => {
        if (gameState === GameState.ENDED) {
            restartGame();
        } else if (gameState === GameState.READY) {
            startGame();
            playerRef.current?.addForce({ x: 0, y: 0, z: speed * -1 });
        }

        jump();
    }, [gameState, restartGame, startGame, jump, speed]);

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

        if (playerPosition.y > 15 || playerPosition.y < -15) {
            endGame()
        }
    })

    useEffect(() => {
        if (gameState === GameState.ENDED) {
            playerRef.current?.resetForces();
            playerRef.current?.resetTorques();
            playerRef.current?.setLinvel({ x: 0, y: 0, z: 0 });
            playerRef.current?.setAngvel({ x: 0, y: 0, z: 0 });
            playerRef.current?.setTranslation({ x: playerSettings.initialPosition.x, y: playerSettings.initialPosition.y, z: playerSettings.initialPosition.z });
            playerRef.current?.setRotation(new Quaternion().setFromEuler(new Euler(0, 0, 0)));
        }
    }, [gameState])

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => event.code === 'Space' ? handleJumpPressed() : undefined;

        window.addEventListener('keydown', handleKeyDown, { passive: true });
        window.addEventListener('touchstart', handleJumpPressed, { passive: true });

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('touchstart', handleJumpPressed);
        }
    }, [handleJumpPressed])

    return (
        <>
            <RigidBody
                type="dynamic"
                ref={playerRef}
                restitution={0}
                friction={0}
                linearDamping={linearDamping}
                angularDamping={angularDamping}
                position={[playerSettings.initialPosition.x, playerSettings.initialPosition.y, playerSettings.initialPosition.z]}
                rotation={[0, 0, 0]}
                mass={0.3}
                onCollisionEnter={handleCollision}
                scale={0.6}
            >
                <primitive object={flooz.scene} />
            </RigidBody>
        </>
    );
};
