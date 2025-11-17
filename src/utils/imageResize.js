/**
 * Resize image to reduce file size
 * @param {File} file - Image file to resize
 * @param {number} maxWidth - Maximum width in pixels (default: 1920)
 * @param {number} maxHeight - Maximum height in pixels (default: 1920)
 * @param {number} quality - Image quality 0-1 (default: 0.8)
 * @returns {Promise<string>} Base64 string of resized image
 */
export const resizeImage = (file, maxWidth = 1920, maxHeight = 1920, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'))
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width
        let height = img.height

        // Resize if image is larger than max dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = width * ratio
          height = height * ratio
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to base64 with quality setting
        const resizedBase64 = canvas.toDataURL(file.type, quality)
        resolve(resizedBase64)
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Get file size in MB
 * @param {string} base64String - Base64 string
 * @returns {number} Size in MB
 */
export const getBase64Size = (base64String) => {
  if (!base64String) return 0
  // Remove data URL prefix
  const base64 = base64String.split(',')[1] || base64String
  // Calculate size: base64 is ~33% larger than original
  const sizeInBytes = (base64.length * 3) / 4
  return sizeInBytes / (1024 * 1024) // Convert to MB
}


