const createTouchEvents = (touchPoints = []) => {
  if (touchPoints.length % 2 !== 0) throw Error('Odd touch points array length, please use XY coordinates')

  let identifier = 0
  const touches = []

  for (let i = 0; i < touchPoints.length; i++) {
    touches.push({
      identifier,
      clientX: touchPoints[i],
      clientY: touchPoints[i + 1],
    })

    i++
    identifier++
  }

  return {
    touches,
    changedTouches: touches,
  }
}

export { createTouchEvents }
