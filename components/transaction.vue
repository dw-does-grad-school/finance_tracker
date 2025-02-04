<template>
    <div class="grid grid-cols-3 py-4 border-b border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100">
      <div class="flex items-center justify-between space-x-4 col-span-2">
        <div class="flex items-center space-x-1">
          <UIcon :name="icon" :class="[iconColor]" />
          <div>{{ transaction.description }}</div>
        </div>
  
        <div>
          <UBadge color="white" v-if="transaction.category">{{ transaction.category }}</UBadge>
        </div>
      </div>
  
      <div class="flex items-center justify-end space-x-2">
        <div>{{ currency }}</div>
        <div>
          <UDropdown :items="items" :popper="{ placement: 'bottom-start' }">
            <UButton color="white" variant="ghost" trailing-icon="i-heroicons-ellipsis-horizontal" :loading="isLoading" />
          </UDropdown>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    transaction: Object
  })

  const emit = defineEmits(['deleted', 'saved'])
  const isIncome = computed(() => props.transaction.type ===  'Income')
  const icon = computed(
    () => isIncome.value ? 'i-heroicons-arrow-up-right' : 'i-heroicons-arrow-down-left'
  )

  const iconColor = computed(() => isIncome.value ? 'text-green-600' : 'text-red-600')


  const { currency } = useCurrency(props.transaction.amount)

  const isLoading = ref(false)
  const toast = useToast()
  const supabase = useSupabaseClient()
  const transactions = ref([]);

  const deleteTransaction = async () => {
    isLoading.value = true

    try{
      await supabase
        .from('transactions')
        .delete()
        .eq('id', props.transaction.id)

      toast.add({
        title: 'Transaction deleted successfully',
        icon: 'i-heroicons-check-circle',
        color: 'green'
      })
      emit('deleted', props.transaction.id)
    }catch(error){
      
      toast.add({
        title: 'Failed to delete transaction',
        icon: 'i-heroicons-exclamation-circle',
        color: 'red'
      })
    } finally {
      isLoading.value = false
    }
  }

  const items = [
    [
      {
        label: 'Edit',
        icon: 'i-heroicons-pencil-square-20-solid',
        click: () => console.log('Edit')
      },
      {
        label: 'Delete',
        icon: 'i-heroicons-trash-20-solid',
        click: deleteTransaction
      }
    ]
  ]

  const form = ref();

  const save = async () => {
    if (form.value.errors.length) return

    isLoading.value = true
    try {
      const { error, data } = await supabase.from('transactions').upsert({ ...state.value })
      
      if (!error) {
        toast.add({
          title: 'Transaction saved successfully',
          icon: 'i-heroicons-check-circle'
        })
        isOpen.value = false
        // Emit the event so that the parent can update its UI
        emit('saved', data)
      }
    } catch (e) {
      toast.add({
        title: 'Transaction not saved',
        description: e.message,
        icon: 'i-heroicons-exclamation-circle',
        color: 'red'
      })
    } finally {
      isLoading.value = false
    }
  }
  </script>