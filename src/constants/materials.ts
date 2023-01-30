import * as THREE from 'three';
import { Color } from 'three';

export const playerMaterial = new THREE.MeshNormalMaterial();

export const obstacleMaterial = new THREE.MeshStandardMaterial({
    displacementScale: 0.005,
    displacementBias: -0.005,
    emissive: new Color(0xFFFFFF),
    emissiveIntensity: 10,
});

export const sensorMaterial = new THREE.MeshStandardMaterial({ opacity: 0, transparent: true });
