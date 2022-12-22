import { MultiSelect, Select } from '@mantine/core'
import { useAtom, useAtomValue } from 'jotai'
import React from 'react'
import { selectedTagsAtom, tagsAtom } from '../state/packets'

const TagSelect = () => {
  const tags = useAtomValue(tagsAtom)
  const [value, setValue] = useAtom(selectedTagsAtom)
  return (
    <MultiSelect
      placeholder="Select tags"
      data={tags.map((tag) => ({ value: tag, label: tag.name }))}
      value={value}
      onChange={(value) => setValue(value)}
      searchable
      clearable
      sx={() => ({
        '@media (min-width: 1600px)': {
          '*': {
            padding: '0.2rem',
            fontSize: '1.5rem',
          },
        },
      })}
    />
  )
}

export default TagSelect
