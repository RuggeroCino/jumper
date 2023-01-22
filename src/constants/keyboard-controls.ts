import { KeyboardControlsEntry } from "@react-three/drei";

export enum KeyboardControl {
    JUMP = 'JUMP',
}

export const keyboardControls: KeyboardControlsEntry[] = [
    { name: KeyboardControl.JUMP, keys: ['ArrowUp', "KeyW"] },
]
