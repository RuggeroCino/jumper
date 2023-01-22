import React from 'react';

export interface ILightsProps {};

export const Lights: React.FC<ILightsProps> = () => {
    return (
        <>
            <directionalLight color="#ffffff" position={[0, 20, 5]} intensity={1}/>
            <ambientLight intensity={ 0.5 } />
        </>
    )
};
