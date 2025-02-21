// return `X Gb, Y Mb, Z Kb` from bytes
export function displayBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`
  } else if (bytes < 1048576) {
    return `${(bytes / 1024).toFixed(2)} Kb`
  } else if (bytes < 1073741824) {
    return `${(bytes / 1048576).toFixed(2)} Mb`
  } else {
    return `${(bytes / 1073741824).toFixed(2)} Gb`
  }
}
