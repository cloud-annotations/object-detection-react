import { useEffect, useState } from 'react'

import models from '@cloud-annotations/models'

const useModel = (modelPath) => {
  const [model, setModel] = useState()
  useEffect(() => {
    models.load(modelPath).then((model) => {
      setModel(model)
    })
  }, [modelPath])
  return model
}

export default useModel
