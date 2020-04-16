import React, { useRef } from 'react'
import ReactDOM from 'react-dom'

import useWebcam from './useWebcam'
import useModel from './useModel'
import useBoxRenderer from './useBoxRenderer'

import styles from './styles.module.css'

const MODEL_PATH = process.env.PUBLIC_URL + '/model_web'

const App = () => {
  const videoRef = useRef()
  const canvasRef = useRef()

  const cameraLoaded = useWebcam(videoRef)
  const model = useModel(MODEL_PATH)
  useBoxRenderer(model, videoRef, canvasRef, cameraLoaded)

  return (
    <>
      <video
        className={styles.video}
        autoPlay
        playsInline
        muted
        ref={videoRef}
      />
      <canvas ref={canvasRef} />
    </>
  )
}

const rootElement = document.getElementById('root')
ReactDOM.render(<App />, rootElement)
