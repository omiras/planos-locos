<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
      <h1 class="text-3xl font-bold text-gray-800 mb-8 text-center">Configuración</h1>

      <div class="space-y-6">
        <!-- Repeats Option -->
        <div class="flex items-center justify-between">
          <label class="text-lg font-medium text-gray-700">Repetir planos</label>
          <button 
            @click="allowRepeats = !allowRepeats"
            :class="['relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none', allowRepeats ? 'bg-blue-600' : 'bg-gray-200']"
          >
            <span 
              :class="['pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out', allowRepeats ? 'translate-x-5' : 'translate-x-0']"
            />
          </button>
        </div>

        <!-- Sounds Option -->
        <div class="flex items-center justify-between">
          <label class="text-lg font-medium text-gray-700">Sonidos activos</label>
          <button 
            @click="soundEnabled = !soundEnabled"
            :class="['relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none', soundEnabled ? 'bg-blue-600' : 'bg-gray-200']"
          >
            <span 
              :class="['pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out', soundEnabled ? 'translate-x-5' : 'translate-x-0']"
            />
          </button>
        </div>

        <!-- Fullscreen Option -->
        <div class="flex items-center justify-between">
          <label class="text-lg font-medium text-gray-700">Pantalla completa</label>
          <button 
            @click="fullscreenEnabled = !fullscreenEnabled"
            :class="['relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none', fullscreenEnabled ? 'bg-blue-600' : 'bg-gray-200']"
          >
            <span 
              :class="['pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out', fullscreenEnabled ? 'translate-x-5' : 'translate-x-0']"
            />
          </button>
        </div>
      </div>

      <div class="mt-10">
        <button 
          @click="startGame"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-xl transition duration-200 shadow-lg transform hover:scale-[1.02]"
        >
          Empezar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['start'])

// Defaults:
// Repeats: NO (false)
// Sounds: YES (true)
// Fullscreen: YES (true)
const allowRepeats = ref(false)
const soundEnabled = ref(true)
const fullscreenEnabled = ref(true)

function startGame() {
  emit('start', {
    allowRepeats: allowRepeats.value,
    soundEnabled: soundEnabled.value,
    fullscreenEnabled: fullscreenEnabled.value
  })
}
</script>
