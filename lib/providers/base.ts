/**
 * Base Provider Interface
 *
 * All AI providers must implement this interface to ensure compatibility
 * with the image analysis system.
 */

export type CongestionStatus = 'empty' | 'few people' | 'moderate' | 'full';

export interface AnalysisResult {
  status: CongestionStatus;
  capacity: number;
  confidence: number;
  reasoning: string;
}

export interface ProviderConfig {
  name: string;
  model: string;
  enabled: boolean;
}

export abstract class BaseAIProvider {
  protected config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  /**
   * Get provider name
   */
  getName(): string {
    return this.config.name;
  }

  /**
   * Get model name
   */
  getModel(): string {
    return this.config.model;
  }

  /**
   * Check if provider is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Check if provider credentials are configured
   */
  abstract isConfigured(): boolean;

  /**
   * Analyze image and return carriage congestion data
   *
   * @param imageData - Base64 data URL or regular URL to image
   * @returns Analysis result with status, capacity, confidence, and reasoning
   * @throws Error if analysis fails
   */
  abstract analyzeImage(imageData: string): Promise<AnalysisResult>;

  /**
   * Validate and normalize analysis result
   */
  protected validateResult(result: any): AnalysisResult {
    const validStatuses: CongestionStatus[] = ['empty', 'few people', 'moderate', 'full'];

    return {
      status: validStatuses.includes(result.status) ? result.status : 'moderate',
      capacity: Math.min(150, Math.max(0, result.capacity || 50)),
      confidence: Math.min(100, Math.max(0, result.confidence || 70)),
      reasoning: result.reasoning || 'Analysis completed',
    };
  }

  /**
   * Convert image data to appropriate format for the provider
   */
  protected convertImageData(imageData: string): URL | Uint8Array {
    if (imageData.startsWith('data:')) {
      // Convert base64 to Uint8Array
      const base64Data = imageData.split(',')[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } else {
      return new URL(imageData);
    }
  }

  /**
   * Generate the analysis prompt
   */
  protected getPrompt(): string {
    return `You are an AI assistant analyzing train carriage occupancy. Analyze this image and determine:

1. The congestion status (choose ONE):
   - "empty": 0-25% capacity, very few or no people visible
   - "few people": 25-50% capacity, some people but plenty of space
   - "moderate": 50-85% capacity, many people but still some standing room
   - "full": 85-100%+ capacity, crowded with little to no space

2. Estimate the capacity percentage (0-150%, where >100% means over capacity)

3. Your confidence level (0-100%)

4. Brief reasoning for your assessment

Respond ONLY with a JSON object in this exact format:
{
  "status": "empty|few people|moderate|full",
  "capacity": <number 0-150>,
  "confidence": <number 0-100>,
  "reasoning": "<brief explanation>"
}`;
  }
}
