import {queryCache, useMutation, useQuery} from 'react-query'
import { setQueryDataForBook} from 'utils/books'
import {client} from 'utils/api-client'

const defaultMutationOptions = {
  onSettled: () => queryCache.invalidateQueries('list-items')
}


function useCreateListItem(user) {
  return useMutation(
    bookId => {
      client('list-items', {
        data: {bookId},
        token: user.token,
      })
    },
    defaultMutationOptions
  )
}

function useListItems(user) {
  const {data: listItems} = useQuery({
    queryKey: ['list-items'],
    queryFn: () =>
      client('list-items', {token: user.token}).then(data => data.listItems),
    config: { 
      onSuccess(listItems) {
        for (const listItem of listItems) {
          setQueryDataForBook(listItem.book)
        }
      },
    }    
  })

  return listItems ?? []
}

function useListItem(user, bookId) {
  const listItems = useListItems(user)

  const listItem = listItems.find(item => {
    return item.bookId === bookId
  })

  return listItem
}

function useRemoveListItem(user) {
  return useMutation(
    listItemId => {
      client(`list-items/${listItemId}`, {
        method: 'DELETE',
        token: user.token,
      })
    },
    defaultMutationOptions
  )
}

function useUpdateListItem(user, options) {
  return useMutation(
    updates => 
      client(`list-items/${updates.id}`, {
        data: updates,
        method: 'PUT',
        token: user.token,
      })
    ,
    { 
      onMutate: newItem => {
        const key = ['list-items']
        queryCache.cancelQueries()
        const previousValue = queryCache.getQueryData(key)
        const newValue = previousValue.map(item =>
          item.id === newItem.id ? {...item, ...newItem} : item
        )
        queryCache.setQueryData(key, newValue)
        return previousValue
      },
      onError: (err, variables, previousValue) => {
        console.log("on error", err)
        queryCache.setQueryData(['list-items'], previousValue)
        },
      onSettled: (item) => {
        queryCache.invalidateQueries(['list-items'])
      },
      ...defaultMutationOptions, ...options
     }
  )
}

export {
  useCreateListItem,
  useListItems,
  useListItem,
  useRemoveListItem,
  useUpdateListItem,
}
