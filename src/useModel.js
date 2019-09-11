import { useEffect, useState } from 'react'

import objectDetector from '@cloud-annotations/object-detection'

const useModel = modelPath => {
  const [model, setModel] = useState()
  useEffect(() => {
    objectDetector.load(modelPath).then(model => {
      setModel(model)
    })
  }, [modelPath])
  return model
}

export default useModel
