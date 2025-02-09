<template>
    <UCard>
        <template #header>
            <h3 class="text-lg font-medium">
                Confirm your email
            </h3>
        </template>
        <p>
            We've sent you an email to confirm your account.
        </p>
    </UCard>

</template>

<script setup>
    import { isUserLoggedIn } from '~/composables/isUserLoggedIn'

    isUserLoggedIn('/')
</script>