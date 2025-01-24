<template>
    <section class="flex items-center justify-between mb-10">
        <h1 class="text-4xl font-extrabold">Summary</h1>
        <div>
            <USelectMenu :options="transactionView" v-model="viewSelected" />
        </div>
    </section>
</template>

<script setup>
import { transactionView } from '~/constants'
const viewSelected = ref(transactionView[0])
</script>