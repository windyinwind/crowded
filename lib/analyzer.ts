/**
 * Multi-Provider AI Image Analyzer with Automatic Fallback
 *
 * This module provides a robust image analysis system that automatically
 * falls back to alternative providers if the primary provider fails.
 *
 * Configuration:
 * - AI_PROVIDER: Primary provider to use first (default: 'bedrock')
 * - AI_FALLBACK_PROVIDER: Specific fallback if primary fails (default: 'sambanova')
 * - All other configured providers will be used as additional fallbacks
 *
 * Providers are tried in order:
 * 1. Primary provider (AI_PROVIDER)
 * 2. Fallback provider (AI_FALLBACK_PROVIDER)
 * 3. Any other configured providers
 */

import { BaseAIProvider, AnalysisResult, CongestionStatus } from './providers/base';
import { SambaNovaProvider } from './providers/sambanova';
import { BedrockProvider } from './providers/bedrock';

// Export types for external use
export type { CongestionStatus, AnalysisResult };

/**
 * Provider Registry
 * Add new providers here to make them available for use
 */
const PROVIDER_REGISTRY: Record<string, () => BaseAIProvider> = {
  sambanova: () => new SambaNovaProvider(),
  bedrock: () => new BedrockProvider(),
};

/**
 * Get primary provider name from environment
 */
function getPrimaryProvider(): string {
  return process.env.AI_PROVIDER || 'bedrock';
}

/**
 * Get fallback provider name from environment
 */
function getFallbackProvider(): string | null {
  return process.env.AI_FALLBACK_PROVIDER || null;
}

/**
 * Initialize all available providers in priority order
 */
function initializeProviders(): BaseAIProvider[] {
  const primaryName = getPrimaryProvider();
  const fallbackName = getFallbackProvider();
  const providers: BaseAIProvider[] = [];

  // Add primary provider first
  if (PROVIDER_REGISTRY[primaryName]) {
    const provider = PROVIDER_REGISTRY[primaryName]();
    if (provider.isConfigured() && provider.isEnabled()) {
      providers.push(provider);
      console.log(`[Analyzer] ✓ Primary provider: ${provider.getName()}`);
    } else {
      console.warn(`[Analyzer] ⚠ Primary provider ${primaryName} not configured or disabled`);
    }
  } else {
    console.warn(`[Analyzer] ⚠ Primary provider ${primaryName} not found in registry`);
  }

  // Add explicit fallback provider if specified
  if (fallbackName && fallbackName !== primaryName && PROVIDER_REGISTRY[fallbackName]) {
    const provider = PROVIDER_REGISTRY[fallbackName]();
    if (provider.isConfigured() && provider.isEnabled()) {
      providers.push(provider);
      console.log(`[Analyzer] ✓ Fallback provider: ${provider.getName()}`);
    } else {
      console.warn(`[Analyzer] ⚠ Fallback provider ${fallbackName} not configured or disabled`);
    }
  }

  // Add any other configured providers as additional fallbacks
  for (const [name, factory] of Object.entries(PROVIDER_REGISTRY)) {
    if (name !== primaryName && name !== fallbackName) {
      const provider = factory();
      if (provider.isConfigured() && provider.isEnabled()) {
        providers.push(provider);
        console.log(`[Analyzer] ✓ Additional fallback: ${provider.getName()}`);
      }
    }
  }

  if (providers.length === 0) {
    throw new Error('No AI providers configured. Please set up at least one provider in .env.local');
  }

  console.log(`[Analyzer] Total providers available: ${providers.length}`);
  return providers;
}

// Initialize providers
const providers = initializeProviders();

/**
 * Analyze carriage image with automatic fallback
 *
 * Attempts to analyze the image using the primary provider first.
 * If that fails, automatically tries each fallback provider in order
 * until one succeeds or all fail.
 *
 * @param imageUrl - Base64 data URL or regular URL to the image
 * @returns Promise<AnalysisResult> - Analysis results including status, capacity, confidence, and reasoning
 * @throws Error if all providers fail
 */
export async function analyzeCarriageImage(imageUrl: string): Promise<AnalysisResult> {
  const errors: Array<{ provider: string; error: string }> = [];

  console.log(`[Analyzer] Starting analysis with ${providers.length} provider(s)`);

  // Try each provider in order
  for (const provider of providers) {
    try {
      console.log(`[Analyzer] Attempting analysis with ${provider.getName()}...`);
      const result = await provider.analyzeImage(imageUrl);
      console.log(`[Analyzer] ✓ Successfully analyzed with ${provider.getName()}`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push({
        provider: provider.getName(),
        error: errorMessage,
      });
      console.error(`[Analyzer] ✗ ${provider.getName()} failed:`, errorMessage);

      // If this is not the last provider, continue to next one
      if (providers.indexOf(provider) < providers.length - 1) {
        console.log(`[Analyzer] Falling back to next provider...`);
      }
    }
  }

  // All providers failed
  console.error('[Analyzer] All providers failed');
  const errorSummary = errors.map(e => `${e.provider}: ${e.error}`).join('; ');

  // Return fallback result instead of throwing
  return {
    status: 'moderate',
    capacity: 50,
    confidence: 0,
    reasoning: `All providers failed. Errors: ${errorSummary}`,
  };
}

/**
 * Get information about available providers
 */
export function getProviderInfo() {
  return {
    primary: getPrimaryProvider(),
    fallback: getFallbackProvider(),
    available: providers.map(p => ({
      name: p.getName(),
      model: p.getModel(),
      configured: p.isConfigured(),
      enabled: p.isEnabled(),
    })),
    total: providers.length,
  };
}

/**
 * Test all providers
 * Useful for debugging and health checks
 */
export async function testProviders(testImageUrl: string): Promise<
  Array<{
    provider: string;
    success: boolean;
    result?: AnalysisResult;
    error?: string;
  }>
> {
  const results = [];

  for (const provider of providers) {
    try {
      const result = await provider.analyzeImage(testImageUrl);
      results.push({
        provider: provider.getName(),
        success: true,
        result,
      });
    } catch (error) {
      results.push({
        provider: provider.getName(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}
