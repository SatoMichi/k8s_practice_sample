<script>
    import { createEventDispatcher } from 'svelte';
    import '../styles/components/search.scss';
    
    export let query = '';
    export let loading = false;
    export let error = null;

    const dispatch = createEventDispatcher();

    function handleSubmit() {
        if (!query.trim()) return;
        dispatch('search', { query });
    }
</script>

<div class="search-container">
    <form on:submit|preventDefault={handleSubmit} class="search-form">
        <div class="search-input-group">
            <input
                type="text"
                bind:value={query}
                placeholder="検索キーワードを入力"
                class="search-input"
            />
            <button
                type="submit"
                disabled={loading}
                class="search-button"
            >
                {loading ? '検索中...' : '検索'}
            </button>
        </div>
    </form>

    {#if error}
        <div class="error-message">
            {error}
        </div>
    {/if}
</div>
