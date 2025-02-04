export function useTransactions() {
  const supabase = useSupabaseClient()
  const toast = useToast()
  
  // Central store for our transactions
  const transactions = ref([])

  // Fetch all transactions
  const fetchTransactions = async () => {
    const { data, error } = await supabase.from('transactions').select()
    if (error) {
      console.error('Error fetching transactions:', error.message)
      return
    }
    transactions.value = data
  }
  
  // Add (or update) a transaction
  const addTransaction = async (transactionData) => {
    const { error, data } = await supabase.from('transactions').upsert(transactionData)
    if (error) {
      toast.add({
        title: 'Transaction not saved',
        description: error.message,
        icon: 'i-heroicons-exclamation-circle',
        color: 'red'
      })
      return null
    }
    toast.add({
      title: 'Transaction saved successfully',
      icon: 'i-heroicons-check-circle'
    })
    
    // Optionally update the transactions array locally. Here we assume the upsert returns an array.
    if (data && Array.isArray(data)) {
      transactions.value.push(data[0])
    }
    return data
  }
  
  // Delete a transaction by id
  const deleteTransaction = async (transactionId) => {
    const { error } = await supabase.from('transactions').delete().eq('id', transactionId)
    if (error) {
      toast.add({
        title: 'Transaction deletion failed',
        description: error.message,
        icon: 'i-heroicons-exclamation-circle',
        color: 'red'
      })
    } else {
      toast.add({
        title: 'Transaction deleted successfully',
        icon: 'i-heroicons-check-circle',
        color: 'green'
      })
      transactions.value = transactions.value.filter(t => t.id !== transactionId)
    }
  }

  // Computed properties for aggregated state
  const income = computed(() => transactions.value.filter(t => t.type === 'Income'))
  const expense = computed(() => transactions.value.filter(t => t.type === 'Expense'))
  const incomeCount = computed(() => income.value.length)
  const expenseCount = computed(() => expense.value.length)
  const incomeTotal = computed(() => income.value.reduce((acc, t) => acc + t.amount, 0))
  const expenseTotal = computed(() => expense.value.reduce((acc, t) => acc - t.amount, 0))

  // Group transactions by date, sorted with most recent first
  const transactionsGroupedByDate = computed(() => {
    const grouped = {}
    const sortedTransactions = [...transactions.value].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    )
    for (const transaction of sortedTransactions) {
      const date = new Date(transaction.created_at).toISOString().split('T')[0]
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(transaction)
    }
    return grouped
  })

  return {
    transactions,
    fetchTransactions,
    addTransaction,
    deleteTransaction,
    income,
    expense,
    incomeCount,
    expenseCount,
    incomeTotal,
    expenseTotal,
    transactionsGroupedByDate
  }
}