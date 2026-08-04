/** Shared classes to prevent long unbroken text from overflowing containers. */
export const textSafe = 'min-w-0 break-words [overflow-wrap:anywhere]'
export const textTruncate = 'min-w-0 truncate'
export const textClamp1 = 'min-w-0 line-clamp-1 break-words [overflow-wrap:anywhere]'
export const textClamp2 = 'min-w-0 line-clamp-2 break-words [overflow-wrap:anywhere]'
export const textClamp3 = 'min-w-0 line-clamp-3 break-words [overflow-wrap:anywhere]'

export function tableCellTextClass({ clamp = 2 } = {}) {
  return `max-w-[220px] ${clamp === 1 ? textClamp1 : clamp === 3 ? textClamp3 : textClamp2}`
}
