const VECTOR_SIZE = 1536;

function createMockEmbedding(text: string): number[] {
  const vector = new Array(VECTOR_SIZE).fill(0);

  for (let i = 0; i < text.length; i++) {
    vector[i % VECTOR_SIZE] += text.charCodeAt(i) / 1000;
  }

  return vector;
}

export async function generateEmbeddings(texts: string[]) {
  return texts.map(createMockEmbedding);
}

export async function generateEmbedding(text: string) {
  return createMockEmbedding(text);
}
