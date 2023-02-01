import classNames from 'classnames';
import React from 'react';
import { useGameStore } from '../../stores';
import { AnimatedNumber } from '../animated-number';
import './interface.css';

export interface IInterfaceProps {
    /**
     * Additional classes for the component.
     */
    className?: string;
};

export const Interface: React.FC<IInterfaceProps> = ({ className }) => {
    const gameScore = useGameStore((state) => state.score);

    return (
        <div className={classNames('interface', className)}>
            <AnimatedNumber className="interface__score"  number={gameScore} />
        </div>
    );
};
