import { z } from "zod";

// Schema for validating tag creation requests
export const createTagSchema = z.object({
  name: z.string().min(1).max(50),
});
