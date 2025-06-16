<script>
    import '../styles/components/book-list.scss';
    
    export let books = [];
    export let isLoading = false;
    export let error = null;
</script>

<div class="book-list">
    {#if isLoading}
        <p class="loading">検索中...</p>
    {:else if error}
        <div class="error">
            {error}
        </div>
    {:else if books.length > 0}
        <div class="books">
            {#each books as book}
                <div class="book-card">
                    <h3 class="book-title">{book.title}</h3>
                    <p class="book-author">著者: {book.author}</p>
                    <div class="book-meta">
                        <span class="book-score">
                            類似度: {(book.similarity_score * 100).toFixed(1)}%
                        </span>
                        <span class="book-word-count">
                            単語数: {book.word_count.toLocaleString()}
                        </span>
                    </div>
                </div>
            {/each}
        </div>
    {:else}
        <p class="empty">
            検索結果がありません
        </p>
    {/if}
</div>

<style>
    /* スタイルはグローバルCSSで定義されているため、ここでは省略 */
</style> 
