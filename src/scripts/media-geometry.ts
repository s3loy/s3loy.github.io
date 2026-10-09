export function fitScale(
  width: number,
  height: number,
  viewportWidth: number,
  viewportHeight: number,
) {
  if (
    ![width, height, viewportWidth, viewportHeight].every(
      (value) => Number.isFinite(value) && value > 0,
    )
  )
    return 1
  return Math.max(
    0.01,
    Math.min(
      1,
      Math.max(1, viewportWidth - 48) / width,
      Math.max(1, viewportHeight - 48) / height,
    ),
  )
}

export function zoomAt(
  scale: number,
  next: number,
  x: number,
  y: number,
  pointX = 0,
  pointY = 0,
) {
  const ratio = next / scale
  return {
    scale: next,
    x: pointX - (pointX - x) * ratio,
    y: pointY - (pointY - y) * ratio,
  }
}
