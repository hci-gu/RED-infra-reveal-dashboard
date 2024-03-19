import { Global, MantineProvider } from '@mantine/core'
import { useAtomValue } from 'jotai'
import React from 'react'
import * as ReactDOMClient from 'react-dom/client'
import App from './App'
import { darkModeAtom } from './state/app'

const AppWithTheme = () => {
  const darkMode = useAtomValue(darkModeAtom)
  return (
    <MantineProvider
      theme={{
        colorScheme: darkMode ? 'dark' : 'light',
        fontFamily: 'Josefin Sans',
        components: {
          Card: {
            defaultProps: {
              shadow: 'sm',
              radius: 'md',
              p: 'xs',
            },
          },
        },
      }}
      withGlobalStyles
      withNormalizeCSS
    >
      <Global
        styles={(theme) => ({
          '*, *::before, *::after': {
            boxSizing: 'border-box',
          },

          body: {
            backgroundColor:
              theme.colorScheme === 'dark' ? '#0d0d0d' : '#FBFBFB',
          },
        })}
      />
      <App />
    </MantineProvider>
  )
}

// const client = createClient({
//   url: `${import.meta.env.VITE_API_URL}`,
// })

const Root = () => {
  return (
    <div>
      <AppWithTheme />
    </div>
  )
}

const root = ReactDOMClient.createRoot(document.getElementById('root'))
root.render(<Root />)
