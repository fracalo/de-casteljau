const svgNS = 'http://www.w3.org/2000/svg'
const svg = document.querySelector('svg')

const drawSeg = (from, to, c) => {
  const l = lineCreator(from, to, c)
  svg.appendChild(l)
  return l
}

function lineCreator(from, to, color) {
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
  return el
}

export default drawSeg
