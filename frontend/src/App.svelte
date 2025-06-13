<script>
  import Search from './lib/Search.svelte'
  import BookList from './lib/BookList.svelte'
  import { searchBooks } from './lib/api.js'

  let books = []
  let isLoading = false
  let error = null
  let searchComponent

  async function handleSearch(event) {
    const { query } = event.detail
    isLoading = true
    error = null
    
    try {
      books = await searchBooks(query)
    } catch (e) {
      error = e.message
      books = []
    } finally {
      isLoading = false
      searchComponent.dispatch('searchEnd')
    }
  }
</script>

<main>
  <h1>Gutenberg Search</h1>
  <Search bind:this={searchComponent} on:search={handleSearch} />
  <BookList {books} {isLoading} {error} />
</main>

<style>
  :global(body) {
    margin: 0
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif
    background-color: #f5f5f5
    color: #333
  }

  main {
    max-width: 1200px
    margin: 0 auto
    padding: 2rem
  }

  h1 {
    text-align: center
    color: #2c3e50
    margin-bottom: 2rem
  }
</style>
