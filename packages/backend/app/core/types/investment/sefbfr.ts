const doneStatesLiteral = ['active', 'done', 'transfered'] as const;
export type DoneState = (typeof doneStatesLiteral)[number];
export const acceptedDoneStates: string[] = [...doneStatesLiteral];
