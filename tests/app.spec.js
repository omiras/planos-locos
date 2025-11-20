import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../src/App.vue'
import planesData from '../src/assets/planes.json'

describe('App basic behaviour', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('toggles language display', async () => {
    const wrapper = mount(App)
    // set a current plane manually
    await wrapper.vm.$nextTick()
    wrapper.vm.currentPlane = planesData[0]
    wrapper.vm.translatedPlane = { name: planesData[0].name, text: planesData[0].text_es }
    // default should be Spanish (ES)
    expect(wrapper.vm.displayText).toEqual(planesData[0].text_es || planesData[0].text)
    // toggle to English
    wrapper.vm.showEnglish = true
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.displayText).toEqual(planesData[0].text || '')
  })

  it('attempts to play audio when changing plane', async () => {
    const playMock = vi.fn().mockResolvedValue()
    // Mock global Audio constructor
    vi.stubGlobal('Audio', function () {
      this.play = playMock
      this.preload = ''
      this.currentTime = 0
    })

    const wrapper = mount(App)
    await wrapper.vm.fetchPlanesAndShow()
    // allow for promise resolution
    await new Promise(r => setTimeout(r, 0))
    expect(playMock).toHaveBeenCalled()
  })
})
