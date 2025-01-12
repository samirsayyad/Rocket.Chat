import type { ICustomSound } from '@rocket.chat/core-typings';
import { createContext } from 'react';

export type CustomSoundContextValue = {
	play: (sound: string, options?: { volume?: number; loop?: boolean }) => void;
	getList: () => ICustomSound[] | undefined;
};

export const CustomSoundContext = createContext<CustomSoundContextValue>({
	play: () => undefined,
	getList: () => undefined,
});
