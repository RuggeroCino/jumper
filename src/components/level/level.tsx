import { Debug, Physics } from '@react-three/rapier';
import { useControls } from 'leva';
import React from 'react';
import { Lights } from '../lights';
import { Obstacles } from '../obstacles';
import { Player } from '../player';
import { StartBlock } from '../start-block';

export interface ILevelProps {};

const obstaclesCount = 4;

export const Level: React.FC<ILevelProps> = () => {
    const { debug } = useControls('physics', { debug: true });

    return (
        <Physics timeStep="vary" gravity={[0, -18, 0]}>
            {debug && <Debug />}
            <Player />
            <StartBlock />
            <Lights />
            <Obstacles count={obstaclesCount} />
        </Physics>
    );
};
