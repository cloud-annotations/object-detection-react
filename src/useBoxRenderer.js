import { useEffect } from 'react'

const MIRROR = true

const getRetinaContext = (canvas) => {
  const ctx = canvas.getContext('2d')
  const scale = window.devicePixelRatio
  let width = canvas.width / scale
  let height = canvas.height / scale
  return {
    setWidth: (w) => {
      width = w
      canvas.style.width = w + 'px'
      canvas.width = w * scale
    },
    setHeight: (h) => {
      height = h
      canvas.style.height = h + 'px'
      canvas.height = h * scale
    },
    width: width,
    height: height,
    clearAll: () => {
      return ctx.clearRect(0, 0, width * scale, height * scale)
    },
    clearRect: (x, y, width, height) => {
      return ctx.clearRect(x * scale, y * scale, width * scale, height * scale)
    },
    setFont: (font) => {
      const size = parseInt(font, 10) * scale
      const retinaFont = font.replace(/^\d+px/, size + 'px')
      ctx.font = retinaFont
    },
    setTextBaseLine: (textBaseline) => {
      ctx.textBaseline = textBaseline
    },
    setStrokeStyle: (strokeStyle) => {
      ctx.strokeStyle = strokeStyle
    },
    setLineWidth: (lineWidth) => {
      ctx.lineWidth = lineWidth * scale
    },
    strokeRect: (x, y, width, height) => {
      return ctx.strokeRect(x * scale, y * scale, width * scale, height * scale)
    },
    setFillStyle: (fillStyle) => {
      ctx.fillStyle = fillStyle
    },
    measureText: (text) => {
      const metrics = ctx.measureText(text)
      return {
        width: metrics.width / scale,
        actualBoundingBoxLeft: metrics.actualBoundingBoxLeft / scale,
        actualBoundingBoxRight: metrics.actualBoundingBoxRight / scale,
        actualBoundingBoxAscent: metrics.actualBoundingBoxAscent / scale,
        actualBoundingBoxDescent: metrics.actualBoundingBoxDescent / scale,
      }
    },
    fillRect: (x, y, width, height) => {
      return ctx.fillRect(x * scale, y * scale, width * scale, height * scale)
    },
    fillText: (text, x, y) => {
      return ctx.fillText(text, x * scale, y * scale)
    },
  }
}

const getLabelText = (prediction) => {
  const scoreText = (prediction.score * 100).toFixed(1)
  return `${prediction.label} ${scoreText}%`
}

const renderPredictions = (predictions, videoRef, canvasRef) => {
  const wantedWidth = videoRef.current.offsetWidth
  const wantedHeight = videoRef.current.offsetHeight
  const videoWidth = videoRef.current.videoWidth
  const videoHeight = videoRef.current.videoHeight

  const scaleX = wantedWidth / videoWidth
  const scaleY = wantedHeight / videoHeight

  const scale = Math.min(scaleX, scaleY)
  const xOffset = (wantedWidth - videoWidth * scale) / 2
  const yOffset = (wantedHeight - videoHeight * scale) / 2

  const ctx = getRetinaContext(canvasRef.current)

  ctx.setWidth(wantedWidth)
  ctx.setHeight(wantedHeight)

  ctx.clearAll()
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
    let x = prediction.bbox[0] * scale + xOffset
    const y = prediction.bbox[1] * scale + yOffset
    const width = prediction.bbox[2] * scale
    const height = prediction.bbox[3] * scale

    if (MIRROR) {
      x = wantedWidth - x - width
    }

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
    let x = prediction.bbox[0] * scale + xOffset
    const y = prediction.bbox[1] * scale + yOffset
    const width = prediction.bbox[2] * scale
    if (MIRROR) {
      x = wantedWidth - x - width
    }
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

const detectFrame = async (model, videoRef, canvasRef) => {
  const predictions = await model.detect(videoRef.current)
  renderPredictions(predictions, videoRef, canvasRef)
  requestAnimationFrame(() => {
    detectFrame(model, videoRef, canvasRef)
  })
}

const useBoxRenderer = (model, videoRef, canvasRef, shouldRender) => {
  if (canvasRef.current) {
    canvasRef.current.style.position = 'fixed'
    canvasRef.current.style.left = '0'
    canvasRef.current.style.top = '0'
  }

  useEffect(() => {
    if (model && shouldRender) {
      detectFrame(model, videoRef, canvasRef)
    }
  }, [canvasRef, model, shouldRender, videoRef])
}

export default useBoxRenderer
