/**
 * SambaNova AI Provider with API Key Rotation
 *
 * Uses SambaNova's Llama-4-Maverick vision model for image analysis.
 * Supports multiple API keys to avoid rate limits by rotating between them.
 *
 * Environment variables:
 * - SAMBANOVA_AI_MODEL (optional, default: Llama-4-Maverick-17B-128E-Instruct)
 * - SAMBANOVA_API_KEY (required)
 * - SAMBANOVA_API_KEY_2 (optional)
 * - Add more keys as SAMBANOVA_API_KEY_3, etc.
 */

import { createSambaNova } from 'sambanova-ai-provider';
import { generateText } from 'ai';
import { BaseAIProvider, AnalysisResult, ProviderConfig } from './base';

export class SambaNovaProvider extends BaseAIProvider {
  private apiKeys: string[];
  private currentKeyIndex: number = 0;
  private providers: Array<ReturnType<typeof createSambaNova>>;

  constructor(model: string = 'Llama-4-Maverick-17B-128E-Instruct') {
    model = process.env.SAMBANOVA_AI_MODEL || model;
    super({
      name: 'SambaNova',
      model,
      enabled: true,
    });

    // Collect all available API keys
    this.apiKeys = this.collectApiKeys();

    // Create a provider instance for each API key
    this.providers = this.apiKeys.map(apiKey =>
      createSambaNova({ apiKey })
    );

    console.log(`[${this.getName()}] Initialized with ${this.apiKeys.length} API key(s)`);
  }

  /**
   * Collect all SambaNova API keys from environment variables
   */
  private collectApiKeys(): string[] {
    const keys: string[] = [];

    // Primary key
    if (process.env.SAMBANOVA_API_KEY) {
      keys.push(process.env.SAMBANOVA_API_KEY);
    }

    // Secondary keys (SAMBANOVA_API_KEY_2, SAMBANOVA_API_KEY_3, etc.)
    let i = 2;
    while (true) {
      const key = process.env[`SAMBANOVA_API_KEY_${i}`];
      if (key) {
        keys.push(key);
        i++;
      } else {
        break;
      }
    }

    return keys;
  }

  /**
   * Get the next API key and provider in rotation
   */
  private rotateKey(): ReturnType<typeof createSambaNova> {
    const provider = this.providers[this.currentKeyIndex];
    const keyPreview = this.apiKeys[this.currentKeyIndex].substring(0, 8) + '...';

    console.log(`[${this.getName()}] Using API key ${this.currentKeyIndex + 1}/${this.apiKeys.length} (${keyPreview})`);

    // Move to next key for next request
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.providers.length;

    return provider;
  }

  isConfigured(): boolean {
    return this.apiKeys.length > 0;
  }

  async analyzeImage(imageData: string): Promise<AnalysisResult> {
    if (!this.isConfigured()) {
      throw new Error('SambaNova API key not configured. Set SAMBANOVA_API_KEY in .env.local');
    }

    try {
      console.log(`[${this.getName()}] Analyzing image with model ${this.getModel()}`);

      const imageInput = this.convertImageData(imageData);
      const prompt = this.getPrompt();

      // Get the next provider in rotation
      const provider = this.rotateKey();

      const { text } = await generateText({
        model: provider(this.config.model),
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                image: imageInput,
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
        temperature: 0.3,
      });

      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from response');
      }

      const result = JSON.parse(jsonMatch[0]);
      const validatedResult = this.validateResult(result);

      console.log(`[${this.getName()}] Analysis complete:`, {
        status: validatedResult.status,
        capacity: validatedResult.capacity,
        confidence: validatedResult.confidence,
      });

      return validatedResult;
    } catch (error) {
      console.error(`[${this.getName()}] Analysis failed:`, error);
      throw new Error(
        `SambaNova analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
