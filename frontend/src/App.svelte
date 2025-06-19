<script>
  import Search from './components/Search.svelte'
  import BookList from './components/BookList.svelte'
  import { searchBooks } from './lib/api.js'

  let books = []
  let isLoading = false
  let error = null
  let searchComponent
  let hasSearched = false

  async function handleSearch(event) {
    const { query } = event.detail
    isLoading = true
    error = null
    hasSearched = true
    
    try {
      books = await searchBooks(query)
    } catch (e) {
      error = e.message
      books = []
    } finally {
      isLoading = false
      if (searchComponent) {
        searchComponent.loading = false
      }
    }
  }
</script>

<main class="main">
  <h1 class="title">📚 Gutenberg Explorer</h1>
  <Search bind:this={searchComponent} {isLoading} on:search={handleSearch} />
  {#if hasSearched}
    <BookList {books} {isLoading} {error} />
  {:else}
    <div class="welcome-message">
      <div class="welcome-icon">🔍</div>
      <h2>プロジェクト・グーテンベルクの世界へようこそ</h2>
      <p>数千冊の名作を検索して発見しましょう</p>
    </div>
  {/if}
</main>
