"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { ModeToggle } from "@/components/mode-toggle";
import ProfileDropdown from "@/components/profile-dropdown";

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
    full_name: string;
  };
  post_reactions: PostReaction[];
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  user_reaction?: "like" | "dislike";
}

export default function ForumPage() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data: posts, error } = await supabase
        .from("forum_posts")
        .select(
          `
          id,
          title,
          content,
          created_at,
          user_id,
          post_reactions(reaction_type)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get user profiles
      const userIds = posts.map((post) => post.user_id);
      const { data: userProfiles } = await supabase
        .from("user_profiles")
        .select("id, full_name")
        .in("id", userIds);

      // Get user reactions
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: reactions } = await supabase
          .from("post_reactions")
          .select("post_id, reaction_type")
          .eq("user_id", user.id);

        const postsWithReactions = posts.map((post: any) => ({
          ...post,
          user_profiles: {
            full_name:
              userProfiles?.find((profile) => profile.id === post.user_id)
                ?.full_name || "Unknown User",
          },
          likes_count: post.post_reactions.filter(
            (r: PostReaction) => r.reaction_type === "like"
          ).length,
          dislikes_count: post.post_reactions.filter(
            (r: PostReaction) => r.reaction_type === "dislike"
          ).length,
          comments_count: 0, // We'll fetch this separately if needed
          user_reaction: reactions?.find((r) => r.post_id === post.id)
            ?.reaction_type,
        })) as ForumPost[];

        setPosts(postsWithReactions);
      } else {
        const postsWithCounts = posts.map((post: any) => ({
          ...post,
          user_profiles: {
            full_name:
              userProfiles?.find((profile) => profile.id === post.user_id)
                ?.full_name || "Unknown User",
          },
          likes_count: post.post_reactions.filter(
            (r: PostReaction) => r.reaction_type === "like"
          ).length,
          dislikes_count: post.post_reactions.filter(
            (r: PostReaction) => r.reaction_type === "dislike"
          ).length,
          comments_count: 0,
        })) as ForumPost[];
        setPosts(postsWithCounts);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReaction = async (
    postId: string,
    reactionType: "like" | "dislike"
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      const existingReaction = posts.find(
        (p) => p.id === postId
      )?.user_reaction;

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

      fetchPosts(); // Refresh posts to update counts
    } catch (error) {
      console.error("Error handling reaction:", error);
    }
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className=" ">
      <div className="sticky top-0 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-3">
          <h1 className="text-3xl font-bold">
            <Link href="/chat">Probashi Forum</Link>
          </h1>
          <div className="flex items-center justify-center gap-3">
            <ModeToggle />
            <ProfileDropdown />
          </div>
        </div>
        <hr />
      </div>

      <div className="container mx-auto max-w-4xl py-8">
        <div className="flex items-center justify-between gap-4 pb-5">
          <Input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          <Link href="/forum/new">
            <Button>Create New Post</Button>
          </Link>
        </div>
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <Link href={`/forum/${post.id}`}>
                  <CardTitle className="hover:text-blue-600 transition-colors">
                    {post.title}
                  </CardTitle>
                </Link>
                <div className="text-sm text-gray-500">
                  Posted by {post.user_profiles.full_name} •{" "}
                  {formatDistanceToNow(new Date(post.created_at))} ago
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none mb-4">
                  {post.content.length > 200
                    ? `${post.content.substring(0, 200)}...`
                    : post.content}
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleReaction(post.id, "like")}
                    className={`flex items-center gap-1 ${
                      post.user_reaction === "like" ? "text-blue-600" : ""
                    }`}
                  >
                    <ThumbsUp size={16} />
                    <span>{post.likes_count}</span>
                  </button>
                  <button
                    onClick={() => handleReaction(post.id, "dislike")}
                    className={`flex items-center gap-1 ${
                      post.user_reaction === "dislike" ? "text-red-600" : ""
                    }`}
                  >
                    <ThumbsDown size={16} />
                    <span>{post.dislikes_count}</span>
                  </button>
                  <div className="flex items-center gap-1 text-gray-500">
                    <MessageSquare size={16} />
                    <span>{post.comments_count}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
