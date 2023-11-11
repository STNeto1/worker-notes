import { createServerAction$, redirect } from "solid-start/server";
import { useUser } from "./useUser";
import { extractFormData } from "~/lib/formData";
import { z } from "zod";
import { FormError } from "solid-start";
import { deleteNote } from "~/db/functions";

const deleteSchema = z.object({
  id: z.string().ulid("ID is not valid"),
  redirect: z.string().optional(),
});

export const useDeleteNote = () =>
  createServerAction$(
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

      if (parseResult.data.redirect) {
        throw redirect(parseResult.data.redirect);
      }
    },
    {
      invalidate: "notes",
    },
  );
