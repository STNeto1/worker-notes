import { getConnection } from "~/lib/getConn";
import { notes } from "./schemas";
import { Session } from "lucia";
import { and, desc, eq } from "drizzle-orm";

export const getNotes = async (env: Env, session: Session) =>
  getConnection(env)
    .select()
    .from(notes)
    .where(eq(notes.userId, session.user.userId))
    .orderBy(desc(notes.createdAt));

export const deleteNote = async (env: Env, session: Session, id: string) =>
  getConnection(env)
    .delete(notes)
    .where(and(eq(notes.userId, session.user.userId), eq(notes.id, id)))
    .execute();
