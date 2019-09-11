import { useEffect, useState } from 'react'

const useWebcam = videoRef => {
  const [webcamLoaded, setWebcamLoaded] = useState(false)
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            facingMode: 'user'
          }
        })
        .then(stream => {
          // window.stream = stream
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            setWebcamLoaded(true)
          }
        })
    }
  }, [videoRef])
  return webcamLoaded
}

export default useWebcam
