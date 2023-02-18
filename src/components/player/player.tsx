import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { RigidBodyApi } from '@react-three/rapier/dist/declarations/src/types';
import { useControls } from 'leva';
import React, { useCallback, useEffect, useRef } from 'react';
import { Euler, PointLight, Quaternion, Vector3 } from 'three';
import { playerSettings } from '../../constants';
import { useGameStore } from '../../stores';
import { GameState } from '../../stores/game-store';

export interface IPlayerProps {};

export const Player: React.FC<IPlayerProps> = () => {
    const playerRef = useRef<RigidBodyApi>(null);

    const playerLightRef = useRef<PointLight>(null);

    const playerModel = useGLTF('/assets/models/ethereum.glb');

    const gameState = useGameStore((state) => state.state);
    const startGame = useGameStore((state) => state.startGame);
    const restartGame = useGameStore((state) => state.restartGame);
    const endGame = useGameStore((state) => state.endGame);

    const { jumpForce, linearDamping, angularDamping, speed, godMode, disableTorque } = useControls('player', {
        jumpForce: 12,
        linearDamping: 0.1,
        angularDamping: 0.1,
        speed: 1.1,
        godMode: false,
        disableTorque: false,
    });

    const { lightPositionDelta, lightIntensity, lightDistance, lightColor } = useControls('player-light', {
        lightPositionDelta: { x: 5, y: 1, z: 0 },
        lightIntensity: 1.1,
        lightDistance: 40,
        lightColor: '#f6ffd7',
    });

    const jump = useCallback(() => {
        const position = playerRef.current?.translation();

        const isInitialJump = Math.round(position?.z ?? 0) === playerSettings.initialPosition.z;
        const initialZForce = isInitialJump ? (jumpForce * -0.35) : 0;

        playerRef.current?.applyImpulse({ x: 0, y: jumpForce, z: initialZForce });

        if (!disableTorque) {
            playerRef.current?.applyTorqueImpulse({ x: 0, y: jumpForce * -0.0025, z: 0 });
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

        console.log(playerPosition.z)

        // Follow player while playing
        state.camera.position.z = playerPosition.z;
        state.camera.lookAt(new Vector3(0, 0, playerPosition.z));

        if (playerLightRef.current) {
            playerLightRef.current.position.z = playerPosition.z + lightPositionDelta.z;
            playerLightRef.current.position.y = playerPosition.y + lightPositionDelta.y;
            playerLightRef.current.position.x = playerPosition.x + lightPositionDelta.x;
        }

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
            playerRef.current?.setRotation(new Quaternion().setFromEuler(new Euler(0, Math.PI / 2, 0)));
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
                rotation={[0, Math.PI / 2, 0]}
                mass={0.3}
                onCollisionEnter={handleCollision}
                scale={[0.35, 0.35, 1]}
            >
                <primitive object={playerModel.scene} />
            </RigidBody>
            <pointLight ref={playerLightRef} position={[0, 0, 0]} intensity={lightIntensity} distance={lightDistance} color={lightColor} />
        </>
    );
};
