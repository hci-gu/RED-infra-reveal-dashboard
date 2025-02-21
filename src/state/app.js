import { atom } from 'jotai'

export const settingsOpenedAtom = atom(false)

export const darkModeAtom = atom(true)

export const playbackRateAtom = atom(1)

export const activeViewAtom = atom('map')

export const languageAtom = atom('en-us')

export const cmsContentAtom = atom({})
