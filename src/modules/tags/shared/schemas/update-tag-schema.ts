// filepath: c:\Users\patry\Documents\Projekty\my-prompt-pocket\src\modules\tags\shared\schemas\update-tag-schema.ts
import { z } from "zod";

// Schema for validating tag update requests
export const updateTagSchema = z.object({
  name: z.string().min(1).max(50),
});
