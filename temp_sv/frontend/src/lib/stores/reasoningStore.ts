import { writable } from 'svelte/store'

export const reasoningStore = writable({
    fuzzyEmotion: null as any,
    dsUncertainty: null as any,
    argWinningClaims: [] as string[],
    htnCurrentTask: null as any,
    pomdpBelief: null as any,
    cbrMatchScore: null as any,
    cbrCaseId: null as any
})
