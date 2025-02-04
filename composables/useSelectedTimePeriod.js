import { computed } from 'vue'
import { startOfYear, endOfYear, sub, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns'

export const useSelectedTimePeriod = (period) => {
  const dates = computed(() => {
    // If no filtering is desired, return null.
    if (period.value === 'All') {
      return null;
    }
    switch (period.value) {
      case 'Yearly':
        return {
          current: {
            from: startOfYear(new Date()),
            to: new Date()
          }
        }
      case 'Monthly':
        return {
          current: {
            from: startOfMonth(new Date()),
            to: new Date()
          }
        }
      case 'Daily':
        return {
          current: {
            from: startOfDay(new Date()),
            to: new Date()
          }
        }
      default:
        return null;
    }
  })
  return dates
}