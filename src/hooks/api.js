import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from 'urql'
import {
  apiPackets,
  categoriesAtom,
  mapPackets,
  packetsAtom,
  tagsAtom,
} from '../state/packets'

const SessionsQuery = `
{
  sessions {
    id
    name
    start
    end
  }
}
`

export const useSessions = () => {
  const [sessions, setSessions] = useState([])
  const [result] = useQuery({
    query: SessionsQuery,
  })

  useEffect(() => {
    if (!!result.data) {
      setSessions(result.data.sessions)
    }
  }, [result])

  return sessions
}

const SessionQuery = `
query getSession($id: ID!) {
  session(where: { id: $id }) {
    id
    name
    start
    end
  }
}
`

export const useSession = () => {
  const { id } = useParams()
  const [session, setSession] = useState(null)
  const [result] = useQuery({
    query: SessionQuery,
    variables: { id },
  })

  useEffect(() => {
    if (!!result.data) {
      setSession(result.data.session)
    }
  }, [result])

  return session
}

const PacketQuery = `
query getPackets($where: PacketWhereInput!) {
    packets(where: $where) {
      id
      timestamp
      ip
      host
      protocol
      method
      accept
      lat
      lon
      country
      region
      city
      userId
      clientLat
      clientLon
      contentLength
      responseTime
    }
}
`

export const usePackets = () => {
  const { id } = useParams()
  const [packets, setPackets] = useAtom(apiPackets)
  const [result] = useQuery({
    query: PacketQuery,
    variables: {
      where: { session: { id: { equals: id } } },
    },
  })
  const { data, fetching } = result

  useEffect(() => {
    if (!!data) {
      setPackets(data.packets)
    }
  }, [id, data, setPackets])

  return { packets, fetching }
}

const CategoriesQuery = `
query getCategories {
  categories {
    id
    name
  }
}
`

export const useCategories = () => {
  const [categories, setCategories] = useAtom(categoriesAtom)

  const [result] = useQuery({
    query: CategoriesQuery,
  })
  const { data } = result
  useEffect(() => {
    if (!!data) setCategories(data.categories)
  }, [data, setCategories])

  return categories
}

const TagsQuery = `
query getTags {
  tags {
    id
    name
    category {
      name
    }
    domains
  }
}
`

export const useTags = () => {
  const [tags, setTags] = useAtom(tagsAtom)

  const [result] = useQuery({
    query: TagsQuery,
  })
  const { data } = result
  useEffect(() => {
    if (!!data) setTags(data.tags)
  }, [data, setTags])

  return tags
}

export const useCategoriesAndTags = () => {
  useTags()
  useCategories()
}
