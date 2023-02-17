import React from 'react';

export interface ILightsProps {};

export const Lights: React.FC<ILightsProps> = () => {
    return (
        <>
            <ambientLight intensity={0.75} />
        </>
    )
};
