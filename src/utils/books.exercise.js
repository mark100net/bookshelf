import {useQuery, queryCache } from 'react-query'
import {client} from 'utils/api-client'
import bookPlaceholderSvg from 'assets/book-placeholder.svg'

const loadingBook = {
  title: 'Loading...',
  author: 'loading...',
  coverImageUrl: bookPlaceholderSvg,
  publisher: 'Loading Publishing',
  synopsis: 'Loading...',
  loadingBook: true,
}

const loadingBooks = Array.from({length: 10}, (v, index) => ({
  id: `loading-book-${index}`,
  ...loadingBook,
}))

function setQueryDataForBook(bookId, data) {
  queryCache.setQueryData(['book', {bookId}], data)
}

function refetchBookSearchQuery(user) {
  queryCache.removeQueries('bookSearch')
  queryCache.prefetchQuery({
    queryKey: ['bookSearch', { query: '' }],
    queryFn: () =>
      client(`books?query=${encodeURIComponent('')}`, {
        token: user.token,
    }).then(data => data.books)
  })
}

function useBook(bookId, user) {
  const {data} = useQuery({
    queryKey: ['book', {bookId}],
    queryFn: () =>
      client(`books/${bookId}`, {token: user.token}).then(data => data.book),
  })

  return data ?? loadingBook
}

function useBookSearch(query, user) {
  const result = useQuery({
    queryKey: ['bookSearch', {query}],
    queryFn: () =>
      client(`books?query=${encodeURIComponent(query)}`, {
        token: user.token,
      }).then(data => data.books),
    config: {
      onSuccess: (data) => data.forEach((book) => setQueryDataForBook(book.id, book))
    }  
  })

  return {...result, books: result.data ?? loadingBooks}
}

export {refetchBookSearchQuery, setQueryDataForBook, useBook, useBookSearch}
