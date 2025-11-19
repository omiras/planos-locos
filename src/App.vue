<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 p-2">
    <!-- Fullscreen overlay with fade-out effect -->
    <div v-if="showOverlay" :class="['fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity', overlayFading ? 'opacity-0' : 'opacity-100']"
      @transitionend="showOverlay = false">
      <div class="relative w-full h-full flex flex-col items-center justify-center">
        <img v-if="currentPlane.artwork || currentPlane.full || currentPlane.image_uris"
          :src="currentPlane.artwork || currentPlane.full || currentPlane.image_uris?.art_crop"
          :alt="currentPlane.name" class="w-full h-full object-cover" />
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-8 text-white">
          <h1 class="text-5xl font-bold">{{ displayName }}</h1>
        </div>
      </div>
    </div>

    <div class="w-full flex flex-col">

      <div v-if="currentPlane" class="flex flex-col h-full">
        <!-- Card Image - top portion (no rotation) -->
        <div class="w-full flex-none h-[60vh] overflow-hidden bg-black">
          <img v-if="currentPlane.artwork || currentPlane.full || currentPlane.image_uris"
            :src="currentPlane.artwork || currentPlane.full || currentPlane.image_uris?.art_crop"
            :alt="currentPlane.name" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            No image available
          </div>
        </div>

        <!-- Card Info - bottom section -->
        <div class="bg-white p-4 relative z-10">
          <h2 ref="titleRef" class="text-2xl font-bold text-gray-800 mb-2">
            {{ displayName }}
          </h2>

          <div v-if="displayType" class="text-sm text-gray-600 mb-3 italic">
            {{ displayType }}
          </div>

          <div v-if="isTranslating" class="bg-blue-100 p-3 rounded text-blue-700 text-sm mb-3">
            🔄 Traduciendo...
          </div>

          <div v-else-if="displayHtml"
            class="bg-gray-100 p-3 rounded text-gray-700 text-lg leading-relaxed"
            v-html="displayHtml">
          </div>

          <div v-else class="text-gray-500 text-sm text-center py-3">
            No rules text available
          </div>

          <!-- Buttons: language toggle + change plane -->
          <div class="flex gap-3 mt-4 z-20 relative">
            <button @click="fetchPlanesAndShow"
              class="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200">
              Cambiar Plano
            </button>
            <button @click="showEnglish = !showEnglish"
              :class="['w-24 text-sm font-semibold py-3 px-3 rounded-lg transition duration-150', showEnglish ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-800']">
              {{ showEnglish ? 'EN' : 'ES' }}
            </button>

            <button @click="toggleFullScreen"
              :class="['w-36 text-sm font-semibold py-3 px-3 rounded-lg transition duration-150 overflow-hidden truncate', isFullscreen ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800']">
              {{ isFullscreen ? 'Salir Pantalla Completa' : 'Pantalla Completa' }}
            </button>


          </div>
        </div>
      </div>

      <div v-else class="flex-1 flex items-center justify-center">
        <div class="text-center text-gray-300">
          <p class="text-xl mb-6">Click "New Plane" to load a random plane card</p>
          <button @click="fetchPlanesAndShow"
            class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200">
            Cambiar Plano
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onUnmounted } from 'vue'
import sound1 from './assets/sound1.wav'
import sound2 from './assets/sound2.wav'
import sound3 from './assets/sound3.wav'
import planesData from './assets/planes.json'
import symbologyData from './assets/symbology.json'

// Create Audio instances for all sounds
const clickSounds = [
  new Audio(sound1),
  new Audio(sound2),
  new Audio(sound3)
]
clickSounds.forEach(sound => {
  sound.preload = 'auto'
})

// Load planes from local JSON (no external API calls needed)
const planes = ref(planesData || [])
const currentPlane = ref(null)
const translatedPlane = ref(null)
const isTranslating = ref(false)
const showEnglish = ref(false)

const displayName = computed(() => {
  if (!currentPlane.value) return ''
  return showEnglish.value ? (currentPlane.value.name || '') : (translatedPlane.value?.name || currentPlane.value.name || '')
})

const displayType = computed(() => {
  if (!currentPlane.value) return ''
  return showEnglish.value ? (currentPlane.value.type_line || '') : (translatedPlane.value?.type_line || currentPlane.value.type_line || '')
})

const displayText = computed(() => {
  if (!currentPlane.value) return ''
  if (showEnglish.value) return currentPlane.value.text || ''
  return currentPlane.value.text_es || translatedPlane.value?.text || currentPlane.value.text || ''
})

// Build a map of symbol token -> svg_uri (symbologyData has { data: [...] })
const symbolMap = new Map()
try {
  const list = Array.isArray(symbologyData.data) ? symbologyData.data : symbologyData
  list.forEach(s => {
    if (s && s.symbol && s.svg_uri) symbolMap.set(s.symbol, s.svg_uri)
  })
} catch (e) {
  // ignore if symbology not available
}

function replaceSymbolsInTextWithHtml(text) {
  if (!text) return ''
  // Replace tokens like {R} or {W/U} with <img> tags when we have an svg for them
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

const displayHtml = computed(() => replaceSymbolsInTextWithHtml(displayText.value || ''))

// Reference to the title element so we can scroll to it
const titleRef = ref(null)

// Overlay effect for new plane
const showOverlay = ref(false)
const overlayFading = ref(false)

// Fullscreen control
const isFullscreen = ref(!!document.fullscreenElement)
function toggleFullScreen() {
  try {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  } catch (e) {
    // ignore
  }
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
}
document.addEventListener('fullscreenchange', onFullscreenChange)
onUnmounted(() => document.removeEventListener('fullscreenchange', onFullscreenChange))

function showRandomPlane() {
  if (planes.value.length === 0) return
  const randomIndex = Math.floor(Math.random() * planes.value.length)
  currentPlane.value = planes.value[randomIndex]
  translatedPlane.value = null
  translateCurrentPlane()
}

function translateCurrentPlane() {
  if (!currentPlane.value) return
  isTranslating.value = true
  // Use local Spanish text if available, otherwise fallback to original
  translatedPlane.value = {
    name: currentPlane.value.name,
    type_line: currentPlane.value.type_line || '',
    text: currentPlane.value.text_es || currentPlane.value.text || ''
  }
  isTranslating.value = false
}

async function fetchPlanesAndShow() {
  // play a random click sound when user requests a new plane
  try {
    const randomSound = clickSounds[Math.floor(Math.random() * clickSounds.length)]
    randomSound.currentTime = 0
    await randomSound.play()
  } catch (e) {
    // some browsers may reject play() silently if not allowed; ignore
  }
  // Data already loaded from local JSON, just show a random plane
  showRandomPlane()
  // Show fullscreen overlay with fade-out effect
  showOverlay.value = true
  overlayFading.value = false
  // After 2 seconds, start fading out
  setTimeout(() => {
    overlayFading.value = true
  }, 2000)
  // Wait for DOM update and scroll the title into view after overlay fades
  setTimeout(() => {
    try {
      if (titleRef.value && titleRef.value.scrollIntoView) {
        titleRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } catch (e) {
      // ignore
    }
  }, 2300)
}
</script>

<style scoped>
.transition-opacity {
  transition: opacity 0.8s ease-out;
}
</style>
