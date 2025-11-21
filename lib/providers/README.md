# AI Providers Architecture

This directory contains the modular AI provider system with automatic fallback support.

## Architecture

```
lib/providers/
├── base.ts           # Abstract base class for all providers
├── sambanova.ts      # SambaNova AI provider implementation
├── bedrock.ts        # AWS Bedrock provider implementation
└── index.ts          # Central export point
```

## How It Works

1. **Base Provider (`base.ts`)**: Defines the interface that all providers must implement
2. **Individual Providers**: Each provider implements the `BaseAIProvider` abstract class
3. **Analyzer (`lib/analyzer.ts`)**: Orchestrates providers with automatic fallback

## Adding a New Provider

To add a new AI provider:

1. Create a new file (e.g., `lib/providers/openai.ts`)
2. Extend `BaseAIProvider` class
3. Implement required methods:
   - `isConfigured()`: Check if credentials are set
   - `analyzeImage()`: Perform image analysis
4. Add to `PROVIDER_REGISTRY` in `lib/analyzer.ts`

Example:

```typescript
import { BaseAIProvider, AnalysisResult } from './base';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

export class OpenAIProvider extends BaseAIProvider {
  private provider: ReturnType<typeof createOpenAI>;

  constructor(model: string = 'gpt-4-vision-preview') {
    super({
      name: 'OpenAI',
      model,
      enabled: true,
    });

    this.provider = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  isConfigured(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }

  async analyzeImage(imageData: string): Promise<AnalysisResult> {
    // Implementation here
  }
}
```

Then register it:

```typescript
// In lib/analyzer.ts
const PROVIDER_REGISTRY: Record<string, () => BaseAIProvider> = {
  sambanova: () => new SambaNovaProvider(),
  bedrock: () => new BedrockProvider(),
  openai: () => new OpenAIProvider(), // Add new provider
};
```

## Automatic Fallback

The system automatically tries providers in order:

1. **Primary provider** (set by `AI_PROVIDER` env variable)
2. **Fallback providers** (all other configured providers)

If one provider fails, it automatically tries the next one.

## Configuration

Set in `.env.local`:

```bash
# Choose primary provider
AI_PROVIDER="sambanova"  # or "bedrock" or any registered provider

# SambaNova credentials
SAMBANOVA_API_KEY="your-key"

# AWS Bedrock credentials
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
AWS_SESSION_TOKEN="your-token"
```

## Testing

The analyzer exports a `testProviders()` function for testing all providers:

```typescript
import { testProviders } from '@/lib/analyzer';

const results = await testProviders('https://example.com/test-image.jpg');
console.log(results);
```

## Provider Status

Check provider status:

```typescript
import { getProviderInfo } from '@/lib/analyzer';

const info = getProviderInfo();
console.log('Primary:', info.primary);
console.log('Available providers:', info.available);
console.log('Total configured:', info.total);
```
