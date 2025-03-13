export interface ConfigStatus {
  notionToken: boolean;
  notionDatabase: boolean;
  githubToken: boolean;
  baseUrl: boolean;
}

export interface ValidationResult {
  success: boolean;
  message: string;
  details?: any;
}

export interface SimilarField {
  expected: string;
  actual: string;
  similarity: number;
}

export interface NotionDatabaseValidateResponse {
  id: string;
  title: string;
  url: string;
  missingFields: {
    fieldName: string;
    description: string;
    expectedType: string;
    expected: string;
    actualName: string;
  }[];
  invalidTypes: {
    fieldName: string;
    expected: string;
    actual: string;
  }[];
  repoOptions?: string[];
  isValid: boolean;
}

export interface GitHubUser {
  login: string;
  name: string | null;
  id: number;
  avatar_url: string;
}

export interface NotionUser {
  id: string;
  name: string;
  avatar_url: string;
  type: string;
}

export interface NotionRepoOption {
  id: string;
  name: string;
  repoFullName: string | null;
  valid: boolean;
  error?: string;
}
