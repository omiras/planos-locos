<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center p-2">
    <div class="w-full h-screen flex flex-col">

      <div v-if="currentPlane" class="flex flex-col h-full">
        <!-- Card Image - occupies top portion -->
        <div class="flex-1 w-full flex items-center justify-center p-2 -rotate-90">
          <img v-if="currentPlane.image_uris" :src="currentPlane.image_uris.art_crop" :alt="currentPlane.name"
            class="max-w-full max-h-full object-cover rotate-90" />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            No image available
          </div>
        </div>

        <!-- Card Info - bottom section -->
        <div class="bg-white p-4 flex-none max-h-1/3 overflow-y-auto">
          <h2 class="text-2xl font-bold text-gray-800 mb-2">
            {{ translatedPlane?.name || currentPlane.name }}
          </h2>

          <div v-if="translatedPlane?.type_line" class="text-sm text-gray-600 mb-3 italic">
            {{ translatedPlane.type_line }}
          </div>

          <div v-if="isTranslating" class="bg-blue-100 p-3 rounded text-blue-700 text-sm mb-3">
            🔄 Traduciendo...
          </div>

          <div v-else-if="translatedPlane?.oracle_text"
            class="bg-gray-100 p-3 rounded text-gray-700 text-lg leading-relaxed">
            {{ translatedPlane.oracle_text }}
          </div>

          <div v-else class="text-gray-500 text-sm text-center py-3">
            No rules text available
          </div>

          <!-- Button at the bottom -->
          <button @click="fetchPlanesAndShow"
            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 mt-4">
            Cambiar Plano
          </button>
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
import { ref } from 'vue'
import sound1 from './assets/sound1.wav'
import sound2 from './assets/sound2.wav'
import sound3 from './assets/sound3.wav'

// Create Audio instances for all sounds
const clickSounds = [
  new Audio(sound1),
  new Audio(sound2),
  new Audio(sound3)
]
clickSounds.forEach(sound => {
  sound.preload = 'auto'
})

const planes = ref([])
const currentPlane = ref(null)
const translatedPlane = ref(null)
const isTranslating = ref(false)

async function fetchPlanes() {
  try {
    const response = await fetch('https://api.scryfall.com/cards/search?q=type:plane+has:image+-is:funny')
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    const data = await response.json()
    planes.value = data.data || []
    return planes.value
  } catch (error) {
    console.error('Error fetching planes:', error)
    planes.value = []
    return []
  }
}

async function translateText(text) {
  if (!text) return text
  try {
    const response = await fetch('https://api.mymemory.translated.net/get?de=oscar.miras@gmail.com&q=' + encodeURIComponent(text) + '&langpair=en|es')
    const data = await response.json()
    if (data.responseStatus === 200) {
      return data.responseData.translatedText
    }
    return text
  } catch (error) {
    console.error('Error translating text:', error)
    return text
  }
}

async function translatePlane(plane) {
  const translated = {
    ...plane,
    name: await translateText(plane.name),
    type_line: await translateText(plane.type_line),
    oracle_text: await translateText(plane.oracle_text)
  }
  return translated
}

function showRandomPlane() {
  if (planes.value.length === 0) return
  const randomIndex = Math.floor(Math.random() * planes.value.length)
  currentPlane.value = planes.value[randomIndex]
  translatedPlane.value = null
  translateCurrentPlane()
}

async function translateCurrentPlane() {
  if (!currentPlane.value) return
  isTranslating.value = true
  translatedPlane.value = await translatePlane(currentPlane.value)
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
    // console.debug('Audio play failed:', e)
  }
  if (planes.value.length === 0) {
    await fetchPlanes()
  }
  showRandomPlane()
  // Scroll to top of viewport
  window.scrollTo(0, 0)
}
</script>

<style scoped></style>
