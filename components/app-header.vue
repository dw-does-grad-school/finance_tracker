<template>
    <header class="flex justify-between items-center mt-10">
        <NuxtLink to="/" class="text-xl font-bold">
            Finance Tracker
        </NuxtLink>
        <div>
            <UAvatar src="https://avatars.githubusercontent.com/u/739984?v=4" alt="Avatar" />
        </div>
    </header>
</template>

<script setup>

// Initialize the user composable
const user = useSupabaseUser()

// Watch for changes in the user state
watch(
  user,
  (currentUser) => {
    if (currentUser) {
      console.log("User is logged in")
    }
  },
  { immediate: true }
)
</script>