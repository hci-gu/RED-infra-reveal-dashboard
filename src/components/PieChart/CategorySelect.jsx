import { Select } from '@mantine/core'
import { useAtom, useAtomValue } from 'jotai'
import React from 'react'
import { categoriesAtom, selectedCategoryAtom } from '../../state/packets'

const CategorySelect = () => {
  const categories = useAtomValue(categoriesAtom)
  const [category, setCategory] = useAtom(selectedCategoryAtom)

  return (
    <Select
      value={category}
      placeholder="Select category"
      data={categories.map((c) => ({ label: c.name, value: c }))}
      onChange={(value) => setCategory(value)}
      clearable
    />
  )
}

export default CategorySelect
