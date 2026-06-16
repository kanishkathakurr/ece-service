import { Ollama } from "ollama";

const ollama = new Ollama({
  host: "http://localhost:11434"
});

export async function generateAnswerWithOllama(
  question: string,
  context: string
) {
  const response = await ollama.chat({
    model: "llama3",
    messages: [
      {
        role: "system",
        content:
          "You answer only from the provided context. If the answer is not in the context, say you don't know."
      },
      {
        role: "user",
        content: `Context:\n${context}\n\nQuestion:\n${question}`
      }
    ]
  });

  return response.message.content;
}
