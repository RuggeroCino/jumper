import { InstancedRigidBodies, InstancedRigidBodyApi, Vector3Array } from '@react-three/rapier';
import { useControls } from 'leva';
import React, { useMemo, useRef } from 'react';
import { boxGeometry, planeGeometry } from '../../constants';
import { obstacleMaterial, sensorMaterial } from '../../constants/materials';
import { useGameStore } from '../../stores';

export interface IObstacleProps {
    count: number;
};

export const Obstacles: React.FC<IObstacleProps> = ({ count }) => {
    const { distance, height } = useControls('obstacles', {
        distance: 22,
        height: { min: 2, max: 15, value: [3.5, 6.5] },
    });

    const increaseScore = useGameStore(state => state.increaseScore);

    const obstaclesRef = useRef<InstancedRigidBodyApi>(null);

    const obstacleTransforms = useMemo(() => {
        const positions: Vector3Array[] = [];
        const scales: Vector3Array[] = Array(count * 2).fill([5, 50, 5]);

        for(let index = 0; index < count; index++) {
            const highObstacle = (Math.random() * 10) + 22;
            const obstacleDistance = (Math.random() * (height[1] - height[0])) + height[0];

            positions.push(
                [0, highObstacle, (index + 1) * - distance],
                [0, highObstacle -50 - obstacleDistance, (index + 1) * - distance],
            )
        }

        return { positions, scales };
    }, [count, distance, height]);

    const sensorTransforms = useMemo(() => {
        const positions: Vector3Array[] = [];
        const scales: Vector3Array[] = Array(count).fill([10, 50])

        for (let index = 0; index < count; index++) {
            positions.push([0, 0, (index + 1) * - distance])
        }

        return { positions, scales };
    }, [count, distance])

    return (
        <>
            <InstancedRigidBodies
                positions={obstacleTransforms.positions}
                scales={obstacleTransforms.scales}
                ref={obstaclesRef}
                restitution={0}
                friction={0}
                type="fixed"
            >
                <instancedMesh args={[boxGeometry, obstacleMaterial, count * 2]} />
            </InstancedRigidBodies>
            <InstancedRigidBodies
                positions={sensorTransforms.positions}
                scales={sensorTransforms.scales}
                sensor={true}
                onIntersectionEnter={increaseScore}
                type="fixed"
            >
                <instancedMesh args={[planeGeometry, sensorMaterial, count]} />
            </InstancedRigidBodies>
        </>
    );
};
