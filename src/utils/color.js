export const colorForUserId = (userId) => {
  const hash = userId
    .split('')
    .reduce((acc, curr) => acc + curr.charCodeAt(0), 0)
  const hue = hash % 360
  return `hsl(${hue}, 100%, 50%)`
}

export const vizColors = ['#A71D31', '#F26A44', '#F0BC50', '#8AB055', '#6D807A']
