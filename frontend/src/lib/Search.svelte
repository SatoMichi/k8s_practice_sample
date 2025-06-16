<script>
    import { createEventDispatcher } from 'svelte';
    
    export let query = '';
    export let loading = false;
    export let error = null;

    const dispatch = createEventDispatcher();

    function handleSubmit() {
        if (!query.trim()) return;
        dispatch('search', { query });
    }
</script>

<div class="max-w-2xl mx-auto p-4">
    <form on:submit|preventDefault={handleSubmit} class="mb-6">
        <div class="flex gap-2">
            <input
                type="text"
                bind:value={query}
                placeholder="検索キーワードを入力"
                class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
                type="submit"
                disabled={loading}
                class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
                {loading ? '検索中...' : '検索'}
            </button>
        </div>
    </form>

    {#if error}
        <div class="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
            {error}
        </div>
    {/if}
</div>

<style>
    /* スタイルはグローバルCSSで定義されているため、ここでは省略 */
</style> 
