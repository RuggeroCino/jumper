import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { InstancedRigidBodies, InstancedRigidBodyApi, Vector3Array } from '@react-three/rapier';
import { useControls } from 'leva';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { InstancedMesh, RepeatWrapping, Texture, Vector2, Vector3 } from 'three';
import { boxGeometry, planeGeometry } from '../../constants';
import { obstacleMaterial, sensorMaterial } from '../../constants/materials';
import { useGameStore } from '../../stores';
import { obstaclesUtils } from './obstacles-utils';

export interface IObstacleProps {
    count: number;
};

let INCREASE_TIMEOUT = false;
let DEBOUNCE_CAMERA = false;

export const Obstacles: React.FC<IObstacleProps> = ({ count }) => {
    const { zDistance, yDistance, obstacleHeight } = useControls('obstacles', {
        zDistance: 22,
        yDistance: { min: 2, max: 15, value: [3.75, 6.5] },
        obstacleHeight: 50,
        initialZDistance: 30,
    });

    const [cameraPosition, setCameraPosition] = useState(0);

    useTexture({
        aoMap: 'assets/textures/sci-fi-panel/ambientOcclusion.jpg',
        map: 'assets/textures/sci-fi-panel/color.jpg',
        emissiveMap: 'assets/textures/sci-fi-panel/emissive.jpg',
        displacementMap: 'assets/textures/sci-fi-panel/height.png',
        metalnessMap: 'assets/textures/sci-fi-panel/metallic.jpg',
        normalMap: 'assets/textures/sci-fi-panel/normal.jpg',
        roughnessMap: 'assets/textures/sci-fi-panel/roughness.jpg',
    }, (textures) => {
        const parsedTextures = textures as Texture[];
        obstacleMaterial.aoMap = parsedTextures[0];
        obstacleMaterial.map = parsedTextures[1];
        obstacleMaterial.emissiveMap = parsedTextures[2];
        obstacleMaterial.displacementMap = parsedTextures[3];
        obstacleMaterial.metalnessMap = parsedTextures[4];
        obstacleMaterial.normalMap = parsedTextures[5];
        obstacleMaterial.roughnessMap = parsedTextures[6];

        parsedTextures.forEach((texture) => {
            texture.repeat = new Vector2(1, 10);
            texture.wrapS = RepeatWrapping;
            texture.wrapT = RepeatWrapping;
        })
    })

    const increaseScore = useGameStore(state => state.increaseScore);

    const handleIncreaseScore = () => {
        if (INCREASE_TIMEOUT === true) {
            return;
        }

        INCREASE_TIMEOUT = true;

        increaseScore();

        setTimeout(() => {
            INCREASE_TIMEOUT = false;
        }, 500);
    }

    const obstaclesBodyMesh = useRef<InstancedMesh>(null);
    const obstaclesSensorMesh = useRef<InstancedMesh>(null);

    const instanceRigidObstacleRef = useRef<InstancedRigidBodyApi>(null);
    const instanceRigidSensorRef = useRef<InstancedRigidBodyApi>(null);

    const obstacleTransforms = useMemo(() => {
        const positions: Vector3Array[] = [];
        const scales: Vector3Array[] = Array(count * 2).fill([5, obstacleHeight, 5]);

        for(let index = 0; index < count; index++) {
            const upperObstacleY = obstaclesUtils.generateUpperYPosition();

            const upperObstaclePosition = obstaclesUtils.getObstaclePosition({
                upperObstacleY,
                obstacleHeight,
                isUpperObstacle: true,
                yDistance,
                zDistance,
                position: index
            });

            const lowerObstaclePosition = obstaclesUtils.getObstaclePosition({
                upperObstacleY,
                obstacleHeight,
                isUpperObstacle: false,
                yDistance,
                zDistance,
                position: index
            });

            positions.push(upperObstaclePosition.toArray(), lowerObstaclePosition.toArray());
        }

        return { positions, scales };
    }, [count, yDistance, zDistance, obstacleHeight]);

    const sensorTransforms = useMemo(() => {
        const positions: Vector3Array[] = [];
        const scales: Vector3Array[] = Array(count).fill([10, obstacleHeight])

        for (let index = 0; index < count; index++) {
            positions.push([0, 0, (index + 1) * - zDistance])
        }

        return { positions, scales };
    }, [count, zDistance, obstacleHeight])

    useEffect(() => {
        const upperObstacleY = obstaclesUtils.generateUpperYPosition();

        instanceRigidObstacleRef.current?.forEach((obstacle, index) => {
            const obstaclePosition = obstacle.translation();

            const obstacleIndex = Math.abs(obstaclePosition.z / zDistance) - 1;
            const sensorIndex = Math.floor(index / 2);

            if ((cameraPosition - obstaclePosition.z) < zDistance * -2) {
                const isUpperObstacle = obstaclePosition.y > 0;
                const newObstaclePosition = obstaclesUtils.getObstaclePosition({
                    upperObstacleY,
                    obstacleHeight,
                    isUpperObstacle,
                    yDistance,
                    zDistance,
                    position: obstacleIndex + count,
                });

                obstacle.setTranslation(newObstaclePosition);

                const sensor = instanceRigidSensorRef.current?.at(sensorIndex);
                const newSensorPosition = (sensor?.translation() ?? new Vector3()).setZ(newObstaclePosition.z);
                sensor?.setTranslation(newSensorPosition);
            }
        })
    }, [cameraPosition, yDistance, obstacleHeight, zDistance, count])

    useFrame((state) => {
        if (!DEBOUNCE_CAMERA) {
            DEBOUNCE_CAMERA = true;
            setCameraPosition(state.camera.position.z);
            setTimeout(() => DEBOUNCE_CAMERA = false, 1000);
        }
    });

    return (
        <>
            <InstancedRigidBodies
                positions={obstacleTransforms.positions}
                scales={obstacleTransforms.scales}
                restitution={0}
                friction={0}
                type="fixed"
                ref={instanceRigidObstacleRef}
            >
                <instancedMesh ref={obstaclesBodyMesh} args={[boxGeometry, obstacleMaterial, count * 2]} />
            </InstancedRigidBodies>
            <InstancedRigidBodies
                positions={sensorTransforms.positions}
                scales={sensorTransforms.scales}
                sensor={true}
                onIntersectionEnter={handleIncreaseScore}
                type="fixed"
                ref={instanceRigidSensorRef}
            >
                <instancedMesh ref={obstaclesSensorMesh} args={[planeGeometry, sensorMaterial, count]} />
            </InstancedRigidBodies>
        </>
    );
};
