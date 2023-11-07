import { For, Show, Suspense } from "solid-js";
import { Title, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { getConnectionUrl } from "~/lib/getConn";

export function routeData() {
  return createServerData$(async (_, ctx) => {
    // const $users = await db.select().from(user);
    console.log(getConnectionUrl(ctx.env));

    return {
      users: [],
    };
  });
}

export default function Home() {
  const data = useRouteData<typeof routeData>();

  return (
    <main>
      <Title>Notes</Title>
      <h1>Notes App!</h1>

      <Suspense fallback={<div>Loading users...</div>}>
        <Show when={data()?.users?.length}>
          <ul>
            <For each={data()?.users ?? []}>{({ id }) => <li>{id}</li>}</For>
          </ul>
        </Show>

        <Show when={!data()?.users?.length}>
          <div>No users found!</div>
        </Show>
      </Suspense>
    </main>
  );
}
