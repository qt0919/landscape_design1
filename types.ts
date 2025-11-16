export interface ImageState {
  base64: string;
  mimeType: string;
}

export interface Plant {
  name: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface DesignHistoryItem {
  id: number;
  originalImage: ImageState;
  prompt: string;
  generatedImage: ImageState;
}

export interface DesignSession {
  id: number;
  baseImage: ImageState;
  history: DesignHistoryItem[];
}
