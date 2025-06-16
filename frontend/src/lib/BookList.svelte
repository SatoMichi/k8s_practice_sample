<script>
    export let books = [];
    export let isLoading = false;
    export let error = null;
</script>

<div class="max-w-2xl mx-auto p-4">
    {#if isLoading}
        <div class="text-center py-4">
            <p class="text-gray-600">検索中...</p>
        </div>
    {:else if error}
        <div class="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
            {error}
        </div>
    {:else if books.length > 0}
        <div class="space-y-4">
            {#each books as book}
                <div class="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <h3 class="text-lg font-semibold text-gray-800">{book.title}</h3>
                    <p class="text-sm text-gray-600 mt-1">著者: {book.author}</p>
                    {#if book.description}
                        <p class="text-gray-700 mt-2">{book.description}</p>
                    {/if}
                    {#if book.score !== undefined}
                        <p class="text-sm text-gray-500 mt-1">
                            スコア: {(book.score * 100).toFixed(1)}%
                        </p>
                    {/if}
                </div>
            {/each}
        </div>
    {:else}
        <p class="text-center text-gray-500">
            検索結果がありません
        </p>
    {/if}
</div>

<style>
    /* スタイルはグローバルCSSで定義されているため、ここでは省略 */
</style> 
