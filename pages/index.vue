<template>
    <section class="flex items-center justify-between mb-10">
        <h1 class="text-4xl font-extrabold">Summary</h1>
        <div>
            <USelectMenu :options="transactionView" v-model="viewSelected" />
        </div>
    </section>

    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 sm:gap-16 mb-10">
        <Trend color="green" title="Income" :amount="incomeTotal" :last-amount="3000" :loading="false" />
        <Trend color="red" title="Expense" :amount="expenseTotal" :last-amount="5000" :loading="false" />
        <Trend color="green" title="Investments" :amount="4000" :last-amount="3000" :loading="false" />
        <Trend color="red" title="Saving" :amount="4000" :last-amount="3000" :loading="false"/>
    </section>

    <section class="flex justify-between mb-10">
        <div>
            <h2 class="text-2xl font-extrabold">Transactions</h2>
            <div class="text-slate-500 dark:text-slate-400">
                You have {{ incomeCount }} income transactions and {{ expenseCount }} expense transactions this period. 
            </div>
        </div>
        <div>
        <TransactionModal v-model="isOpen" />
      <UButton icon="i-heroicons-plus-circle" color="white" variant="solid" label="Add" @click="isOpen = true" />
        </div>
    </section>

    <section v-if="transactions.length">
        <Transaction 
            v-for="transaction in transactions" 
            :key="transaction.id" 
            :transaction="transaction" 
            @deleted="removeTransaction" 
        />

        <div v-for="(transactionsOnDay, date) in transactionsGroupedByDate" :key="date" class="mb-10">
            <DailyTransactionSummary :date="date" :transactions="transactionsOnDay" />
            <Transaction 
                v-for="transaction in transactionsOnDay" 
                :key="transaction.id" 
                :transaction="transaction" 
                @deleted="removeTransaction" 
            />
        </div>
    </section>
</template>

<script setup>
import { transactionView } from '~/constants'
const viewSelected = ref(transactionView[0]); 
const supabase = useSupabaseClient(); 
const transactions = ref([])
const isOpen = ref(false)

const income = computed(() => 
    transactions.value.filter(transaction => transaction.type === 'Income')
)

const expense = computed(() => 
    transactions.value.filter(transaction => transaction.type === 'Expense')
)

const incomeCount = computed(() => income.value.length)
const expenseCount = computed(() => expense.value.length)

const incomeTotal = computed(() => income.value.reduce((acc, cur) => acc + cur.amount, 0))
const expenseTotal = computed(() => expense.value.reduce((acc, cur) => acc - cur.amount, 0))

const fetchTransactions = async () => {
    const { data, error } = await supabase
        .from('transactions')
        .select();

    if (error) {
        console.error("Error fetching transactions:", error.message);
        return;
    }
    transactions.value = data;
};

// Function to remove deleted transaction from the list
const removeTransaction = (deletedId) => {
    transactions.value = transactions.value.filter(transaction => transaction.id !== deletedId);
};

// Fetch transactions on mount
await fetchTransactions();

const transactionsGroupedByDate = computed(() => {
  let grouped = {}
  for (const transaction of transactions.value) {
    const date = new Date(transaction.created_at).toISOString().split('T')[0]
    if (!grouped[date]) {
      grouped[date] = []
    }
    grouped[date].push(transaction)
  }
  return grouped
});
</script>
