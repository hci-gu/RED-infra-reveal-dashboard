import { useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { useQuery } from 'urql'
import { cmsContentAtom, languageAtom } from '../state/app'

const LandingPageQuery = `
query content($language: String = "en-us") {
    allPagecontents(lang: $language) {
      edges {
        node {
          _meta {
            id
          }
          title
          description
          sessions_title
          sections {
            section_title
            text
          }
          concepts_header
          concepts {
            concept_title
            concept_description
          }
        }
      }
    }
}
`

const GuideQuery = `
query content($language: String = "en-us") {
  allGuide_pages(lang: $language) {
    edges {
      node {
        _meta {
          id
        }
        title
        description
        select_placeholder
        guides {
            link {
              ... on Guide {
                title
                platform
                steps {
                  text
                  image
                }
              }
            }
          }
      }
    }
  }
}
`

export const useLandingPageContent = () => {
  const [, setCmsContent] = useAtom(cmsContentAtom)
  const language = useAtomValue(languageAtom)
  const [result] = useQuery({
    query: LandingPageQuery,
    variables: {
      language,
    },
  })

  useEffect(() => {
    if (
      !!result.data &&
      result.data.allPagecontents &&
      result.data.allPagecontents.edges.length
    ) {
      setCmsContent((s) => ({
        ...s,
        landing: result.data.allPagecontents.edges[0].node,
      }))
    }
  }, [result, setCmsContent])

  return result.data
}

export const useGuideContent = () => {
  const [, setCmsContent] = useAtom(cmsContentAtom)
  const language = useAtomValue(languageAtom)
  const [result] = useQuery({
    query: GuideQuery,
    variables: {
      language,
    },
  })

  useEffect(() => {
    if (
      !!result.data &&
      result.data.allGuide_pages &&
      result.data.allGuide_pages.edges.length
    ) {
      setCmsContent((s) => ({
        ...s,
        guide: result.data.allGuide_pages.edges[0].node,
      }))
    }
  }, [result, setCmsContent])

  return result.data
}
