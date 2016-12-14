const svgNS = 'http://www.w3.org/2000/svg'
const svg = document.querySelector('svg')

export const drawSeg = (from, to, c, w) => {
  const l = lineCreator(from, to, c, w)
  svg.appendChild(l)
  return l
}

function lineCreator(from, to, color, strokeWidth = 1) {
  const x1 = Array.isArray(from) ? from[0] : parseFloat(from.getAttribute('cx'))
  const y1 = Array.isArray(from) ? from[1] : parseFloat(from.getAttribute('cy'))
  const x2 = Array.isArray(to) ? to[0] : parseFloat(to.getAttribute('cx'))
  const y2 = Array.isArray(to) ? to[1] : parseFloat(to.getAttribute('cy'))
  const el = document.createElementNS(svgNS, 'line')
  el.setAttribute('x1', x1)
  el.setAttribute('y1', y1)
  el.setAttribute('y2', y2)
  el.setAttribute('x2', x2)
  el.style.stroke = color
  el.style.strokeWidth = strokeWidth
  return el
}

export const updateSeg = (seg, p1, p2) => {
  const x1 = Array.isArray(p1) ? p1[0] : parseFloat(p1.getAttribute('cx'))
  const y1 = Array.isArray(p1) ? p1[1] : parseFloat(p1.getAttribute('cy'))
  const x2 = Array.isArray(p2) ? p2[0] : parseFloat(p2.getAttribute('cx'))
  const y2 = Array.isArray(p2) ? p2[1] : parseFloat(p2.getAttribute('cy'))
  seg.setAttribute('x1', x1)
  seg.setAttribute('y1', y1)
  seg.setAttribute('x2', x2)
  seg.setAttribute('y2', y2)
  return seg
}

export const drawPoint = (p, c, r) => {
  const circle = pointCreator(p, c, r)
  svg.appendChild(circle)
  return circle
}
export const updatePoint = (circle, p) => {
  const [x, y] = p
  circle.setAttribute('cx', x)
  circle.setAttribute('cy', y)
  return circle
}
function pointCreator(p, color, r = 3) {
  const [x, y] = p
  const el = document.createElementNS(svgNS, 'circle')
  el.setAttribute('cx', x)
  el.setAttribute('cy', y)
  el.setAttribute('r', r)
  el.style.fill = color
  return el
}
