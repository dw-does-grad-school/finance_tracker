export const isUserLoggedIn = (url = '/') => {
    // Initialize the user composable
    const user = useSupabaseUser()

    // Watch for changes in the user state
    watch(
    user,
    (currentUser) => {
        if (currentUser) {
        return navigateTo(url)
        }
    },
        { immediate: true }
    )
    return {user}
}