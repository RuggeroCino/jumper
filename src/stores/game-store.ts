import { subscribeWithSelector } from 'zustand/middleware';
import create from "zustand";

export enum GameState {
    READY = 'READY',
    PLAYING = 'PLAYING',
    ENDED = 'ENDED',
}

export interface IGameStore {
    state: GameState,
    score: number;
    startGame: () => void,
    endGame: () => void,
    restartGame: () => void,
    increaseScore: () => void,
}

export const useGameStore = create<IGameStore>()(
    subscribeWithSelector<IGameStore>((set) => ({
        state: GameState.READY,
        score: 0,
        startGame: () => set(() => ({ state: GameState.PLAYING })),
        endGame: () => set(() => ({ state: GameState.ENDED })),
        restartGame: () => set(() => ({ state: GameState.READY, score: 0 })),
        increaseScore: () => set((state) => ({ score: state.score + 1 }))
    }))
)
