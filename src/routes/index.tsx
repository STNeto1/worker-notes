import { For, Show, Suspense } from 'solid-js'
import { Title, useRouteData } from 'solid-start'
import { createServerData$, redirect } from 'solid-start/server'
import { user } from '~/db/schemas'
import { useUser } from '~/hooks/useUser'
import { getConnection } from '~/lib/getConn'

export function routeData() {
  return createServerData$(async (_, ctx) => {
    const sessionUser = await useUser(ctx.request)
    if (!sessionUser) {
      throw redirect('/sign-in')
    }

    const $users = await getConnection(ctx.env).select().from(user)

    return {
      user: sessionUser,
      users: $users
    }
  })
}

export default function Home() {
  const data = useRouteData<typeof routeData>()

  return (
    <main>
      <Title>Notes</Title>
      <h1>Notes App!</h1>

      <Suspense fallback={<div>Loading profile...</div>}>
        <pre>{JSON.stringify(data()?.user, null, 2)}</pre>
      </Suspense>

      <Suspense fallback={<div>Loading users...</div>}>
        <Show when={data()?.users?.length}>
          <ul>
            <For each={data()?.users ?? []}>
              {({ username }) => <li>{username}</li>}
            </For>
          </ul>
        </Show>

        <Show when={!data()?.users?.length}>
          <div>No users found!</div>
        </Show>
      </Suspense>
    </main>
  )
}
