import symbologyData from '../assets/symbology.json'

// Build a map of symbol token -> svg_uri
const symbolMap = new Map()
try {
  const list = Array.isArray(symbologyData.data) ? symbologyData.data : symbologyData
  list.forEach(s => {
    if (s && s.symbol && s.svg_uri) symbolMap.set(s.symbol, s.svg_uri)
  })
} catch (e) {
  // ignore
}

export function replaceSymbolsInTextWithHtml(text) {
  if (!text) return ''
  const inlineStyle = 'display:inline-block;height:1em;width:auto;max-width:1.2em;max-height:1.2em;vertical-align:-0.1em;margin:0 0.08em;object-fit:contain;'
  const replaced = String(text).replace(/\{[^}]+\}/g, token => {
    const svg = symbolMap.get(token)
    if (svg) {
      return `<img src="${svg}" alt="${token}" style="${inlineStyle}"/>`
    }
    return token
  })
  return replaced.replace(/\n/g, '<br/>')
}

export function getSymbolSvg(token) {
  return symbolMap.get(token) || null
}

export default { replaceSymbolsInTextWithHtml, getSymbolSvg }
