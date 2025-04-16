# Authentication Flow Diagram Generation

You are a security specialist tasked with creating a Mermaid diagram to visualize the authentication flow for the login and registration module. The diagram should be created in the following file: DESTINATION

You will need to refer to the following files to understand existing requirements:

<file_references>
[project-prd.md](docs/prd.md)
</file_references>

<destination>
docs/diagrams/auth.md
</destination>

Your task is to analyze the login and registration module specification and create a comprehensive Mermaid diagram that accurately represents the authentication sequence. The diagram should be in English.

Before creating the diagram, analyze the requirements and plan your approach. Place your analysis inside <authentication_analysis> tags. In this analysis:

1. List all authentication flows mentioned in the reference files.
2. Identify main actors and their interactions.
3. Define token verification and refresh processes.
4. Provide a brief description of each authentication step.

When you are ready to create the diagram, follow these guidelines:

1. Start the diagram with the following syntax:

   ```mermaid
   sequenceDiagram
   ```

2. Include the following elements in your diagram:

   - The full lifecycle of the authentication process in a modern application using React, Astro, and Supabase Auth
   - Communication between actors: 1) Browser 2) Middleware 3) Astro API 4) Supabase Auth
   - Clear points where user redirection or token verification occurs
   - Data flow after implementing new authentication requirements
   - How the user session works after login and how the system reacts to token expiration
   - The token refresh process and protection against unauthorized access

3. Adhere to these Mermaid syntax rules:

   - Use the `autonumber` attribute for clarity in step sequences
   - Maintain consistent spacing between elements for diagram readability
   - Always use `participant` to declare actors before starting the sequence
   - Ensure the correct order of elements in the sequence (sender, arrow, receiver)
   - Use proper activation and deactivation cycles in the diagram:
     ```
     activate Browser
     Browser->>API: Request data
     deactivate Browser
     ```
   - Use appropriate arrow types:
     - `->` for regular arrows (e.g., `Browser->API`)
     - `-->` for dashed arrows (e.g., `API-->Browser: Token expired`)
     - `->>` for open-headed arrows (e.g., `Browser->>Auth: Login request`)
     - `-->>` for dashed open-headed arrows
   - For conditional paths, use `alt`/`else`/`end`:
     ```
     alt Authentication successful
       Browser->>Dashboard: Redirect to dashboard
     else Authentication failed
       Browser->>LoginPage: Show error message
     end
     ```
   - For parallel actions, use `par`/`and`/`end`:
     ```
     par Send confirmation email
       API->>EmailService: Send verification
     and Update user status
       API->>Database: Update status
     end
     ```
   - For multi-line notes, use the correct syntax:
     ```
     Note over Browser,API: This text will appear
     in a note spanning both elements
     ```
   - DO NOT exceed 80 characters in a single line of Mermaid code
   - DO NOT include URLs, endpoint addresses, brackets, long function names, or complex expressions in diagram names:
     BAD: [Home Page<br/>(Rule Builder)]
     GOOD: [Rule Builder]
   - Use consistent naming throughout the document

4. Avoid these common mistakes:
   - Missing the Mermaid section declaration and diagram type at the beginning
   - Incorrect arrow syntax (e.g., -> instead of ->>)
   - Using invalid characters in identifiers without enclosing them in quotes
   - Unbalanced code blocks (missing `end` for started blocks)
   - Exceeding line length limits
   - Incorrect nesting of conditional blocks

After creating the diagram, review it thoroughly to ensure there are no syntax errors or rendering issues. Make necessary adjustments to improve clarity and accuracy.

When you are ready to present the final diagram, enclose it within <mermaid_diagram> tags.
