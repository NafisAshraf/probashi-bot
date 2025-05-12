import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt to enhance user queries
const getSystemPrompt = (
  country: string,
  job_choice: string,
  country_choice: string
) => ({
  role: "system" as const,
  content: `You are a prompt enhancer helping migrant workers from Bangladesh (who may not be familiar with how to ask questions effectively in chatbots) ask better questions to an AI assistant. The user is currently in ${country}. Your job is to rewrite their input so that the AI gives very specific, detailed, and actionable answers.

The improved prompt should:
1. Clarify the original request without changing the meaning.
2. Be written in simple English. The user may prompt in Bangla, so you should translate it to English.
3. Ask for exact, step-by-step help — no general advice.
4. If relevant, then request real contact information, such as:
   - Names of offices or people to contact
   - Physical addresses
   - Phone numbers
   - Email addresses
5. Consider the user's current location (${country}) when enhancing the prompt.
6. If it is relevant, you may use the information that the user wants to go to (${country_choice}) and work in ${job_choice}.
7. If the user's prompt is a single word like "yes", "no", "ok", "thanks", "hello" etc. just return the same prompt.

Output ONLY the improved prompt, nothing else. If user's prompt does not need any improvement, just return the same prompt.`,
});

export async function POST(req: Request) {
  try {
    const { messages, country, country_choice, job_choice } = await req.json();

    // Log the incoming message
    console.log("Received message:", messages[messages.length - 1].content);
    console.log("Country:", country);
    // Get the latest user message
    const latestMessage = messages[messages.length - 1];

    // Only enhance if it's a user message
    let enhancedMessages = [...messages];
    if (latestMessage.role === "user") {
      try {
        // Create a prompt enhancement request
        const enhancementResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            getSystemPrompt(country, job_choice, country_choice),
            { role: "user", content: latestMessage.content },
          ],
        });

        const enhancedPrompt =
          enhancementResponse.choices[0]?.message?.content ||
          latestMessage.content;

        // Replace the latest message with the enhanced version
        enhancedMessages[enhancedMessages.length - 1] = {
          ...latestMessage,
          content: enhancedPrompt,
        };

        console.log("Enhanced prompt:", enhancedPrompt);
      } catch (enhancementError) {
        console.error("Error enhancing prompt:", enhancementError);
        // Continue with original message if enhancement fails
      }
    }

    // //////////////////////////////////////////

    // First check if we need to do a web search
    // const searchCheckResponse = await openai.chat.completions.create({
    //   model: "gpt-4o-mini",
    //   messages: [
    //     {
    //       role: "system",
    //       content:
    //         "You are a helpful assistant that determines if a web search is needed to properly answer questions. If you are confident you can answer the question accurately without needing current information from the web, return 'false'. If a web search would be helpful, return a search query that would find relevant information. You MUST format your response as either 'false' or the search query string.",
    //     },
    //     {
    //       role: "user",
    //       content: enhancedMessages[enhancedMessages.length - 1].content,
    //     },
    //   ],
    // });

    // const searchCheck = searchCheckResponse.choices[0]?.message?.content;
    // console.log("Search check:", searchCheck);

    // ///////////////////////////////////////////////////////

    // Only proceed with completion after checking search need
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-search-preview",
      web_search_options: {}, // enables web search for the query
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant for migrant workers from Bangladesh. You MUST answer in Bangla, even if user asks in English. For context, user is currently in ${country}, and wants to go to ${country_choice} and work in ${job_choice}.`,
        },
        ...enhancedMessages,
      ],
      stream: true,
    });

    // Create a new ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(new TextEncoder().encode(content));
            }
          }
          controller.close();
        } catch (error) {
          console.error("Error in stream:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
