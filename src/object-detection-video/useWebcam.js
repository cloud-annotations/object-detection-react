import { useEffect } from 'react'

const useWebcam = (videoRef, onLoaded) => {
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            facingMode: 'user',
            width: { ideal: 4096 },
            height: { ideal: 2160 },
          },
        })
        .then((stream) => {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            onLoaded()
          }
        })
    }
  }, [onLoaded, videoRef])
}

export default useWebcam
