import { useEffect } from 'react'
import * as tf from '@tensorflow/tfjs'

const USE_GPU = true
const USE_API = false

const renderPredictions = (predictions, canvasRef) => {
  const ctx = canvasRef.current.getContext('2d')
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  // Font options.
  const font = '120px sans-serif'
  ctx.font = font
  ctx.textBaseline = 'top'
  predictions.forEach(prediction => {
    const x = prediction.bbox[0]
    const y = prediction.bbox[1]
    const width = prediction.bbox[2]
    const height = prediction.bbox[3]
    // Draw the bounding box.
    ctx.strokeStyle = '#00FFFF'
    ctx.lineWidth = 4
    ctx.strokeRect(x, y, width, height)
    // Draw the label background.
    // ctx.fillStyle = '#00FFFF'
    // const textWidth = ctx.measureText(prediction.class).width
    // const textHeight = parseInt(font, 10) // base 10
    // ctx.fillRect(x, y, textWidth + 4, textHeight + 4)
  })

  predictions.forEach(prediction => {
    const x = prediction.bbox[0]
    const y = prediction.bbox[1]
    // Draw the text last to ensure it's on top.
    ctx.fillStyle = '#000000'

    if (prediction.class === 'up') {
      ctx.fillText('👍', x, y)
    } else if (prediction.class === 'down') {
      ctx.fillText('👎', x, y)
    }
  })
}

const detectFrame = async (model, videoRef, canvasRef) => {
  console.time('Detect')
  const predictions = await model.detect(videoRef.current)
  if (USE_API) {
    setTimeout(() => {
      console.timeEnd('Detect')
      renderPredictions(predictions, canvasRef)
      detectFrame(model, videoRef, canvasRef)
    }, 1000)
  } else {
    console.timeEnd('Detect')
    renderPredictions(predictions, canvasRef)
    requestAnimationFrame(() => {
      detectFrame(model, videoRef, canvasRef)
    })
  }
}

const useBoxRenderer = (model, videoRef, canvasRef, shouldRender) => {
  tf.setBackend(USE_GPU || USE_API ? 'webgl' : 'cpu')
  useEffect(() => {
    if (model && shouldRender) {
      detectFrame(model, videoRef, canvasRef)
    }
  }, [canvasRef, model, shouldRender, videoRef])
}

export default useBoxRenderer
