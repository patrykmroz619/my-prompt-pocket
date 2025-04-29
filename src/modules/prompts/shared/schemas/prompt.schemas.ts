import { z } from "zod";

// Schema for validating GET /api/prompts query parameters
export const PromptFilterParamsSchema = z.object({
  search: z.string().optional(),
  tags: z
    .string()
    .optional()
    .refine((val) => !val || val.split(",").every((tag) => z.string().uuid().safeParse(tag).success), {
      message: "Tags must be a comma-separated list of valid UUIDs.",
    })
    .transform((val) => val?.split(",").filter(Boolean) ?? []), // Transform to array of UUIDs
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(20),
  sort_by: z.enum(["name", "created_at", "updated_at"]).default("updated_at"),
  sort_dir: z.enum(["asc", "desc"]).default("desc"),
});

export type ValidatedPromptFilterParams = z.infer<typeof PromptFilterParamsSchema>;
