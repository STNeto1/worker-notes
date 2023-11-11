import { Suspense } from "solid-js";
import { FormError, RouteDataArgs, Title, useRouteData } from "solid-start";
import {
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server";
import { z } from "zod";
import { notes } from "~/db/schemas";
import { useUser } from "~/hooks/useUser";
import { getConnection } from "~/lib/getConn";
import { and, eq } from "drizzle-orm";
import { A } from "@solidjs/router";
import { extractFormData } from "~/lib/formData";
import { deleteNote } from "~/db/functions";

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

export const deleteSchema = z.object({
  id: z.string().ulid("ID is not valid"),
});

export default function Note() {
  const data = useRouteData<typeof routeData>();

  const [deleting, { Form }] = createServerAction$(
    async (formData: FormData, ctx) => {
      const sessionUser = await useUser(ctx.request);
      if (!sessionUser) {
        throw redirect("/sign-in");
      }

      const data = extractFormData(formData);
      const parseResult = deleteSchema.safeParse(data);
      if (!parseResult.success) {
        throw new FormError("Invalid form data");
      }

      const result = await deleteNote(
        ctx.env,
        sessionUser,
        parseResult.data.id,
      );

      if (result.rowsAffected !== 1) {
        throw new FormError("Failed to delete note");
      }

      throw redirect("/");
    },
    {
      invalidate: "notes",
    },
  );

  return (
    <main>
      <Title>Note - {data?.note()?.id}</Title>
      <h1>Notes App!</h1>
      <A href="/">Home</A>

      <hr />

      <Suspense fallback={<div>Loading note...</div>}>
        <>
          <pre>{JSON.stringify(data?.note(), null, 2)}</pre>

          <Form>
            <input type="hidden" name="id" value={data?.note()?.id} />

            <button type="submit" disabled={deleting.pending}>
              Delete
            </button>
          </Form>
        </>
      </Suspense>
    </main>
  );
}
