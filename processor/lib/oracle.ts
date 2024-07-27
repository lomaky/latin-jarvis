export class Oracle {
  llmChatEndpoint = "http://localhost:11434/api/chat";

  constructor() {}

  async answerPrompt(prompt: string): Promise<string | undefined> {
    if (!prompt) {
      return undefined;
    }
    // Summarize article
    const promptSummaryRequest: chat = {
      model: "llama3.1",
      messages: [
        {
          role: "user",
          content:
            "Puedes responder la siguiente pregunta en español en pocas palabras?",
        },
        {
          role: "assistant",
          content:
            "Sí! Estoy listo para responder la noticia.\n\n¿Cuál es la pregunta que deseas que yo responda?",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: false,
    };
    const summaryResult = await fetch(`${this.llmChatEndpoint}`, {
      method: "POST",
      body: JSON.stringify(promptSummaryRequest),
    });
    const summaryResponse = (await summaryResult.json())?.message?.content as
      | string
      | undefined;
    return summaryResponse;
  }

}

export interface chat {
  model: string;
  messages: message[];
  stream: boolean;
}

export interface message {
  role: string;
  content: string;
}