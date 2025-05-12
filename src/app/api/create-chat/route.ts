import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const cookieStore = cookies();
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate a title using OpenAI
    let title = "New Conversation";
    try {
      const userMessage = messages[0]?.content || "";
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that creates Bangla titles for conversations. You will be given a user's message and you will need to create a Bangla title for the conversation. Create a very short title in Bangla (maximum 3-4 words) that captures the essence of the user's message. Be extremely concise while remaining descriptive.",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        max_tokens: 20,
      });

      title =
        completion.choices[0]?.message?.content?.trim() || "New Conversation";
    } catch (titleError) {
      console.error("Error generating title:", titleError);
      // Fall back to default title if there's an error
    }

    // Insert the conversation into Supabase with user_id
    const { data: conversation, error: insertError } = await supabase
      .from("conversations")
      .insert([
        {
          title: title,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({
      conversationId: conversation.id,
    });
  } catch (error) {
    console.error("Error in create-chat API:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
