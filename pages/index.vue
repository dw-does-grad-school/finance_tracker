<template>
    <section class="flex items-center justify-between mb-10">
        <h1 class="text-4xl font-extrabold">Summary</h1>
        <div class="flex gap-4">
            <USelectMenu :options="transactionView" v-model="viewSelected" />
            <USelectMenu :options="timePeriodOptions" v-model="selectedPeriod" />
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
            <TransactionModal v-model="isOpen" @saved="onTransactionSaved" />
            <UButton icon="i-heroicons-plus-circle" color="white" variant="solid" label="Add" @click="isOpen = true" />
        </div>
    </section>

    <section v-if="filteredTransactions.length">
        <Transaction 
            v-for="transaction in filteredTransactions" 
            :key="transaction.id" 
            :transaction="transaction" 
            @deleted="removeTransaction" 
        />

        <div v-for="(transactionsOnDay, date) in groupedTransactionsByDate" :key="date" class="mb-10">
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
import { ref, computed } from 'vue'
import { transactionView, timePeriodOptions } from '~/constants'
import { useTransactions } from '~/composables/useTransactions'
import { useSelectedTimePeriod } from '~/composables/useSelectedTimePeriod'

const viewSelected = ref(transactionView[0])
const selectedPeriod = ref('All')

const timePeriod = useSelectedTimePeriod(selectedPeriod)

const { 
  transactions, 
  fetchTransactions, 
  deleteTransaction
} = useTransactions()

const filteredTransactions = computed(() => {
  let filtered = transactions.value;
  
  if (timePeriod.value && timePeriod.value.current) {
    const { from, to } = timePeriod.value.current;
    filtered = filtered.filter(transaction => {
      const tDate = new Date(transaction.created_at);
      return tDate >= from && tDate <= to;
    });
  }
  
  if (viewSelected.value && viewSelected.value !== 'All Transactions') {
    if (viewSelected.value === 'Income') {
      filtered = filtered.filter(t => t.type === 'Income');
    } else if (viewSelected.value === 'Expenses') {
      filtered = filtered.filter(t => t.type === 'Expense');
    }
  }
  
  return filtered;
});

const income = computed(() => filteredTransactions.value.filter(t => t.type === 'Income'));
const expense = computed(() => filteredTransactions.value.filter(t => t.type === 'Expense'));

const incomeCount = computed(() => income.value.length);
const expenseCount = computed(() => expense.value.length);

const incomeTotal = computed(() => income.value.reduce((acc, t) => acc + t.amount, 0));
const expenseTotal = computed(() => expense.value.reduce((acc, t) => acc - t.amount, 0));

const groupedTransactionsByDate = computed(() => {
  const grouped = {};
  const sortedTransactions = [...filteredTransactions.value].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
  
  sortedTransactions.forEach(transaction => {
    const date = new Date(transaction.created_at).toISOString().split('T')[0];
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(transaction);
  });
  
  return grouped;
});

const isOpen = ref(false)

await fetchTransactions()

const onTransactionSaved = async () => {
  await fetchTransactions()
}

const removeTransaction = (deletedId) => {
  transactions.value = transactions.value.filter(transaction => transaction.id !== deletedId)
}
</script>
