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
  similarity: string;
}

export interface NotionDatabase {
  id: string;
  title: string;
  url: string;
  missingFields: Array<{ name: string; description: string }>;
  invalidTypes: Array<{ name: string; expected: string; actual: string }>;
  similarFields?: Array<SimilarField>;
  isValid: boolean;
}

export interface GitHubUser {
  login: string;
  name: string;
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
  name: string;
  isValid: boolean;
  hasIssues?: boolean;
  canCreateIssues?: boolean;
  canEditIssues?: boolean;
  url?: string;
  description?: string;
  error?: string;
  id?: number;
  permission?: string;
  private?: boolean;
  owner?: {
    login: string;
    avatar_url: string;
  };
}
