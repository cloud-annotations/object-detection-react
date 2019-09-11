import React from 'react'
import ReactDOM from 'react-dom'

import objectDetector from '@cloud-annotations/object-detection'
import './styles.css'

const MODEL_URL = process.env.PUBLIC_URL + '/model_web'

class App extends React.Component {
  videoRef = React.createRef()
  canvasRef = React.createRef()

  async componentDidMount() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const webCamPromise = navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            facingMode: 'user'
          }
        })
        .then(stream => {
          window.stream = stream
          this.videoRef.current.srcObject = stream
          return new Promise((resolve, _) => {
            this.videoRef.current.onloadedmetadata = () => {
              resolve()
            }
          })
        })

      await webCamPromise
      const model = await objectDetector.load(MODEL_URL)

      this.detectFrame(this.videoRef.current, model)
      model.detect(this.videoRef.current)
    }
  }

  detectFrame = async (video, model) => {
    const predictions = await model.detect(this.videoRef.current)
    this.renderPredictions(predictions)
    requestAnimationFrame(() => {
      this.detectFrame(video, model)
    })
  }

  renderPredictions = predictions => {
    const ctx = this.canvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    // Font options.
    const font = '16px sans-serif'
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
      ctx.fillStyle = '#00FFFF'
      const textWidth = ctx.measureText(prediction.class).width
      const textHeight = parseInt(font, 10) // base 10
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4)
    })

    predictions.forEach(prediction => {
      const x = prediction.bbox[0]
      const y = prediction.bbox[1]
      // Draw the text last to ensure it's on top.
      ctx.fillStyle = '#000000'
      ctx.fillText(prediction.class, x, y)
    })
  }

  render() {
    return (
      <div>
        <video
          className="size"
          autoPlay
          playsInline
          muted
          ref={this.videoRef}
          width="600"
          height="500"
        />
        <canvas
          className="size"
          ref={this.canvasRef}
          width="600"
          height="500"
        />
      </div>
    )
  }
}

const rootElement = document.getElementById('root')
ReactDOM.render(<App />, rootElement)
