import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("id");

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Delete all messages associated with the conversation
    const { error: messagesError } = await supabase
      .from("messages")
      .delete()
      .eq("conversation_id", conversationId);

    if (messagesError) {
      throw messagesError;
    }

    // Delete the conversation
    const { error: conversationError } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId);

    if (conversationError) {
      throw conversationError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}
