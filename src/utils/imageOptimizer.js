/**
 * Client-Side Image Optimizer & Validator
 * Checks file sizes and compresses image files into lightweight base64 Data URLs
 * to ensure fast uploads and permanent storage in MongoDB Atlas.
 */

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export function checkImageSize(file, maxBytes = MAX_IMAGE_SIZE_BYTES) {
  if (!file) return
  if (file.size > maxBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1)
    const maxMb = (maxBytes / (1024 * 1024)).toFixed(0)
    throw new Error(`Image size is too large (${sizeMb} MB). Maximum allowed size is ${maxMb} MB. Please upload a smaller photo.`)
  }
}

export function compressAndConvertToBase64(file, maxWidth = 320, maxHeight = 320, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Please select a valid image file (PNG, JPG, WebP).'))
    }

    try {
      checkImageSize(file)
    } catch (err) {
      return reject(err)
    }

    const reader = new FileReader()
    reader.onerror = (err) => reject(new Error('Failed to read image file: ' + err))
    
    reader.onload = (readerEvent) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Failed to load image format.'))
      
      img.onload = () => {
        let width = img.width
        let height = img.height

        // Calculate aspect-ratio preserved dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          } else {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)

        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
        const dataUrl = canvas.toDataURL(outputType, quality)
        resolve(dataUrl)
      }

      img.src = readerEvent.target.result
    }

    reader.readAsDataURL(file)
  })
}
