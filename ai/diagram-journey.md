# Journey Flow Diagram Generation

You are a UX specialist tasked with creating a Mermaid diagram to visualize the user journey for the login and registration module. The diagram should be created in the following file: DESTINATION

You will need to refer to the following files to understand existing requirements:

<file_references>
[project-prd.md](docs/prd.md)
</file_references>

<destination>
docs/diagrams/journey.md
</destination>

Your task is to analyze the login and registration module specification and create a comprehensive Mermaid diagram that accurately represents the user journey. The diagram should be in English.

Before creating the diagram, analyze the requirements and plan your approach. Place your analysis inside <user_journey_analysis> tags. In this analysis:

1. List all user paths mentioned in the reference files.
2. Identify main journeys and their corresponding states.
3. Define decision points and alternative paths.
4. Provide a brief description of each state's purpose.

When you are ready to create the diagram, follow these guidelines:

1. Start the diagram with the following syntax:

   ```mermaid
   stateDiagram-v2
   ```

2. Include the following elements in your diagram:

   - User paths based on existing requirements
   - Using the application as an unauthenticated user
   - Accessing the main functionality of the application
   - Logging in
   - Creating an account
   - Recovering a password
   - High-level user journey aligned with project requirements and USER STORIES
   - Decision points and alternative paths
   - Flow after email verification
   - Focus on business paths rather than technical aspects

3. Follow these Mermaid syntax rules:

   - Initial and final states must be correctly defined:
     ```
     [*] --> HomePage
     HomePage --> [*]
     ```
   - Use composite states to group related states:
     ```
     state "Registration Process" as Registration {
       [*] --> RegistrationForm
       RegistrationForm --> DataValidation
       DataValidation --> EmailSending
     }
     ```
   - For decision branches, use the correct syntax:
     ```
     state if_verification <<choice>>
     TokenVerification --> if_verification
     if_verification --> TokenValid: Token OK
     if_verification --> TokenInvalid: Invalid Token
     ```
   - Use notes for additional information:
     ```
     LoginForm: User can log in
     note right of LoginForm
       The form contains email and password fields
       and a link to recover the password
     end note
     ```
   - For parallel states, use the correct syntax:

     ```
     state fork_state <<fork>>
     state join_state <<join>>

     Registration --> fork_state
     fork_state --> EmailSending
     fork_state --> DatabaseUpdate
     EmailSending --> join_state
     DatabaseUpdate --> join_state
     join_state --> FinalState
     ```

   - Use namespaces to organize complex diagrams:
     ```
     state "Authentication" as Authentication {
       state "Login" as Login {
         // states for the login process
       }
       state "Registration" as Registration {
         // states for the registration process
       }
     }
     ```
   - For state history, use the correct syntax:
     ```
     state "User Panel" as Panel {
       [*] --> history
       state history <<history>>
     }
     ```
   - For transitions with events and conditions, use the correct syntax:
     ```
     StateA --> StateB: Next Button [data valid]
     ```
   - Avoid using URLs, endpoint addresses, brackets, long function names, or complex expressions in state names:
     BAD: [Home Page<br/>(Rule Creator)]
     GOOD: [Rule Creator]
   - Use consistent naming throughout the document
   - Avoid long labels that may cause rendering issues

4. Avoid these common mistakes:
   - Missing Mermaid section declaration and diagram type at the beginning
   - Incorrect decision states (missing choice, fork, join)
   - Missing initial and final states ([*])
   - Inconsistent state naming
   - Unclosed nested states (missing closing curly brace)
   - Overly complex diagrams without proper state grouping
   - Incorrect transition labels
   - Exceeding line length limits
   - Missing blank lines before and after the Mermaid code block

After creating the diagram, review it thoroughly to ensure there are no syntax errors or rendering issues. Make necessary adjustments to improve clarity and accuracy.

When you are ready to present the final diagram, use <mermaid_diagram> tags to enclose it.
