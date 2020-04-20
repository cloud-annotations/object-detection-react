const getLabelText = (prediction) => {
  const scoreText = (prediction.score * 100).toFixed(1)
  return `${prediction.label} ${scoreText}%`
}

export const renderPredictions = (ctx, predictions) => {
  // Font options.
  const font = `${16}px 'ibm-plex-sans', Helvetica Neue, Arial, sans-serif`
  ctx.setFont(font)
  ctx.setTextBaseLine('top')
  const border = 4
  const xPadding = 16
  const yPadding = 8
  const offset = 6
  const textHeight = parseInt(font, 10) // base 10

  predictions.forEach((prediction) => {
    const x = prediction.bbox[0]
    const y = prediction.bbox[1]
    const width = prediction.bbox[2]
    const height = prediction.bbox[3]

    const predictionText = getLabelText(prediction)

    // Draw the bounding box.
    ctx.setStrokeStyle('#0062ff')
    ctx.setLineWidth(border)

    ctx.strokeRect(
      Math.round(x),
      Math.round(y),
      Math.round(width),
      Math.round(height)
    )
    // Draw the label background.
    ctx.setFillStyle('#0062ff')
    const textWidth = ctx.measureText(predictionText).width
    ctx.fillRect(
      Math.round(x - border / 2),
      Math.round(y - (textHeight + yPadding) - offset),
      Math.round(textWidth + xPadding),
      Math.round(textHeight + yPadding)
    )
  })

  predictions.forEach((prediction) => {
    const x = prediction.bbox[0]
    const y = prediction.bbox[1]

    const predictionText = getLabelText(prediction)
    // Draw the text last to ensure it's on top.
    ctx.setFillStyle('#ffffff')
    ctx.fillText(
      predictionText,
      Math.round(x - border / 2 + xPadding / 2),
      Math.round(y - (textHeight + yPadding) - offset + yPadding / 2)
    )
  })
}
