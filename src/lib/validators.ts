import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

const isoDate = z.iso.datetime({ offset: true, local: true });

export const transactionsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
    sort: z.enum(["createdAt", "amount", "riskScore"]).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
    status: z
      .enum(["pending", "completed", "failed", "flagged"])
      .optional(),
    from: isoDate.optional(),
    to: isoDate.optional(),
  })
  .refine((q) => !q.from || !q.to || q.from <= q.to, {
    message: "from must not be after to",
    path: ["from"],
  });

export type TransactionsQuery = z.infer<typeof transactionsQuerySchema>;

export const patchTransactionSchema = z
  .object({
    flagged: z.boolean().optional(),
    flagReason: z.string().min(1).max(500).optional(),
    note: z.string().min(1).max(1000).optional(),
  })
  .strict()
  .refine((b) => b.flagged !== undefined || b.note !== undefined, {
    message: "Provide flagged or note",
  })
  .refine((b) => b.flagged !== true || !!b.flagReason, {
    message: "flagReason is required when flagged is true",
    path: ["flagReason"],
  });

export type PatchTransactionInput = z.infer<typeof patchTransactionSchema>;

/** Parse URLSearchParams into a validated transactions query. */
export function parseTransactionsQuery(params: URLSearchParams) {
  return transactionsQuerySchema.safeParse(
    Object.fromEntries(params.entries()),
  );
}
