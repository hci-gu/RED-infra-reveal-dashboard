import axios from 'axios'
import { useEffect, useState } from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { createClient, Provider } from 'urql'
import { useGuideContent, useLandingPageContent } from '../hooks/cms'

const FetchGuideContent = () => {
  useGuideContent()
  return null
}

const FetchLandingContent = () => {
  useLandingPageContent()
  return null
}

const CMSPageRoutes = () => {
  const [prismicRef, setPrismicRef] = useState()

  useEffect(() => {
    const run = async () => {
      const response = await axios.get(
        'https://infra-reveal.cdn.prismic.io/api/v2'
      )
      setPrismicRef(response.data.refs[0].ref)
    }
    run()
  }, [setPrismicRef])

  if (!prismicRef) {
    return null
  }

  const cmsClient = createClient({
    url: 'https://infra-reveal.cdn.prismic.io/graphql',
    preferGetMethod: true,
    fetchOptions: () => {
      return {
        headers: {
          'Prismic-Ref': prismicRef,
          Authorization: `Token ${import.meta.env.VITE_PRISMIC_TOKEN}`,
        },
      }
    },
  })

  return (
    <Provider value={cmsClient}>
      <Router>
        <Routes>
          <Route path="/proxy-guide" element={<FetchGuideContent />} />
          <Route path="/" element={<FetchLandingContent />} />
        </Routes>
      </Router>
    </Provider>
  )
}

export default CMSPageRoutes
