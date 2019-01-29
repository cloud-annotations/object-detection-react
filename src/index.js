import React from 'react'
import ReactDOM from 'react-dom'
import MagicDropzone from 'react-magic-dropzone'

import * as tf from '@tensorflow/tfjs'
import './styles.css'

const MODEL_URL = './web_model/tensorflowjs_model.pb'
const WEIGHTS_URL = './web_model/weights_manifest.json'

class App extends React.Component {
  state = {
    model: null,
    preview: '',
    predictions: []
  }

  componentDidMount() {
    tf.loadFrozenModel(MODEL_URL, WEIGHTS_URL).then(model => {
      this.setState({
        model: model
      })
    })
  }

  onDrop = (accepted, rejected, links) => {
    this.setState({ preview: accepted[0].preview || links[0] })
  }

  cropToCanvas = (image, canvas, ctx) => {
    const naturalWidth = image.naturalWidth
    const naturalHeight = image.naturalHeight

    canvas.width = image.width
    canvas.height = image.height

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    if (naturalWidth > naturalHeight) {
      ctx.drawImage(
        image,
        (naturalWidth - naturalHeight) / 2,
        0,
        naturalHeight,
        naturalHeight,
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      )
    } else {
      ctx.drawImage(
        image,
        0,
        (naturalHeight - naturalWidth) / 2,
        naturalWidth,
        naturalWidth,
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      )
    }
  }

  onImageChange = e => {
    const c = document.getElementById('canvas')
    const ctx = c.getContext('2d')
    this.cropToCanvas(e.target, c, ctx)

    const batched = tf.tidy(() => {
      const img = tf.fromPixels(c)
      // Reshape to a single-element batch so we can pass it to executeAsync.
      return img.expandDims(0)
    })

    const height = batched.shape[1]
    const width = batched.shape[2]

    this.state.model.executeAsync(batched).then(result => {
      const boxes = result[0].dataSync()
      const scores = result[1].dataSync()
      const labels = result[2].dataSync()

      // clean the webgl tensors
      batched.dispose()
      tf.dispose(result)

      const prevBackend = tf.getBackend()
      // run post process in cpu
      tf.setBackend('cpu')
      const indexTensor = tf.tidy(() => {
        const boxes2 = tf.tensor2d(boxes, [
          result[0].shape[1],
          result[0].shape[2]
        ])
        return tf.image.nonMaxSuppression(
          boxes2,
          scores,
          20, // maxNumBoxes
          0.5, // iou_threshold
          0.5 // score_threshold
        )
      })
      const indexes = indexTensor.dataSync()
      indexTensor.dispose()
      // restore previous backend
      tf.setBackend(prevBackend)

      const predictions = this.buildDetectedObjects(
        width,
        height,
        boxes,
        scores,
        indexes,
        labels
      )

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
    })
  }

  buildDetectedObjects = (width, height, boxes, scores, indexes, classes) => {
    const count = indexes.length
    const objects = []
    for (let i = 0; i < count; i++) {
      const bbox = []
      for (let j = 0; j < 4; j++) {
        bbox[j] = boxes[indexes[i] * 4 + j]
      }
      const minY = bbox[0] * height
      const minX = bbox[1] * width
      const maxY = bbox[2] * height
      const maxX = bbox[3] * width
      bbox[0] = minX
      bbox[1] = minY
      bbox[2] = maxX - minX
      bbox[3] = maxY - minY
      objects.push({
        bbox: bbox,
        class: classes[indexes[i]],
        score: scores[indexes[i]]
      })
    }
    return objects
  }

  render() {
    return (
      <div className="Dropzone-page">
        {this.state.model ? (
          <MagicDropzone
            className="Dropzone"
            accept="image/jpeg, image/png, .jpg, .jpeg, .png"
            multiple={false}
            onDrop={this.onDrop}
          >
            {this.state.preview ? (
              <img
                alt="upload preview"
                onLoad={this.onImageChange}
                className="Dropzone-img"
                src={this.state.preview}
              />
            ) : (
              'Choose or drop a file.'
            )}
            <canvas id="canvas" />
          </MagicDropzone>
        ) : (
          <div className="Dropzone">Loading model...</div>
        )}
      </div>
    )
  }
}

const rootElement = document.getElementById('root')
ReactDOM.render(<App />, rootElement)
