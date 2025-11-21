/**
 * AWS Bedrock AI Provider
 *
 * Uses AWS Bedrock's Llama vision model for image analysis.
 * Requires AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, etc.)
 */

import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { generateText } from 'ai';
import { BaseAIProvider, AnalysisResult, ProviderConfig } from './base';

export class BedrockProvider extends BaseAIProvider {
  private provider: ReturnType<typeof createAmazonBedrock>;

  constructor(model: string = 'us.meta.llama3-2-11b-instruct-v1:0') {
    model = process.env.AWS_BEDROCK_AI_MODEL || model;
    super({
      name: 'AWS Bedrock',
      model,
      enabled: true,
    });

    this.provider = createAmazonBedrock({
      region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      sessionToken: process.env.AWS_SESSION_TOKEN,
    });
  }

  isConfigured(): boolean {
    return !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY
    );
  }

  async analyzeImage(imageData: string): Promise<AnalysisResult> {
    if (!this.isConfigured()) {
      throw new Error(
        'AWS Bedrock credentials not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env.local'
      );
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
        `AWS Bedrock analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
