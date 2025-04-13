export type Role = "user" | "assistant" | "system";

export interface MessageContent {
  type: "text" | "image_url";
  text?: string;
  image_url?: {
    url: string;
    detail?: "low" | "high";
  };
}

export interface Message {
  role: Role;
  content: string | MessageContent[];
}

export interface ResponseFormat {
  type: "json_schema";
  json_schema: {
    name: string;
    strict: boolean;
    schema: Record<string, any>;
  };
}

export interface ModelParameters {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
}

export interface OpenRouterResponse {
  id: string;
  model: string;
  created: number;
  object: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: Array<{
    message: Message;
    index: number;
    finish_reason: string | null;
  }>;
}

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing: {
    prompt: number;
    completion: number;
  };
}

export class OpenRouterError extends Error {
  constructor(
    message: string,
    public code: string,
    public override cause?: Error
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

export class OpenRouterAuthError extends OpenRouterError {}
export class OpenRouterRequestError extends OpenRouterError {}
export class OpenRouterResponseError extends OpenRouterError {}
export class OpenRouterNetworkError extends OpenRouterError {}
