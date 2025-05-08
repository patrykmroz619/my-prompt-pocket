import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";

export interface ITextCompletionParams {
  messages: ChatCompletionMessageParam[];
  model: string;
}
