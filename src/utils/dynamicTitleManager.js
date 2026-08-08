/**
 * Dynamic Title & Favicon Manager
 * Handles real-time tab title changes and dynamic favicon alert badges.
 */

let originalFaviconHref = '/favicon.svg'

/**
 * Sets document title dynamically with optional alert counter badge
 * @param {string} pageTitle - e.g. "Inventory & Storage"
 * @param {number} badgeCount - e.g. 3 (low stock items or alerts)
 */
export function setDynamicTitle(pageTitle, badgeCount = 0) {
  const baseAppName = 'Medical Equipment ERP'
  const titleText = pageTitle ? `${pageTitle} | ${baseAppName}` : baseAppName
  
  if (badgeCount > 0) {
    document.title = `(${badgeCount}) ${titleText}`
  } else {
    document.title = titleText
  }
}

/**
 * Dynamically updates the browser favicon with a red notification badge overlay
 * @param {number} count - Number of alerts or low stock items
 */
export function setDynamicFavicon(count = 0) {
  let faviconLink = document.querySelector("link[rel*='icon']")
  if (!faviconLink) {
    faviconLink = document.createElement('link')
    faviconLink.rel = 'icon'
    document.head.appendChild(faviconLink)
  }

  if (count <= 0) {
    faviconLink.href = originalFaviconHref
    return
  }

  // Create an offscreen canvas to render the favicon with a badge
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = originalFaviconHref
  
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')

    // Draw main favicon image
    ctx.drawImage(img, 0, 0, 64, 64)

    // Draw red notification badge circle in top right corner
    const badgeX = 48
    const badgeY = 16
    const badgeRadius = 14

    // Outer glow / border
    ctx.beginPath()
    ctx.arc(badgeX, badgeY, badgeRadius + 2, 0, 2 * Math.PI)
    ctx.fillStyle = '#0f172a'
    ctx.fill()

    // Inner red circle
    ctx.beginPath()
    ctx.arc(badgeX, badgeY, badgeRadius, 0, 2 * Math.PI)
    ctx.fillStyle = '#ef4444'
    ctx.fill()

    // Text badge count
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const displayCount = count > 99 ? '99+' : String(count)
    ctx.fillText(displayCount, badgeX, badgeY + 1)

    // Set updated canvas data URL as favicon
    faviconLink.href = canvas.toDataURL('image/png')
  }
}
