import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull().default(""),
    phone: text("phone").notNull().default(""),
    selectedPlan: text("selected_plan"),
    paymentStatus: text("payment_status").notNull().default("not_paid"),
    accessGranted: integer("access_granted", { mode: "boolean" })
      .notNull()
      .default(false),
    accessGrantedAt: text("access_granted_at"),
    accessExpiresAt: text("access_expires_at"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_users_email").on(table.email),
    index("idx_users_payment_status").on(table.paymentStatus),
  ],
);

export const paymentRequests = sqliteTable(
  "payment_requests",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    planId: text("plan_id").notNull(),
    amount: integer("amount").notNull(),
    status: text("status").notNull().default("pending"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_payment_requests_user_id").on(table.userId),
    index("idx_payment_requests_status").on(table.status),
  ],
);
