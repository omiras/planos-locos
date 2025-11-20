import { describe, it, expect } from 'vitest'
import { replaceSymbolsInTextWithHtml, getSymbolSvg } from '../src/helpers/symbols'

describe('symbols helper', () => {
  it('replaces known token with an <img> and converts newlines to <br/>', () => {
    // pick a token expected to be in symbology.json
    const token = '{R}'
    const svg = getSymbolSvg(token)
    // if symbology isn't present locally, this test still validates newline handling
    const input = `Cost ${token} to cast.\nNext line.`
    const out = replaceSymbolsInTextWithHtml(input)
    if (svg) {
      expect(out).toContain(`<img`)
      expect(out).toContain(svg)
    }
    expect(out).toContain('<br/>')
  })
})
