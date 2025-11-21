/**
 * SambaNova AI Provider
 *
 * Uses SambaNova's Llama-4-Maverick vision model for image analysis.
 * Requires SAMBANOVA_API_KEY environment variable.
 */

import { createSambaNova } from 'sambanova-ai-provider';
import { generateText } from 'ai';
import { BaseAIProvider, AnalysisResult, ProviderConfig } from './base';

export class SambaNovaProvider extends BaseAIProvider {
  private provider: ReturnType<typeof createSambaNova>;

  constructor(model: string = 'Llama-4-Maverick-17B-128E-Instruct') {
    super({
      name: 'SambaNova',
      model,
      enabled: true,
    });

    this.provider = createSambaNova({
      apiKey: process.env.SAMBANOVA_API_KEY,
    });
  }

  isConfigured(): boolean {
    return !!process.env.SAMBANOVA_API_KEY;
  }

  async analyzeImage(imageData: string): Promise<AnalysisResult> {
    if (!this.isConfigured()) {
      throw new Error('SambaNova API key not configured. Set SAMBANOVA_API_KEY in .env.local');
    }

    try {
      console.log(`[${this.getName()}] Analyzing image with model ${this.getModel()}`);

      const imageInput = this.convertImageData(imageData);
      const prompt = this.getPrompt();

      const { text } = await generateText({
        model: this.provider(this.config.model),
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
