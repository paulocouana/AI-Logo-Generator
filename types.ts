
export interface LogoGenerationParams {
  prompt: string;
  companyName: string;
  baseImage?: {
    mimeType: string;
    data: string; // base64 encoded string
  };
}

export interface LogoGenerationResult {
  imageUrl: string;
  text: string;
}
