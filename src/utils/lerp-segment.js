export default function lerpSeg(t, seg) {
  const s = [
    [seg.getAttribute('x1'), seg.getAttribute('y1')],
    [seg.getAttribute('x2'), seg.getAttribute('y2')]
  ]
  return lerp2d(t, ...s)
}
function lerp(t, from, to) {
  const dif = (from - to) * t
  return from - dif
}
function lerp2d(t, from, to) {
  return [
    lerp(t, from[0], to[0]),
    lerp(t, from[1], to[1])
  ]
}
