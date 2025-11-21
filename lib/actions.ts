'use server';

import { analyzeCarriageImage } from './analyzer';

export async function analyzeImage(imageUrl: string) {
  return await analyzeCarriageImage(imageUrl);
}
