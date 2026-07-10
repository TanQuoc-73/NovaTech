export type AiChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type AiChatRequest = {
  messages: AiChatMessage[];
};

export type AiChatResponse = {
  reply: string;
};

export type AiEmbeddingRequest = {
  productId: string;
};

export type AiEmbeddingResponse = {
  success: boolean;
  productId: string;
};

export type AiSearchRequest = {
  query: string;
  limit?: number;
};

export type AiSearchResult = {
  productId: string;
  productName: string;
  score: number;
};

export type AiSearchResponse = {
  results: AiSearchResult[];
};
