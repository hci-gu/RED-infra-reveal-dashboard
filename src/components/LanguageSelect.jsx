import styled from '@emotion/styled'
import { Select } from '@mantine/core'
import { useAtom } from 'jotai'
import React from 'react'
import { languageAtom } from '../state/app'
import { mobile } from '../utils/layout'

const availableLanguages = [
  {
    name: '🇬🇧 English',
    value: 'en-us',
  },
  {
    name: '🇸🇪 Svenska',
    value: 'sv-se',
  },
  {
    name: '🇦🇷 Español',
    value: 'es-ar',
  },
  {
    name: '🇩🇪 Deutsch',
    value: 'de-de',
  },
]

const Container = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  ${mobile()} {
    top: 0.5rem;
    right: 0.5rem;
  }
`

const LanguageSelect = () => {
  const [language, setLanguage] = useAtom(languageAtom)

  return (
    <Container>
      <Select
        value={language}
        onChange={(val) =>
          setLanguage(
            availableLanguages.find((locale) => locale.value === val).value
          )
        }
        data={availableLanguages.map(({ name, value }) => ({
          label: name,
          value,
        }))}
      />
    </Container>
  )
}

export default LanguageSelect
