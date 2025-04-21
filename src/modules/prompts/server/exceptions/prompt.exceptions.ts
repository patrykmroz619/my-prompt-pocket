export class PromptCreationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PromptCreationError";
  }
}

export class PromptNameConflictError extends Error {
  constructor() {
    super("Prompt with this name already exists");
    this.name = "PromptNameConflictError";
  }
}

export class MissingParameterDefinitionsError extends Error {
  constructor(parameters: string[]) {
    super("Parameters found in content but no parameter definitions provided");
    this.name = "MissingParameterDefinitionsError";
    this.parameters = parameters;
  }

  parameters: string[];
}

export class UndefinedParametersError extends Error {
  constructor(missingParameters: string[]) {
    super("Some parameters in content have no type definitions");
    this.name = "UndefinedParametersError";
    this.missingParameters = missingParameters;
  }

  missingParameters: string[];
}
