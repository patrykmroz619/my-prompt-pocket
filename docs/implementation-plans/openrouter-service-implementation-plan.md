# OpenRouter Service Implementation Plan

## Service Description

The OpenRouterService is designed to interact with OpenRouter's API, providing a unified interface for communicating with various LLM providers (OpenAI, Anthropic, Google, etc.). This service will handle requests to AI models, manage authentication, format responses, and handle errors appropriately within the My Prompt Pocket application.

## Implementation Architecture

### Directory Structure

```
/src
  /modules
    /ai
      /services
        OpenRouterService.ts
      /types
        openrouter.types.ts
      /utils
        openrouter-error-handler.ts
        openrouter-response-formatter.ts
```

## Constructor Description

The `OpenRouterService` class should be initialized with the following parameters:

```typescript
constructor({
  apiKey?: string,           // OpenRouter API key (falls back to env var if not provided)
  baseUrl?: string,          // OpenRouter API base URL (defaults to env var or standard URL)
  defaultModel?: string,     // Default model to use (e.g., "openai/gpt-3.5-turbo")
  defaultSystemMessage?: string, // Default system message for all conversations
  defaultParameters?: {      // Default parameters for model requests
    temperature?: number,    // Controls randomness (0-1)
    max_tokens?: number,     // Maximum tokens in response
    top_p?: number,          // Nucleus sampling parameter
    // ... other parameters
  }
})
```

## Public Methods and Fields

### 1. `sendMessage`

```typescript
async sendMessage({
  userMessage: string | string[],              // User's input message(s)
  systemMessage?: string,                      // Override default system message
  model?: string,                              // Override default model
  responseFormat?: ResponseFormat,             // Structured response format
  parameters?: ModelParameters,                // Override default parameters
  messageHistory?: Message[],                  // Previous conversation messages
}): Promise<OpenRouterResponse>
```

### 2. `listAvailableModels`

```typescript
async listAvailableModels(): Promise<ModelInfo[]>
```

## Private Methods and Fields

### 1. `buildRequestPayload`

Constructs the request payload for the OpenRouter API, handling proper formatting of messages, parameters, and response format.

### 2. `handleResponse`

Processes API responses, extracts relevant data, and formats it for application use.

### 3. `validateApiKey`

Ensures the API key is valid and available.

### 4. `buildHeaders`

Creates necessary headers for API requests.

## Types Definition

### Key Types

```typescript
// Request types
interface Message {
  role: "user" | "assistant" | "system";
  content: string | MessageContent[];
}

interface MessageContent {
  type: "text" | "image_url";
  text?: string;
  image_url?: {
    url: string;
    detail?: "low" | "high";
  };
}

interface ResponseFormat {
  type: "json_schema";
  json_schema: {
    name: string;
    strict: boolean;
    schema: Record<string, any>;
  };
}

interface ModelParameters {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
}

// Response types
interface OpenRouterResponse {
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
```

## Error Handling

### Error Categories

1. **Authentication Errors**

   - Invalid/missing API key
   - API key rate limits exceeded

2. **Request Format Errors**

   - Malformed request payload
   - Invalid parameters
   - Unsupported model specified

3. **Response Handling Errors**

   - Model timeout
   - Parsing errors
   - Unexpected response format

4. **Network Errors**
   - Connection failures
   - Timeouts
   - Service unavailability

### Error Handling Strategy

Implement a custom error class hierarchy:

```typescript
class OpenRouterError extends Error {
  constructor(
    message: string,
    public code: string,
    public cause?: Error
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

class OpenRouterAuthError extends OpenRouterError {}
class OpenRouterRequestError extends OpenRouterError {}
class OpenRouterResponseError extends OpenRouterError {}
class OpenRouterNetworkError extends OpenRouterError {}
```

Provide detailed error objects with:

- Error message (human-readable)
- Error code (for programmatic handling)
- Original cause (when applicable)
- Recovery suggestions
- Logging information

## Security Considerations

1. **API Key Management**

   - Never expose API key in client-side code
   - Store API key in environment variables
   - Consider implementing a server-side proxy for API requests

2. **Content Filtering**

   - Implement content filtering for user inputs
   - Handle potential harmful outputs from models

3. **Rate Limiting**

   - Implement client-side rate limiting to prevent accidental abuse
   - Monitor API usage to stay within budget constraints

4. **Sensitive Data Handling**
   - Avoid sending sensitive information to models
   - Implement data sanitization for inputs

## Step-by-Step Implementation Plan

### 1. Set Up Environment Variables

1. Create environment variables for OpenRouter API key and base URL
2. Set up environment variable loading in the application

### 2. Create Types

1. Define interfaces for request/response objects
2. Create type definitions for model parameters and response formats

### 3. Implement Core Service

1. Create the OpenRouterService class with constructor
2. Implement authentication handling
3. Add basic request/response handling

### 4. Implement Error Handling

1. Create error classes
2. Implement error handling utilities
3. Add try/catch blocks with appropriate error handling

### 5. Implement Message Sending Logic

Develop the main functionality for sending messages to the OpenRouter API, including:

1. Request payload construction
2. Headers management
3. Response handling
4. Error handling for API responses

### 6. Add Support for Structured Responses

1. Implement JSON schema response format handling
2. Add validation for returned structured responses

### 7. Implement Model Listing

1. Add method to retrieve available models
2. Include model metadata and capabilities

### 8. Add Unit Tests

1. Create tests for service functionality
2. Mock API responses for testing
3. Test error handling scenarios

### 9. Document the Service

1. Add JSDoc comments to methods and properties
2. Document error handling approaches
3. Provide clear documentation for the service API

## Conclusion

The OpenRouterService provides a robust interface for interacting with various LLM providers through the OpenRouter API. By following this implementation plan, you'll create a service that handles authentication, request formatting, response parsing, and error management, making it easy to integrate AI capabilities into the My Prompt Pocket application.
