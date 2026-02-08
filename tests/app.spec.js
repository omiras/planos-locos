import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../src/App.vue'
import SetupScreen from '../src/components/SetupScreen.vue'
import planesData from '../src/assets/planes.json'

// Mock Supabase to avoid actual network calls or errors
vi.mock('../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      })),
      insert: vi.fn().mockResolvedValue({ error: null })
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'http://fake.url/img.jpg' } })
      }))
    }
  }
}))

describe('App Integration', () => {
  let wrapper

  beforeEach(() => {
    vi.restoreAllMocks()
    // Mock audio to prevent errors
    vi.stubGlobal('Audio', vi.fn().mockImplementation(() => ({
      play: vi.fn().mockResolvedValue(),
      preload: '',
      currentTime: 0
    })))

    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  it('starts at SetupScreen', () => {
    wrapper = mount(App)
    expect(wrapper.findComponent(SetupScreen).exists()).toBe(true)
    expect(wrapper.find('.text-5xl').exists()).toBe(false) // Game screen title not yet visible
  })

  it('transitions to game when Start is clicked', async () => {
    wrapper = mount(App)
    const setup = wrapper.findComponent(SetupScreen)

    // Emit start event with default settings
    await setup.vm.$emit('start', {
      allowRepeats: false,
      soundEnabled: false,
      fullscreenEnabled: false,
      communityPlanesOption: 'none'
    })

    // SetupScreen should disappear
    expect(wrapper.findComponent(SetupScreen).exists()).toBe(false)

    // Game UI specific elements should appear
    // We expect a plane to be loaded immediately
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.currentPlane).toBeTruthy()
    // Check if the "Cambiar Plano" button exists
    const changeBtn = wrapper.findAll('button').find(b => b.text().includes('Cambiar Plano'))
    expect(changeBtn.exists()).toBe(true)
  })

  it('respects allowRepeats logic', async () => {
    wrapper = mount(App)

    // Manually force a small set of planes for testing
    // We can override the internal planes ref if we access vm, 
    // or just rely on the fact that random is random.
    // Better: let's test the filtering logic by calling showRandomPlane manually if accessible,
    // or by mocking the planes data. 
    // Since planesData is imported, we can mock the module if needed, but for integration 
    // let's just checking seeing multiple planes.

    const setup = wrapper.findComponent(SetupScreen)
    await setup.vm.$emit('start', {
      allowRepeats: false,
      soundEnabled: false,
      fullscreenEnabled: false,
      communityPlanesOption: 'none'
    })

    const initialPlane = wrapper.vm.currentPlane
    expect(wrapper.vm.seenPlanes.has(initialPlane.id || initialPlane.name)).toBe(true)

    // Trigger next plane
    await wrapper.vm.fetchPlanesAndShow()
    expect(wrapper.vm.currentPlane).not.toBe(initialPlane) // In a large set, highly unlikely to be same
  })

  it('toggles language display', async () => {
    wrapper = mount(App)
    // Start game
    wrapper.findComponent(SetupScreen).vm.$emit('start', { communityPlanesOption: 'none' })
    await wrapper.vm.$nextTick()

    const plane = wrapper.vm.currentPlane
    // Default: Spanish (or fallback)
    // For standard planes, we expect text_es if available
    expect(wrapper.vm.displayText).toBe(plane.text_es || plane.text)

    // Toggle to EN
    wrapper.vm.showEnglish = true
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.displayText).toBe(plane.text || '')
  })
})

