import { queryCache, useMutation, useQuery } from 'react-query'
import {client} from 'utils/api-client'

function useListItems(user) {

  const {data: listItems} = useQuery({
    queryKey: ['list-items'],
    queryFn: () =>
      client('list-items', { token: user.token}).then(data => data.listItems)
  })

  return listItems

}

function useListItem(user, bookId) {
  const listItems = useListItems(user)

  const listItem = listItems?.find(item => {
    return item.bookId === bookId
  }) ?? null

  return listItem
}

function useUpdateListItem(user) {
  const [updateListItem] = useMutation(
    updates => {
      client(`list-items/${updates.id}`, {
        data: updates,
        method: 'PUT',
        token: user.token,
      })
    },
    {
      onSettled: () => {
        queryCache.invalidateQueries('list-items')
      },
    },
  )
  return updateListItem
}

export { useListItems, useListItem, useUpdateListItem }