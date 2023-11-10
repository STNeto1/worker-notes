import {
  mysqlTable,
  bigint,
  varchar,
  text,
  timestamp,
} from "drizzle-orm/mysql-core";
import { ulid } from "ulid";

export const user = mysqlTable("auth_user", {
  id: varchar("id", {
    length: 15, // change this when using custom user ids
  }).primaryKey(),
  username: varchar("username", {
    length: 255,
  }),
});

export const key = mysqlTable("user_key", {
  id: varchar("id", {
    length: 255,
  }).primaryKey(),
  userId: varchar("user_id", {
    length: 15,
  }).notNull(),
  hashedPassword: varchar("hashed_password", {
    length: 255,
  }),
});

export const session = mysqlTable("user_session", {
  id: varchar("id", {
    length: 128,
  }).primaryKey(),
  userId: varchar("user_id", {
    length: 15,
  }).notNull(),
  activeExpires: bigint("active_expires", {
    mode: "number",
  }).notNull(),
  idleExpires: bigint("idle_expires", {
    mode: "number",
  }).notNull(),
});

export const notes = mysqlTable("user_notes", {
  id: varchar("id", {
    length: 26,
  })
    .primaryKey()
    .$defaultFn(() => ulid()),
  userId: varchar("user_id", {
    length: 15,
  }).notNull(),
  title: varchar("title", {
    length: 255,
  }).notNull(),
  note: text("note", {}).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
