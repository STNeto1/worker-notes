import { For, Show, Suspense, createEffect } from "solid-js";
import { FormError, Title, useRouteData } from "solid-start";
import {
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server";
import { z } from "zod";
import { notes } from "~/db/schemas";
import { useUser } from "~/hooks/useUser";
import { extractFormData } from "~/lib/formData";
import { getConnection } from "~/lib/getConn";
import { A } from "@solidjs/router";
import { deleteNote, getNotes } from "~/db/functions";
import { deleteSchema } from "./[id]";

export function routeData() {
  // const user = createServerData$(
  //   async (_, ctx) => {
  //     const sessionUser = await useUser(ctx.request);
  //     if (!sessionUser) {
  //       throw redirect("/sign-in");
  //     }
  //
  //     return sessionUser;
  //   },
  //   {
  //     key: "user",
  //   },
  // );

  const $notes = createServerData$(
    async (_, ctx) => {
      const sessionUser = await useUser(ctx.request);
      if (!sessionUser) {
        throw redirect("/sign-in");
      }

      return getNotes(ctx.env, sessionUser);
    },
    {
      key: "notes",
    },
  );

  return {
    notes: $notes,
  };
}

const schema = z.object({
  title: z.string().min(1),
  note: z.string().min(1),
});

export default function Home() {
  let titleRef: HTMLInputElement | undefined = undefined;
  let noteRef: HTMLTextAreaElement | undefined = undefined;

  const data = useRouteData<typeof routeData>();

  const [creating, { Form }] = createServerAction$(
    async (formData: FormData, ctx) => {
      const sessionUser = await useUser(ctx.request);
      if (!sessionUser) {
        throw redirect("/sign-in");
      }

      const data = extractFormData(formData);
      const parseResult = schema.safeParse(data);
      if (!parseResult.success) {
        throw new FormError("Invalid form data");
      }

      await getConnection(ctx.env)
        .insert(notes)
        .values({
          userId: sessionUser.user.userId,
          title: parseResult.data.title,
          note: parseResult.data.note,
        })
        .execute();

      return true;
    },
    {
      invalidate: "notes",
    },
  );

  const [deleting, { Form: DeleteForm }] = createServerAction$(
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

      return true;
    },
    {
      invalidate: "notes",
    },
  );

  createEffect(() => {
    if (creating.result && titleRef && noteRef) {
      titleRef.value = "";
      noteRef.value = "";
    }
  });

  return (
    <main>
      <Title>Notes</Title>
      <h1>Notes App!</h1>

      <hr />

      <Show when={creating.error}>
        <div>{creating.error.message}</div>
      </Show>

      <Form>
        <input
          type="text"
          name="title"
          disabled={creating.pending}
          ref={titleRef}
        />
        <textarea name="note" disabled={creating.pending} ref={noteRef} />
        <button type="submit" disabled={creating.pending}>
          Create Note
        </button>
      </Form>

      <Suspense fallback={<div>Loading notes...</div>}>
        <For each={data?.notes()}>
          {(note) => (
            <div
              style={{ display: "flex", "align-items": "center", gap: "2rem" }}
            >
              <h2>{note.title}</h2>
              <p>{note.note}</p>
              <A href={`/${note.id}`}>Access</A>

              <DeleteForm>
                <input type="hidden" name="id" value={note.id} />

                <button type="submit" disabled={deleting.pending}>
                  Delete
                </button>
              </DeleteForm>
            </div>
          )}
        </For>
      </Suspense>
    </main>
  );
}
