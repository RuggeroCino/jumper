import classNames from 'classnames';
import React from 'react';
import { GameState, useGameStore } from '../../stores';
import './interface.css';

export interface IInterfaceProps {
    /**
     * Additional classes for the component.
     */
    className?: string;
};

export const Interface: React.FC<IInterfaceProps> = ({ className }) => {
    const gameState = useGameStore((state) => state.state);
    const gameScore = useGameStore((state) => state.score);
    const restartGame = useGameStore((state) => state.restartGame);

    const handleRestart = () => {
        restartGame();
    };

    return (
        <div className={classNames('interface', className)}>
            <p>{gameState}</p>
            <p>Score: {gameScore}</p>
            {gameState === GameState.ENDED && (
                <button onClick={handleRestart}>Restart</button>
            )}
        </div>
    );
};
