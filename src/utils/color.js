export const colorForUserId = (userId) => {
  const hash = userId
    .split('')
    .reduce((acc, curr) => acc + curr.charCodeAt(0), 0)
  const hue = hash % 360
  return `hsl(${hue}, 100%, 50%)`
}
