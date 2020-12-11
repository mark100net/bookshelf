/** @jsx jsx */
import {jsx} from '@emotion/core'

import * as React from 'react'
import {
  FaCheckCircle,
  FaPlusCircle,
  FaMinusCircle,
  FaBook,
  FaTimesCircle,
} from 'react-icons/fa'
import Tooltip from '@reach/tooltip'
// 🐨 you'll need useQuery, useMutation, and queryCache from 'react-query'
import { useQuery, useMutation, useQueryCache } from 'react-query'

// 🐨 you'll also need client from 'utils/api-client'
import { client } from 'utils/api-client'
import {useAsync} from 'utils/hooks'
import * as colors from 'styles/colors'
import {CircleButton, Spinner} from './lib'

function TooltipButton({label, isLoading, highlight, onClick, icon, ...rest}) {
  const {isError, error, run} = useAsync()

  function handleClick() {
    run(onClick())
  }

  return (
    <Tooltip label={isError ? error.message : label}>
      <CircleButton
        css={{
          backgroundColor: 'white',
          ':hover,:focus': {
            color: isLoading
              ? colors.gray80
              : isError
              ? colors.danger
              : highlight,
          },
        }}
        disabled={isLoading}
        onClick={handleClick}
        aria-label={isError ? error.message : label}
        {...rest}
      >
        {isLoading ? <Spinner /> : isError ? <FaTimesCircle /> : icon}
      </CircleButton>
    </Tooltip>
  )
}

function StatusButtons({user, book}) {
  // 🐨 call useQuery here to get the listItem (if it exists)
  // queryKey should be 'list-items'
  // queryFn should call the list-items endpoint
  const { isLoading, isError, data, error } = useQuery({
    queryKey: ['list-items'],
    queryFn: () => 
      client('list-items', { token: user.token}).then(data => data.listItems)  
  })

  const queryCache = useQueryCache()

  // 🐨 call useMutation here and assign the mutate function to "update"
  const [update] = useMutation((updates) => {
    const listItemId = updates.id
    client(`list-items/${listItemId}`, {
      data: updates,
      method: 'PUT',
      token: user.token,
    })},
    {
      onSuccess: () => {
        console.log('invalidating update')
        queryCache.invalidateQueries('list-items')
    }
  })
    
  // 🐨 call useMutation here and assign the mutate function to "remove"
  // the mutate function should call the list-items/:listItemId endpoint with a DELETE
  const [remove] = useMutation((listItemId) => {
    console.log('removing')
    client(`list-items/${listItemId}`, {
      method: 'DELETE',

      token: user.token
    })},
    {
      onSuccess: () => {
        console.log('invalidating')
        queryCache.invalidateQueries('list-items')
    }
  })
  

  // 🐨 call useMutation here and assign the mutate function to "create"
  // the mutate function should call the list-items endpoint with a POST
  // and the bookId the listItem is being created for.
  const [create] = useMutation((bookId) => {
    client('list-items', {
      data: {bookId},
      token: user.token
    })},
    {
      onSuccess: () => {
        queryCache.invalidateQueries('list-items')
    }
  })

  // if (isLoading) {
  //   return null
  // }

  // if (isError) {
  //   console.error("There was an error with the status buttons:", error)
  //   return null
  // }

  const listItem = (data && data.find((item) => item.bookId === book.id))

  return (
    <React.Fragment>
      {listItem ? (
        Boolean(listItem.finishDate) ? (
          <TooltipButton
            label="Unmark as read"
            highlight={colors.yellow}
            // 🐨 add an onClick here that calls update with the data we want to update
            // 💰 to mark a list item as unread, set the finishDate to null
            // {id: listItem.id, finishDate: null}
            onClick={() => update({id: listItem.id, finishDate: null})}
            isLoading={isLoading}
            icon={<FaBook />}
          />
        ) : (
          <TooltipButton
            label="Mark as read"
            highlight={colors.green}
            // 🐨 add an onClick here that calls update with the data we want to update
            // 💰 to mark a list item as read, set the finishDate
            // {id: listItem.id, finishDate: Date.now()}
            onClick={() => update({id: listItem.id, finishDate: Date.now()})}
            icon={<FaCheckCircle />}
          />
        )
      ) : null}
      {listItem ? (
        <TooltipButton
          label="Remove from list"
          highlight={colors.danger}
          // 🐨 add an onClick here that calls remove
          onClick={() => remove(listItem.id)}
          icon={<FaMinusCircle />}
        />
      ) : (
        <TooltipButton
          label="Add to list"
          highlight={colors.indigo}
          // 🐨 add an onClick here that calls create
          onClick={()=> create(book.id)}
          icon={<FaPlusCircle />}
        />
      )}
    </React.Fragment>
  )
}

export {StatusButtons}
