import { z } from "zod";

// Schema for validating tag ID as UUID
export const tagIdSchema = z.string().uuid("Tag ID must be a valid UUID");
