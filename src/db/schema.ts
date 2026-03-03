import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";

export const newsletters = pgTable(
  "newsletters",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id").notNull(),
    userId: uuid("user_id").notNull(),
    title: text("title").notNull(),
    status: text("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_newsletters_org").on(table.orgId),
    index("idx_newsletters_status").on(table.status),
  ]
);

export type Newsletter = typeof newsletters.$inferSelect;
export type NewNewsletter = typeof newsletters.$inferInsert;
