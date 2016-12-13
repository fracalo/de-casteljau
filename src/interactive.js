import './path-data-polyfill'
import { throttle as _throttle } from 'lodash'
import { drawPoint } from './utils/draw'
import lerpSeg from './utils/lerp-segment'
import pipe from './utils/pipe'


import getPointsWithRef from './utils/get-points-with-pd-ref'
import drawSeg from './utils/control-point-segments'
// import { getPoints } from './utils/contour-path-data'
// import Point from './utils/Point'
// import Segment from './utils/Segment'
// import drawPath from './utils/draw-line'

const setUp = el => {
  const pathData = el.getPathData({ normalize: true })
  const points = getPointsWithRef(pathData)
    .map((x, i) => {
      const circ = drawPoint('navy')(x)
      circ.classList.add('point-handle')
      circ.key = i
      circ.pathdataLoc = x.pathdataLoc
      return circ
    })

  const outSegment = points.reduce((ac, p, i, arr) => {
    if (i < arr.length - 1) {
      const nextP = arr[i + 1]
      const seg = drawSeg(p, nextP, 'rgba(128,0,128,0.3)')
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
  const updateSeg = (seg, p1, p2) => {
    seg.setAttribute('x1', p1[0])
    seg.setAttribute('y1', p1[1])
    seg.setAttribute('x2', p2[0])
    seg.setAttribute('y2', p2[1])
    return seg
  }

  const midSegments = (midSeg = []) => t => outSeg => outSeg.reduce((ac, s, i, arr) => {
    if (i < arr.length - 1) {
      const nextS = arr[i + 1]
      const p1 = lerpSeg(t, s)
      const p2 = lerpSeg(t, nextS)
      const seg = midSeg[i] ?
        updateSeg(midSeg[i], p1, p2) :
        drawSeg(p1, p2, 'acqua')
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
      drawSeg(p1, p2, 'gold')
    // seg.classList.add('inner-seg')
    return seg
  }

  const controlSegments = t => outSeg => {
    const midSeg = midSegments()(t)(outSeg)
    const innerSeg = innerSegment()(t)(midSeg)
    return (tt => pipe(
      midSegments(midSeg)(tt),
      innerSegment(innerSeg)(tt)
    ))
  }

  const controlSegmentsUpdate = controlSegments(0.5)(outSegment)

  controlSegmentsUpdate(0.2)(outSegment)

  const updateControlSeg = (p) => {
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


  const updatePathData = p => {
    const { cx, cy } = p.style
    const pathDataSeg = p.pathdataLoc.ref
    const valuesLoc = p.pathdataLoc.in
    pathDataSeg.values[valuesLoc] = parseFloat(cx)
    pathDataSeg.values[valuesLoc + 1] = parseFloat(cy)
    el.setPathData(pathData)
  }

    // const points = Array.from(document.querySelectorAll('.point-handle'))


  /* event handlers */
  const dragmoveHandler = _throttle(e => {
    dragstartHandler.targetCx = dragstartHandler.targetCx + e.pageX - dragstartHandler.x
    dragstartHandler.targetCy = dragstartHandler.targetCy + e.pageY - dragstartHandler.y
    // instead of using setAttributes twice we update the style object once
    Object.assign(dragstartHandler.target.style, {
      cx: dragstartHandler.targetCx,
      cy: dragstartHandler.targetCy
    })
    dragstartHandler.x = e.pageX
    dragstartHandler.y = e.pageY

    // this is truely unfunctional
    updatePathData(dragstartHandler.target)
    updateControlSeg(dragstartHandler.target)
  }, 30, { leading: true, trailing: false })
  const dragendHandler = () => {
    document.removeEventListener('mouseup', dragendHandler)
    document.removeEventListener('mousemove', dragmoveHandler)
    dragstartHandler.target.addEventListener('mousedown', dragstartHandler)
    // we reset the attributes in the markup
    // setting a timeout is not neccessary because throttle option trailing is false
    const { cx, cy } = dragstartHandler.target.style
    dragstartHandler.target.setAttribute('cx', cx)
    dragstartHandler.target.setAttribute('cy', cy)
    // clean reference (optional)
    dragstartHandler.target = dragstartHandler.x = dragstartHandler.y =
    dragstartHandler.targetCx = dragstartHandler.targetCy = null // TODO check any leaks ... if everything is ok deleate this section
  }

  const dragstartHandler = e => {
    dragstartHandler.target = e.target
    dragstartHandler.x = e.pageX
    dragstartHandler.y = e.pageY
    dragstartHandler.targetCx = Number(e.target.getAttribute('cx'))
    dragstartHandler.targetCy = Number(e.target.getAttribute('cy'))
    e.target.removeEventListener('mousedown', dragstartHandler)
    document.addEventListener('mousemove', dragmoveHandler)
    document.addEventListener('mouseup', dragendHandler)
  }

  points.forEach(c => {
    c.addEventListener('mousedown', dragstartHandler)
  })
}
/* later just expose the function */
const curve = document.getElementById('flat')
setUp(curve)
