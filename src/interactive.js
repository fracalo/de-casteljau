import './path-data-polyfill'
import { throttle as _throttle } from 'lodash'
import { drawPoint } from './utils/render-elements'


import getPointsWithRef from './utils/get-points-with-pd-ref'
import { outSegment, controlSegments, outerControlSegmentsUpdate } from './utils/control-segments'

const setUp = el => {
  const pathData = el.getPathData({ normalize: true })
  const points = getPointsWithRef(pathData)
    .map((x, i) => {
      const circ = drawPoint(x.pos, 'rgba(0, 0, 128, 0.4')
      circ.classList.add('point-handle')
      circ.key = i
      circ.pathdataLoc = x
      return circ
    })

  // generete the outer control segments connected to the points
  const outerControlSegments = outSegment(points)

  // we get the initial interpolation from UI and call the controlSegments,
  // which returns the update function to use in this inputs eventListener
  const inputTEl = document.querySelector('#t')
  const controlSegmentsUpdate = controlSegments(parseFloat(inputTEl.value) / 100)(outerControlSegments)
  // we also select label to update onchange
  const labelT = document.querySelector('[for=t] > span')

  // add event listener to inputTEl
  inputTEl.addEventListener('input', _throttle(e => {
    labelT.textContent = (parseFloat(e.target.value) / 100).toFixed(2)
    controlSegmentsUpdate(parseFloat(e.target.value) / 100)(outerControlSegments)
  }), 50, { leading: true, trailing: true })

  // animation button listener
  const animateButton = document.querySelector('.animation-ui__button')
  const animUiStart = document.querySelector('#anim-ui-from')
  const animUiEnd = document.querySelector('#anim-ui-to')
  const animUpdater = t => {
    inputTEl.value = `${t * 100}`
    labelT.textContent = t.toFixed(2)
    controlSegmentsUpdate(t)(outerControlSegments)
  }

  const animationHandler = e => (
      start = parseFloat(animUiStart.value),
      end = parseFloat(animUiEnd.value),
      step = 0.005,
      stopAtEnd = false
  ) => {
    if (e) e.preventDefault()
    if (animationHandler.flag) return
    const originalT = parseFloat(inputTEl.value) / 100
    const st = start < end ? Math.abs(step) : - Math.abs(step)
    let t = start
    const anim = () => {
      if (st > 0 && (t + st >= end)) {
        animUpdater(end)
        animationHandler.flag = false
        if (!stopAtEnd)
          animationHandler()(end, originalT, 0.01, true)
        return
      }
      if (st < 0 && (t + st <= end)) {
        animUpdater(end)
        animationHandler.flag = false
        if (!stopAtEnd)
          animationHandler()(end, originalT, 0.01, true)
        return
      }
      t += st
      animUpdater(t)
      window.requestAnimationFrame(anim)
    }
    animationHandler.flag = true
    window.requestAnimationFrame(anim)
  }
  animateButton.addEventListener('click', e => animationHandler(e)())

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

    // this is unfunctional
    updatePathData(dragstartHandler.target)
    outerControlSegmentsUpdate(dragstartHandler.target)
    controlSegmentsUpdate(parseFloat(inputTEl.value) / 100)(outerControlSegments)
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
