# API Endpoint Implementation Plan: POST /api/prompts/improve

## 1. Endpoint Overview

This endpoint allows users to get AI-generated improvement suggestions for their prompts. It leverages the Openrouter.ai service to access various AI models that can analyze and enhance prompt content, providing both improved text and an explanation of the changes.

## 2. Request Details

- **HTTP Method**: POST
- **URL Structure**: `/api/prompts/improve`
- **Parameters**:
  - **Required**:
    - `content`: The prompt content to be improved
  - **Optional**:
    - `instruction`: Specific instructions for the AI on how to improve the prompt
- **Request Body Format**:

```json
{
  "content": "Write a prompt that summarizes text effectively",
  "instruction": "Focus on making it more specific and less ambiguous"
}
```

## 3. Types Used

The implementation will use the existing DTOs from the types.ts file:

- **PromptImprovementCommand**: For the request payload
- **PromptImprovementDto**: For the response payload

## 4. Response Details

- **Success Response**:
  - **Status Code**: 200 OK
  - **Body Format**:

```json
{
  "improved_content": "Analyze the provided text and create a concise summary that maintains all key points while reducing length by 70%. Focus on extracting main arguments, facts, and conclusions while preserving the original meaning and tone.",
  "explanation": "The improved prompt is more specific by requesting a 70% length reduction, clarifies what elements should be preserved (key points, main arguments, facts, conclusions), and mentions maintaining the original meaning and tone. This removes ambiguity about what kind of summary is desired."
}
```

- **Error Responses**:
  - **400 Bad Request**: When the prompt content is missing or invalid
  - **429 Too Many Requests**: When AI service rate limits are exceeded
  - **500 Internal Server Error**: For unexpected server-side errors

## 5. Data Flow

1. Client sends a POST request with prompt content and optional instructions
2. Server validates the request input
3. Server prepares a request to Openrouter.ai, constructing an appropriate system message and user message
4. Server calls Openrouter.ai API to get improvement suggestions
5. Server processes the AI response and formats it according to the expected DTO
6. Server returns the structured response to the client

## 6. Security Considerations

- **Input Validation**: Strict validation of input parameters to prevent injection attacks
- **Rate Limiting**: Implement rate limiting to prevent abuse and manage AI service costs
- **Authentication**: Ensure the endpoint is protected by authentication middleware
- **Content Filtering**: Consider implementing content filtering to prevent misuse of the AI for generating harmful content
- **API Key Security**: Store Openrouter.ai API keys securely using environment variables

## 7. Error Handling

- **Invalid Input**:
  - Missing content: 400 Bad Request with message "Prompt content is required"
  - Content too long: 400 Bad Request with message "Prompt content exceeds maximum length"
- **AI Service Issues**:
  - Rate limit exceeded: 429 Too Many Requests with message "AI request rate limit exceeded. Please try again later."
  - AI service unavailable: 503 Service Unavailable with message "AI service is currently unavailable. Please try again later."
- **Server Errors**:
  - Unexpected errors: 500 Internal Server Error with a generic message

## 8. Performance Considerations

- **Timeout Handling**: Implement appropriate timeouts for AI service calls
- **Caching**: Consider caching improvement results for identical inputs to reduce API calls
- **Asynchronous Processing**: Use asynchronous processing for the AI service calls
- **Request Throttling**: Implement throttling to manage load on the AI service

## 9. Implementation Steps

### Server-Side Implementation

1. Create an AI service module in `src/modules/prompts/server/services/ai-service.ts`

   - Implement a service that interfaces with Openrouter.ai
   - Include methods for prompt improvement

2. Create the endpoint handler in `src/modules/prompts/server/endpoints/improve-prompt.ts`

   - Implement validation logic
   - Call the AI service
   - Format and return the response

3. Register the endpoint in the Astro API routes
   - Create `src/pages/api/prompts/improve.ts` file
   - Import and use the handler from the server module

### Client-Side Implementation

4. Create API client methods in `src/modules/prompts/client/services/prompts-api.ts`

   - Implement a method to call the improve endpoint
   - Handle error states and loading states

5. Create a React component for prompt improvement in `src/modules/prompts/client/components/PromptImprover.tsx`
   - Form for submitting content and instructions
   - Display for improvement results
   - Loading and error states

### Testing

6. Create unit tests for the AI service
7. Create integration tests for the endpoint
8. Create end-to-end tests for the entire feature

### Documentation

9. Update API documentation to include the new endpoint
10. Add examples for common use cases

## 10. Dependencies

- **External Services**: Openrouter.ai for AI model access
- **Libraries/Packages**:
  - HTTP client library (e.g., fetch or axios)
  - Validation library (e.g., zod)
  - Rate limiting middleware
