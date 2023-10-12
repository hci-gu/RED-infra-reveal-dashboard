import { atom } from 'jotai'

export const sessionsAtom = atom([])

export const sessionAtom = atom(null)

export const isLiveAtom = atom((get) => {
  const session = get(sessionAtom)
  return session && !session.end
})
