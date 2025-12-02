
<script setup>
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

const name = ref('')
const description = ref('')
const file = ref(null)
const loading = ref(false)
const message = ref('')
const error = ref('')

const handleFileChange = (event) => {
  file.value = event.target.files[0]
}

const submitProposal = async () => {
  loading.value = true
  message.value = ''
  error.value = ''

  if (!name.value || !description.value || !file.value) {
    error.value = 'Please fill in all fields.'
    loading.value = false
    return
  }

  try {
    // 1. Upload image
    const fileExt = file.value.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('plane-images')
      .upload(filePath, file.value)

    if (uploadError) throw uploadError

    // 2. Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('plane-images')
      .getPublicUrl(filePath)

    // 3. Insert proposal
    const { error: insertError } = await supabase
      .from('proposals')
      .insert({
        name: name.value,
        description: description.value,
        image_url: publicUrl,
        status: 'pending'
      })

    if (insertError) throw insertError

    message.value = 'Proposal submitted successfully!'
    name.value = ''
    description.value = ''
    file.value = null
    // Reset file input manually if needed
    document.getElementById('plane-image').value = ''

  } catch (e) {
    console.error(e)
    error.value = 'Error submitting proposal: ' + e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-4 text-gray-800">Propose New Plane</h2>
    
    <div v-if="message" class="mb-4 p-3 bg-green-100 text-green-700 rounded">
      {{ message }}
    </div>
    
    <div v-if="error" class="mb-4 p-3 bg-red-100 text-red-700 rounded">
      {{ error }}
    </div>

    <form @submit.prevent="submitProposal" class="space-y-4">
      <div>
        <label for="plane-name" class="block text-sm font-medium text-gray-700">Plane Name</label>
        <input 
          id="plane-name" 
          v-model="name" 
          type="text" 
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          placeholder="e.g. The Blind Eternities"
        />
      </div>

      <div>
        <label for="plane-desc" class="block text-sm font-medium text-gray-700">Description</label>
        <textarea 
          id="plane-desc" 
          v-model="description" 
          rows="3" 
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          placeholder="Describe the plane..."
        ></textarea>
      </div>

      <div>
        <label for="plane-image" class="block text-sm font-medium text-gray-700">Image</label>
        <input 
          id="plane-image" 
          type="file" 
          accept="image/*"
          @change="handleFileChange"
          class="mt-1 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-indigo-50 file:text-indigo-700
            hover:file:bg-indigo-100"
        />
      </div>

      <button 
        type="submit" 
        :disabled="loading"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {{ loading ? 'Submitting...' : 'Submit Proposal' }}
      </button>
    </form>
  </div>
</template>
