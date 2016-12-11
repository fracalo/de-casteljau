import { throttle as _throttle } from 'lodash'
import Point from './utils/Point'
import Segment from './utils/Segment'
import { drawPoint } from './utils/draw'
import { getPoints } from './utils/contour-path-data'
import getPointsWithRef from './utils/get-points-with-pd-ref'
import drawPath from './utils/draw-line'
import drawSeg from './utils/control-point-segments'

const setUp = el => {
  const pathData = el.getPathData({ normalize: true })
  const points = getPointsWithRef(pathData)
    .map((x, i) => {
      const circ = drawPoint('navy')(x)
      circ.classList.add('point-handle')
      circ.key = i
      circ.pathdataLoc = x.pathdataLoc
      circ.moveEvent = () => {
        if (circ.watchers)
          circ.watchers.forEach(f => f())
      }
      return circ
    })

  const segment = points.reduce((ac, p, i, arr) => {
    if (i < arr.length - 1) {
      const nextP = arr[i + 1]

      const seg = drawSeg(p, nextP)

      // how is this for tight coupling ?
      p.watchers = p.watchers || []
      nextP.watchers = nextP.watchers || []

      seg.update = (x, v) => {
        seg.setAttribute(x, v)
      }
      p.watchers.push(seg.update.bind(p, 'x1', p.cx.value))
      p.watchers.push(seg.update.bind(p, 'y1', p.cy.value))
      nextP.watchers.push(seg.update.bind(nextP, 'x2', nextP.cx.value))
      nextP.watchers.push(seg.update.bind(nextP, 'y2', nextP.cy.value))

      ac.push(seg)
    }
    return ac
  }, [])

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
    dragstartHandler.target.moveEvent()
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
