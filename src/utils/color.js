function hslToRgb(h, s, l) {
  // Normalize h to [0,360)
  h = h % 360
  const hue = h / 360
  let r, g, b

  if (s === 0) {
    // Achromatic (gray)
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    const hue2rgb = function (p, q, t) {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    r = hue2rgb(p, q, hue + 1 / 3)
    g = hue2rgb(p, q, hue)
    b = hue2rgb(p, q, hue - 1 / 3)
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

/**
 * Returns a unique, visually appealing RGB color for a given client IP.
 * Assumes the IP address is in the format "10.0.0.X" where X is a unique number.
 *
 * @param {string} ip - The client's IP address.
 * @returns {number[]} An array [r, g, b] representing the color.
 */
export function getClientColor(ip) {
  const parts = ip.split('.')
  if (parts.length !== 4) {
    console.error('Invalid IP address format:', ip)
    return [0, 0, 0] // Fallback to black for invalid IPs
  }

  const lastOctet = parseInt(parts[3], 10)
  if (isNaN(lastOctet)) {
    console.error('Invalid IP address number:', ip)
    return [0, 0, 0] // Fallback to black if the last octet is not a number
  }

  // Option: use the golden angle to better distribute hues.
  // The golden angle (~137.508°) helps in generating well-spaced colors.
  const hue = (lastOctet * 137.508) % 360

  // Define fixed saturation and lightness values (70% and 50% respectively).
  const saturation = 0.7 // 70%
  const lightness = 0.5 // 50%

  return hslToRgb(hue, saturation, lightness)
}

export const colorForUserId = (userId) => {
  const hash = userId
    .split('')
    .reduce((acc, curr) => acc + curr.charCodeAt(0), 0)
  const hue = hash % 360
  return `hsl(${hue}, 100%, 50%)`
}

export const vizColors = ['#A71D31', '#F26A44', '#F0BC50', '#8AB055', '#6D807A']
