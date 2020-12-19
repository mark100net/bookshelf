import {loadDevTools} from './dev-tools/load'
import './bootstrap'
import * as React from 'react'
import ReactDOM from 'react-dom'
import {App} from './app'
import { ReactQueryConfigProvider } from 'react-query'

const queryConfig = {
  queries: {
    retry: (failureCount, error) => {
      if (error.status === 404 || failureCount > 2) {
        return false
      }
      return true
    },
    refetchOnWindowFocus: false,
    useErrorBoundary: true
  },
}

loadDevTools(() => {
  ReactDOM.render(
    <ReactQueryConfigProvider config={queryConfig}>
      <App />
    </ReactQueryConfigProvider>,  
      document.getElementById('root'))
})
