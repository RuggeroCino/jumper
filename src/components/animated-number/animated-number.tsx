import classNames from 'classnames';
import React, { useMemo } from 'react';
import Reel from 'react-reel';
import './animated-number.css';

export interface IAnimatedNumberProps {
    /**
     * Number to be displayed.
     */
    number: number;
    /**
     * Additional classes for the component.
     */
    className?: string;
};

export const AnimatedNumber: React.FC<IAnimatedNumberProps> = ({ number, className }) => {
    const reelClassnames = useMemo(
        () => ({
            container: classNames('animated-number', className),
            reel: 'animated-number__container',
            group: 'animated-number__container-group',
            number: 'animated-number__container-number',
        }),
        [className],
    );

    return (
        <Reel text={number.toString()} theme={reelClassnames} />
    );
};
