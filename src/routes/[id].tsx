import { Suspense } from "solid-js";
import { RouteDataArgs, Title, useRouteData } from "solid-start";
import { createServerData$, redirect } from "solid-start/server";
import { z } from "zod";
import { notes } from "~/db/schemas";
import { useUser } from "~/hooks/useUser";
import { getConnection } from "~/lib/getConn";
import { and, eq } from "drizzle-orm";
import { A } from "@solidjs/router";

export function routeData(args: RouteDataArgs) {
  const validPathParams = args.location.pathname
    .split("/")
    .filter((w) => w.length > 5);

  const $note = createServerData$(
    async ([_, $id], ctx) => {
      if (!$id) {
        throw redirect("/404");
      }

      const sessionUser = await useUser(ctx.request);
      if (!sessionUser) {
        throw redirect("/sign-in");
      }

      const [note] = await getConnection(ctx.env)
        .select()
        .from(notes)
        .where(
          and(eq(notes.id, $id), eq(notes.userId, sessionUser.user.userId)),
        )
        .limit(1)
        .execute();

      if (!note) {
        throw redirect("/404");
      }

      return note;
    },
    {
      key: () => ["note", validPathParams.at(0) ?? "invalid"],
    },
  );

  return {
    note: $note,
  };
}

const schema = z.object({
  id: z.string().ulid("ID is not valid"),
  title: z.string().min(1),
  note: z.string().min(1),
});

export default function Note() {
  const data = useRouteData<typeof routeData>();
  return (
    <main>
      <Title>Note - {data?.note()?.id}</Title>
      <h1>Notes App!</h1>
      <A href="/">Home</A>

      <hr />

      <Suspense fallback={<div>Loading note...</div>}>
        <pre>{JSON.stringify(data?.note(), null, 2)}</pre>
      </Suspense>
    </main>
  );
}
