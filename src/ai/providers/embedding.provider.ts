export interface EmbeddingProvider {
  generateEmbeddings(texts: string[]): Promise<number[][]>;
}

export class MockEmbeddingProvider implements EmbeddingProvider {
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    return texts.map((text) => {
      const vector = new Array(384).fill(0);

      for (let i = 0; i < text.length; i++) {
        vector[i % 384] += text.charCodeAt(i) / 1000;
      }

      return vector;
    });
  }
}

export const embeddingProvider = new MockEmbeddingProvider();
