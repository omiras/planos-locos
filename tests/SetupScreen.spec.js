import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SetupScreen from '../src/components/SetupScreen.vue'

describe('SetupScreen', () => {
    it('renders with default values', () => {
        const wrapper = mount(SetupScreen)

        // Check title
        expect(wrapper.find('h1').text()).toBe('Configuración')

        // Check initial state of toggles/buttons based on component defaults
        // allowRepeats: false (bg-gray-200)
        // soundEnabled: true (bg-blue-600)
        // fullscreenEnabled: true (bg-blue-600)
        // communityPlanesOption: 'none'

        // We can check classes to verify state
        const buttons = wrapper.findAll('button')
        // buttons[0] -> allowRepeats
        // buttons[1] -> soundEnabled
        // buttons[2] -> fullscreenEnabled
        // buttons[3] -> Start Game
        // buttons[4] -> Propose (if enabled, but ENABLE_ADD_NEW_PLANE is false by default)

        expect(buttons[0].classes()).toContain('bg-gray-200') // Repeats OFF
        expect(buttons[1].classes()).toContain('bg-blue-600') // Sounds ON
        expect(buttons[2].classes()).toContain('bg-blue-600') // Fullscreen ON
    })

    it('toggles options correctly', async () => {
        const wrapper = mount(SetupScreen)
        const buttons = wrapper.findAll('button')

        // Toggle Repeats ON
        await buttons[0].trigger('click')
        expect(buttons[0].classes()).toContain('bg-blue-600')

        // Toggle Sounds OFF
        await buttons[1].trigger('click')
        expect(buttons[1].classes()).toContain('bg-gray-200')
    })

    it('emits start event with correct payload', async () => {
        const wrapper = mount(SetupScreen)

        // Change some settings first
        const buttons = wrapper.findAll('button')
        await buttons[0].trigger('click') // Repeats ON

        // Find the "Empezar" button (it has text "Empezar")
        const startButton = buttons.find(b => b.text() === 'Empezar')
        await startButton.trigger('click')

        expect(wrapper.emitted('start')).toBeTruthy()
        const payload = wrapper.emitted('start')[0][0]

        expect(payload).toMatchObject({
            allowRepeats: true,
            soundEnabled: true,
            fullscreenEnabled: true,
            communityPlanesOption: 'none'
        })
    })
})
