<script>
  import Search from './components/Search.svelte'
  import BookList from './components/BookList.svelte'
  import { searchBooks } from './lib/api.js'
  import './styles/app.scss'

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
      if (searchComponent) {
        searchComponent.loading = false
      }
    }
  }
</script>

<main class="main">
  <h1 class="title">Gutenberg Search</h1>
  <Search bind:this={searchComponent} {isLoading} on:search={handleSearch} />
  <BookList {books} {isLoading} {error} />
</main>
