import * as THREE from 'three';
import { Color } from 'three';

export const playerMaterial = new THREE.MeshStandardMaterial({ metalness: 0.5, roughness: 0, color: new Color('rgb(60, 147, 255)') });

export const startBlockMaterial = new THREE.MeshStandardMaterial({ metalness: 1, color: 'black' });

export const obstacleMaterial = new THREE.MeshStandardMaterial({
    displacementScale: 0.005,
    displacementBias: -0.005,
    emissive: new Color('rgb(60, 147, 255)'),
    emissiveIntensity: 5,
    metalness: 1,
    roughness: 0.8,
});

export const sensorMaterial = new THREE.MeshStandardMaterial({ opacity: 0, transparent: true });
