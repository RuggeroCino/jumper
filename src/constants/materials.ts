import * as THREE from 'three';

export const playerMaterial = new THREE.MeshNormalMaterial();
export const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 'black' });
export const sensorMaterial = new THREE.MeshStandardMaterial({ opacity: 0, transparent: true });
