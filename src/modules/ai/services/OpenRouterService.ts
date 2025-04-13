import type { Message, ModelInfo, ModelParameters, OpenRouterResponse, ResponseFormat } from "../types/openrouter.types";
import { OpenRouterAuthError, OpenRouterError, OpenRouterNetworkError, OpenRouterRequestError, OpenRouterResponseError } from "../types/openrouter.types";

interface OpenRouterServiceConfig {
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
  defaultSystemMessage?: string;
  defaultParameters?: ModelParameters;
}

export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultModel: string;
  private readonly defaultSystemMessage: string;
  private readonly defaultParameters: ModelParameters;

  constructor(config: OpenRouterServiceConfig = {}) {
    this.apiKey = config.apiKey ?? import.meta.env.OPENROUTER_API_KEY;
    this.baseUrl = config.baseUrl ?? import.meta.env.OPENROUTER_API_BASE_URL ?? "https://openrouter.ai/api/v1";
    this.defaultModel = config.defaultModel ?? "openai/gpt-3.5-turbo";
    this.defaultSystemMessage = config.defaultSystemMessage ?? "";
    this.defaultParameters = {
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      ...config.defaultParameters
    };
  }

  private validateApiKey(): void {
    if (!this.apiKey) {
      throw new OpenRouterAuthError(
        "OpenRouter API key is required",
        "MISSING_API_KEY"
      );
    }
  }

  private buildHeaders(): HeadersInit {
    this.validateApiKey();
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.apiKey}`,
      "HTTP-Referer": "https://github.com/patrykmroz619/my-prompt-pocket", // Optional but recommended
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));

      if (response.status === 401 || response.status === 403) {
        throw new OpenRouterAuthError(
          error.error || "Authentication failed",
          "AUTH_ERROR"
        );
      }

      if (response.status === 400) {
        throw new OpenRouterRequestError(
          error.error || "Invalid request",
          "INVALID_REQUEST"
        );
      }

      throw new OpenRouterResponseError(
        error.error || `HTTP error ${response.status}`,
        `HTTP_${response.status}`
      );
    }

    try {
      return await response.json();
    } catch (error) {
      throw new OpenRouterResponseError(
        "Failed to parse response",
        "PARSE_ERROR",
        error as Error
      );
    }
  }

  private buildRequestPayload(
    userMessage: string | string[],
    systemMessage?: string,
    model?: string,
    responseFormat?: ResponseFormat,
    parameters?: ModelParameters,
    messageHistory?: Message[]
  ): Record<string, any> {
    const messages: Message[] = [];

    // Add system message if provided
    if (systemMessage || this.defaultSystemMessage) {
      messages.push({
        role: "system",
        content: systemMessage ?? this.defaultSystemMessage
      });
    }

    // Add message history if provided
    if (messageHistory?.length) {
      messages.push(...messageHistory);
    }

    // Add user message(s)
    if (Array.isArray(userMessage)) {
      messages.push(...userMessage.map(content => ({ role: "user" as const, content })));
    } else {
      messages.push({ role: "user" as const, content: userMessage });
    }

    return {
      model: model ?? this.defaultModel,
      messages,
      ...(responseFormat && { response_format: responseFormat }),
      ...this.defaultParameters,
      ...parameters
    };
  }

  async sendMessage({
    userMessage,
    systemMessage,
    model,
    responseFormat,
    parameters,
    messageHistory,
  }: {
    userMessage: string | string[];
    systemMessage?: string;
    model?: string;
    responseFormat?: ResponseFormat;
    parameters?: ModelParameters;
    messageHistory?: Message[];
  }): Promise<OpenRouterResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: this.buildHeaders(),
        body: JSON.stringify(
          this.buildRequestPayload(
            userMessage,
            systemMessage,
            model,
            responseFormat,
            parameters,
            messageHistory
          )
        ),
      });

      return await this.handleResponse<OpenRouterResponse>(response);
    } catch (error) {
      if (error instanceof OpenRouterError) {
        throw error;
      }

      throw new OpenRouterNetworkError(
        "Failed to send message",
        "NETWORK_ERROR",
        error as Error
      );
    }
  }

  async listAvailableModels(): Promise<ModelInfo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: this.buildHeaders(),
      });

      return await this.handleResponse<ModelInfo[]>(response);
    } catch (error) {
      if (error instanceof OpenRouterError) {
        throw error;
      }

      throw new OpenRouterNetworkError(
        "Failed to fetch models",
        "NETWORK_ERROR",
        error as Error
      );
    }
  }
}
