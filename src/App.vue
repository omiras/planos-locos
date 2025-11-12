<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      
      <button
        @click="fetchPlanesAndShow"
        class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 mb-8"
      >
        New Plane
      </button>

      <div v-if="currentPlane" class="bg-white rounded-lg shadow-2xl overflow-hidden">
        <!-- Card Image -->
        <div class="relative bg-gray-200 w-full flex items-center justify-center p-4">
          <img
            v-if="currentPlane.image_uris"
            :src="currentPlane.image_uris.normal"
            :alt="currentPlane.name"
            class="max-w-full max-h-96 object-contain rotate-90"
          />
          <div v-else class="w-full h-64 flex items-center justify-center text-gray-400">
            No image available
          </div>
        </div>

        <!-- Card Info -->
        <div class="p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-2">
            {{ translatedPlane?.name || currentPlane.name }}
          </h2>
          
          <div v-if="translatedPlane?.type_line" class="text-sm text-gray-600 mb-4 italic">
            {{ translatedPlane.type_line }}
          </div>

          <div v-if="isTranslating" class="bg-blue-100 p-4 rounded text-blue-700 text-sm">
            🔄 Traduciendo...
          </div>

          <div v-else-if="translatedPlane?.oracle_text" class="bg-gray-100 p-4 rounded text-gray-700 text-sm leading-relaxed">
            {{ translatedPlane.oracle_text }}
          </div>

          <div v-else class="text-gray-500 text-sm text-center py-4">
            No rules text available
          </div>
        </div>
      </div>

      <div v-else class="text-center text-gray-300 py-12">
        Click "New Plane" to load a random plane card
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const planes = ref([])
const currentPlane = ref(null)
const translatedPlane = ref(null)
const isTranslating = ref(false)

async function fetchPlanes() {
  try {
    const response = await fetch('https://api.scryfall.com/cards/search?q=type:plane')
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
    const response = await fetch('https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) + '&langpair=en|es')
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
  if (planes.value.length === 0) {
    await fetchPlanes()
  }
  showRandomPlane()
}
</script>

<style scoped>
</style>
