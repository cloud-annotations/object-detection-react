export const getRetinaContext = (canvas) => {
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
