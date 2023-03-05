import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { RigidBodyApi } from '@react-three/rapier/dist/declarations/src/types';
import { useControls } from 'leva';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Euler, PointLight, Quaternion, Vector3 } from 'three';
import { cameraSettings, playerSettings, boxGeometry, playerMaterial } from '../../constants';
import { useGameStore } from '../../stores';
import { GameState } from '../../stores/game-store';

export interface IPlayerProps {};

export const Player: React.FC<IPlayerProps> = () => {
    const playerRef = useRef<RigidBodyApi>(null);
    const playerLightRef = useRef<PointLight>(null);

    const gameState = useGameStore((state) => state.state);
    const startGame = useGameStore((state) => state.startGame);
    const restartGame = useGameStore((state) => state.restartGame);
    const endGame = useGameStore((state) => state.endGame);

    const { jumpForce, linearDamping, angularDamping, speed, godMode, disableTorque } = useControls('player', {
        jumpForce: 4,
        linearDamping: 0.1,
        angularDamping: 0.1,
        speed: 0.4,
        godMode: false,
        disableTorque: false,
    });

    const { lightPositionDelta, lightIntensity, lightDistance, lightColor } = useControls('player-light', {
        lightPositionDelta: { x: 5, y: 1, z: 0 },
        lightIntensity: 0.5,
        lightDistance: 40,
        lightColor: '#8ab4f8',
    });

    const [smoothedCameraPosition] = useState(cameraSettings.initialPosition.clone());
    const [smoothedCameraTarget] = useState(playerSettings.initialPosition.clone());
    const [smoothedLightTarget] = useState(playerSettings.initialPosition.clone().add(new Vector3(lightPositionDelta.x, lightPositionDelta.y, lightPositionDelta.z)));

    const jump = useCallback(() => {
        const position = playerRef.current?.translation();

        const isInitialJump = Math.round(position?.z ?? 0) === playerSettings.initialPosition.z;
        const initialZForce = isInitialJump ? (jumpForce * -0.35) : 0;

        playerRef.current?.applyImpulse({ x: 0, y: jumpForce, z: initialZForce });

        if (!disableTorque) {
            playerRef.current?.applyTorqueImpulse({ x: jumpForce * -0.002, y: 0, z: 0 });
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

    useFrame((state, delta) => {
        const playerPosition = playerRef.current?.translation() ?? playerSettings.initialPosition;

        const newCameraPosition = state.camera.position.clone();
        newCameraPosition.z = playerPosition.z;

        const newCameraTarget = new Vector3(0, 0, playerPosition.z);
        const newLightPosition = playerPosition.clone().add(new Vector3(lightPositionDelta.x, lightPositionDelta.y, lightPositionDelta.z));

        smoothedCameraPosition.lerp(newCameraPosition, 5 * delta)
        smoothedCameraTarget.lerp(newCameraTarget, 5 * delta);
        smoothedLightTarget.lerp(newLightPosition, 5 * delta);

        if (gameState !== GameState.ENDED) {
            state.camera.position.copy(smoothedCameraPosition);
            state.camera.lookAt(smoothedCameraTarget);
        } else {
            state.camera.position.copy(newCameraPosition);
            state.camera.lookAt(newCameraTarget);
        }

        playerLightRef.current?.position.copy(smoothedLightTarget);

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
            playerRef.current?.setTranslation(playerSettings.initialPosition);
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
                rotation={[0, 0, 0]}
                mass={0.3}
                onCollisionEnter={handleCollision}
                scale={1.3}
            >
                <mesh geometry={boxGeometry} material={playerMaterial}/>
            </RigidBody>
            <pointLight ref={playerLightRef} position={[0, 0, 0]} intensity={lightIntensity} distance={lightDistance} color={lightColor} />
        </>
    );
};
