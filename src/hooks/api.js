import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiPackets, categoriesAtom, tagsAtom } from '../state/packets'
import { sessionAtom, sessionsAtom } from '../state/sessions'

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
  // const [sessions, setSessions] = useAtom(sessionsAtom)
  // const [result] = useQuery({
  //   query: SessionsQuery,
  // })

  // useEffect(() => {
  //   if (!!result.data) {
  //     setSessions(result.data.sessions.reverse())
  //   }
  // }, [result])

  return []
}

const CreateSessionQuery = `
mutation create($data: SessionCreateInput!) {
  createSession(data: $data) {
    id
    name
    start
    end
  }
}
`

export const useCreateSession = () => {
  const [result, createSession] = useMutation(CreateSessionQuery)
  const [, setSessions] = useAtom(sessionsAtom)

  useEffect(() => {
    if (!!result.data) {
      setSessions((sessions) => [...sessions, result.data.createSession])
    }
  }, [result])

  return [result, createSession]
}

const UpdateSessionQuery = `
mutation update($id: ID!, $data: SessionUpdateInput!) {
  updateSession(where: { id: $id }, data: $data) {
    id
    name
    start
    end
  }
}
`

export const useUpdateSession = () => {
  const [result, updateSession] = useMutation(UpdateSessionQuery)
  const [sessions, setSessions] = useAtom(sessionsAtom)

  useEffect(() => {
    if (!!result.data) {
      setSessions([...sessions])
    }
  }, [result])

  return [result, updateSession]
}

const SessionQuery = `
query getSession($id: ID!) {
  session(where: { id: $id }) {
    id
    name
    start
    end
    lat
    lon
  }
}
`

export const useSession = () => {
  // const { id } = useParams()
  // const [session, setSession] = useAtom(sessionAtom)
  // const [result] = useQuery({
  //   query: SessionQuery,
  //   variables: { id },
  // })

  // useEffect(() => {
  //   if (!!result.data) {
  //     setSession(result.data.session)
  //   }
  // }, [result])

  // rerturn session
  return {
    id: 'mock',
    name: 'mock',
    start: new Date(),
    end: null,
    lat: 57.70887,
    lon: 11.97456,
  }
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
  // const { id } = useParams()
  // const [packets, setPackets] = useAtom(apiPackets)
  // const [result] = useQuery({
  //   query: PacketQuery,
  //   variables: {
  //     where: { session: { id: { equals: id } } },
  //   },
  // })
  // const { data, fetching } = result

  // useEffect(() => {
  //   if (!!data) {
  //     setPackets(data.packets)
  //   }
  // }, [id, data, setPackets])

  // return { packets, fetching }
  return {
    packets: [],
    fetching: false,
  }
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
  // const [categories, setCategories] = useAtom(categoriesAtom)

  // const [result] = useQuery({
  //   query: CategoriesQuery,
  // })
  // const { data } = result
  // useEffect(() => {
  //   if (!!data) setCategories(data.categories)
  // }, [data, setCategories])

  return []
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
  // const [tags, setTags] = useAtom(tagsAtom)

  // const [result] = useQuery({
  //   query: TagsQuery,
  // })
  // const { data } = result
  // useEffect(() => {
  //   if (!!data) setTags(data.tags)
  // }, [data, setTags])

  return []
}

export const useCategoriesAndTags = () => {
  useTags()
  useCategories()
}
