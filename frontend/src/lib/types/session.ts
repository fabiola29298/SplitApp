//types/session.ts
import type { Hex } from 'viem';

export type Session = {
    id: number;
    hash: Hex;
    deadline: bigint;
    activa: boolean;
};
