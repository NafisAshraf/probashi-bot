"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, MessageSquare, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/lib/supabase/client";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_profiles: {
    full_name: string | null;
  } | null;
}

interface PostReaction {
  reaction_type: "like" | "dislike";
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  user_profiles: {
    full_name: string | null;
  } | null;
  post_reactions: PostReaction[];
  likes_count: number;
  dislikes_count: number;
  user_reaction?: "like" | "dislike";
}

export default function ForumPostPage() {
  const params = useParams();
  const postId = params.id as string;
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchPostAndComments();
    fetchCurrentUser();
  }, [postId]);

  const fetchCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const fetchPostAndComments = async () => {
    try {
      // Fetch post with user profile
      const { data: post, error: postError } = await supabase
        .from("forum_posts")
        .select(
          `
          *,
          user_profiles!user_id(full_name)
        `
        )
        .eq("id", postId)
        .single();

      if (postError) {
        console.error("Error fetching post:", postError);
        setPost(null);
        setIsLoading(false);
        return;
      }

      if (!post) {
        setPost(null);
        setIsLoading(false);
        return;
      }

      // Get user reaction and count reactions
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: reaction } = await supabase
          .from("post_reactions")
          .select("reaction_type")
          .eq("post_id", postId)
          .eq("user_id", user.id)
          .single();

        const { data: reactions } = await supabase
          .from("post_reactions")
          .select("reaction_type")
          .eq("post_id", postId);

        const likesCount =
          reactions?.filter((r: PostReaction) => r.reaction_type === "like")
            .length || 0;
        const dislikesCount =
          reactions?.filter((r: PostReaction) => r.reaction_type === "dislike")
            .length || 0;

        post.user_reaction = reaction?.reaction_type;
        post.likes_count = likesCount;
        post.dislikes_count = dislikesCount;
      }

      setPost(post);

      // Fetch comments with user profiles
      const { data: comments, error: commentsError } = await supabase
        .from("forum_comments")
        .select(
          `
          *,
          user_profiles!user_id(full_name)
        `
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (commentsError) {
        console.error("Error fetching comments:", commentsError);
        setComments([]);
      } else {
        setComments(comments || []);
      }
    } catch (error) {
      console.error("Error fetching post and comments:", error);
      setPost(null);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReaction = async (reactionType: "like" | "dislike") => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      const existingReaction = post?.user_reaction;

      if (existingReaction === reactionType) {
        // Remove reaction
        await supabase
          .from("post_reactions")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
      } else {
        // Update or insert reaction
        await supabase.from("post_reactions").upsert({
          post_id: postId,
          user_id: user.id,
          reaction_type: reactionType,
        });
      }

      fetchPostAndComments();
    } catch (error) {
      console.error("Error handling reaction:", error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { error } = await supabase.from("forum_comments").insert([
        {
          post_id: postId,
          content: newComment,
          user_id: user.id,
        },
      ]);

      if (error) throw error;

      setNewComment("");
      fetchPostAndComments();
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const { error } = await supabase
        .from("forum_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      router.push("/forum");
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const { error } = await supabase
        .from("forum_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      fetchPostAndComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!post) {
    return <div className="container mx-auto py-8">Post not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-2">{post.title}</CardTitle>
              <div className="text-sm text-gray-500">
                Posted by {post.user_profiles?.full_name || "Anonymous"} •{" "}
                {formatDistanceToNow(new Date(post.created_at))} ago
              </div>
            </div>
            {currentUserId === post.user_id && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeletePost}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Post
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none mb-6">{post.content}</div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleReaction("like")}
              className={`flex items-center gap-1 ${
                post.user_reaction === "like" ? "text-blue-600" : ""
              }`}
            >
              <ThumbsUp size={16} />
              <span>{post.likes_count}</span>
            </button>
            <button
              onClick={() => handleReaction("dislike")}
              className={`flex items-center gap-1 ${
                post.user_reaction === "dislike" ? "text-red-600" : ""
              }`}
            >
              <ThumbsDown size={16} />
              <span>{post.dislikes_count}</span>
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleComment} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-2 border rounded-md mb-2 min-h-[100px]"
              required
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </form>

          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm text-gray-500">
                    {comment.user_profiles?.full_name || "Anonymous"} •{" "}
                    {formatDistanceToNow(new Date(comment.created_at))} ago
                  </div>
                  {currentUserId === comment.user_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="prose max-w-none">{comment.content}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
