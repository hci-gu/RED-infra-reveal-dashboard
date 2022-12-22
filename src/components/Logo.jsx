import { Title } from '@mantine/core'

export const Logo = ({ small }) => {
  return (
    <Title
      order={small ? 4 : 1}
      sx={() => ({
        '@media (min-width: 1600px)': {
          fontSize: '1.5rem',
        },
      })}
    >
      <strong style={{ color: '#a71d31' }}>RED</strong> INFRA REVEAL
    </Title>
  )
}
