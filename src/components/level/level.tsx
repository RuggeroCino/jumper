import { Debug, Physics } from '@react-three/rapier';
import { useControls } from 'leva';
import React from 'react';
import { Background } from '../background';
import { Lights } from '../lights';
import { Obstacles } from '../obstacles';
import { Player } from '../player';
import { StartBlock } from '../start-block';

export interface ILevelProps {};

const obstaclesCount = 4;

export const Level: React.FC<ILevelProps> = () => {
    const { debug } = useControls('physics', { debug: false });

    return (
        <Physics timeStep="vary" gravity={[0, -18, 0]}>
            {debug && <Debug />}
            <Player />
            <StartBlock />
            <Lights />
            <Background />
            <Obstacles count={obstaclesCount} />
        </Physics>
    );
};
