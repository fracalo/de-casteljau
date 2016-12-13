import lerpSeg from './lerp-segment'
import pipe from './pipe'
import { drawSeg, updateSeg, drawPoint, updatePoint } from './control-point-segments'

export const outSegment = points => points.reduce((ac, p, i, arr) => {
  if (i < arr.length - 1) {
    const nextP = arr[i + 1]
    const seg = drawSeg(p, nextP, 'rgba(128,0,128,0.2)')
    // attach some refs
    p.segments = Object.assign(
      p.segments || {},
      { ahead: seg }
    )
    nextP.segments = Object.assign(
      nextP.segments || {},
      { behind: seg }
    )
    seg.classList.add('outer-control')
    ac.push(seg)
  }
  return ac
}, [])

export const outerControlSegmentsUpdate = (p) => {
  const { ahead, behind } = p.segments
  const { cx, cy } = p.style
  if (ahead) {
    ahead.setAttribute('x1', parseFloat(cx))
    ahead.setAttribute('y1', parseFloat(cy))
  }
  if (behind) {
    behind.setAttribute('x2', parseFloat(cx))
    behind.setAttribute('y2', parseFloat(cy))
  }
}

const midSegments = (midSeg = []) => t => outSeg =>
outSeg.reduce((ac, s, i, arr) => {
  if (i < arr.length - 1) {
    const nextS = arr[i + 1]
    const p1 = lerpSeg(t, s)
    const p2 = lerpSeg(t, nextS)
    const seg = midSeg[i] ?
      updateSeg(midSeg[i], p1, p2) :
      drawSeg(p1, p2, 'rgba(128,0,128,0.35)')
    // seg.classList.add(`mid-seg${i}`)
    ac.push(seg)
  }
  return ac
}, [])

const innerSegment = inSeg => t => midSeg => {
  const [beforeS, afterS] = midSeg
  const p1 = lerpSeg(t, beforeS)
  const p2 = lerpSeg(t, afterS)
  const seg = inSeg ?
    updateSeg(inSeg, p1, p2) :
    drawSeg(p1, p2, 'rgba(128,0,128,0.55)')
  return seg
}
const interP = interPoint => t => innerSeg => {
  const p1 = lerpSeg(t, innerSeg)
  const point = interPoint ?
    updatePoint(interPoint, p1) :
    drawPoint(p1, 'navy')
  return point
}

export const controlSegments = t => outSeg => {
  const midSeg = midSegments()(t)(outSeg)
  const innerSeg = innerSegment()(t)(midSeg)
  const lerpPoint = interP()(t)(innerSeg)
  return (tt => pipe(
    midSegments(midSeg)(tt),
    innerSegment(innerSeg)(tt),
    interP(lerpPoint)(tt)
  ))
}

// const controlSegmentsUpdate = controlSegments(0.5)(outSegment)
//
// controlSegmentsUpdate(0.2)(outSegment)
