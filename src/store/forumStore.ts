import { atom, map } from "nanostores";
import { Post, Reply, PostType } from "@/core/forum/domain/Forum";
import { supabaseBrowser } from "@/libs/db";

// State
export const $posts = atom<Post[]>([]);
export const $replies = map<Record<string, Reply[]>>({});
export const $forumFilter = atom<PostType | "all">("all");
export const $forumSearch = atom<string>("");
export const $forumTags = atom<string[]>([]);
export const $forumLoading = atom<boolean>(false);
export const $userVotes = map<Record<string, -1 | 1>>({});

// Load posts
export async function loadPosts() {
  $forumLoading.set(true);
  const sb = supabaseBrowser();
  const { data } = await sb
    .from("posts")
    .select("*")
    .order("pinned_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (data) $posts.set(data as Post[]);
  $forumLoading.set(false);
}

// Load replies for a post
export async function loadReplies(postId: string) {
  const sb = supabaseBrowser();
  const { data } = await sb
    .from("replies")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (data) $replies.setKey(postId, data as Reply[]);
}

// Load user votes
export async function loadUserVotes(userId: string) {
  const sb = supabaseBrowser();
  const { data } = await sb
    .from("post_votes")
    .select("post_id, vote")
    .eq("user_id", userId);
  if (data) {
    const map: Record<string, -1 | 1> = {};
    data.forEach((v: any) => { map[v.post_id] = v.vote; });
    $userVotes.set(map);
  }
}

// Create post
export async function createPost(payload: {
  author_id: string;
  author_name: string;
  title: string;
  content: string;
  type: PostType;
  tags: string[];
}): Promise<boolean> {
  const sb = supabaseBrowser();
  const { error } = await sb.from("posts").insert(payload);
  if (!error) await loadPosts();
  return !error;
}

// Create reply
export async function createReply(payload: {
  post_id: string;
  author_id: string;
  author_name: string;
  content: string;
  quoted_reply_id?: string | null;
  quoted_content?: string | null;
}): Promise<boolean> {
  const sb = supabaseBrowser();
  const { error } = await sb.from("replies").insert(payload);
  if (!error) await loadReplies(payload.post_id);
  return !error;
}

// Vote post
export async function votePost(postId: string, userId: string, vote: 1 | -1) {
  const sb = supabaseBrowser();
  const current = $userVotes.get()[postId];

  if (current === vote) {
    // Toggle off
    await sb.from("post_votes").delete().eq("user_id", userId).eq("post_id", postId);
    await sb.from("posts").update({
      [vote === 1 ? "upvotes" : "downvotes"]: sb.rpc as any,
    });
    // Refetch to get accurate counts
    const { data } = await sb.from("post_votes").select("post_id, vote").eq("user_id", userId);
    const newMap: Record<string, -1 | 1> = {};
    (data ?? []).forEach((v: any) => { newMap[v.post_id] = v.vote; });
    $userVotes.set(newMap);
  } else {
    await sb.from("post_votes").upsert({ user_id: userId, post_id: postId, vote });
    $userVotes.setKey(postId, vote);
  }
  // Refresh post counts via RPC or re-fetch
  await refreshPostVoteCounts(postId, userId);
}

async function refreshPostVoteCounts(postId: string, userId: string) {
  const sb = supabaseBrowser();
  const [{ count: up }, { count: down }, userVotesRes] = await Promise.all([
    sb.from("post_votes").select("*", { count: "exact", head: true }).eq("post_id", postId).eq("vote", 1),
    sb.from("post_votes").select("*", { count: "exact", head: true }).eq("post_id", postId).eq("vote", -1),
    sb.from("post_votes").select("post_id, vote").eq("user_id", userId),
  ]);

  await sb.from("posts").update({ upvotes: up ?? 0, downvotes: down ?? 0 }).eq("id", postId);

  const newMap: Record<string, -1 | 1> = {};
  (userVotesRes.data ?? []).forEach((v: any) => { newMap[v.post_id] = v.vote; });
  $userVotes.set(newMap);

  // Update local posts atom
  $posts.set($posts.get().map(p => p.id === postId ? { ...p, upvotes: up ?? 0, downvotes: down ?? 0 } : p));
}

// Accept reply (post author only)
export async function acceptReply(replyId: string, postId: string) {
  const sb = supabaseBrowser();
  // Unaccept others first
  await sb.from("replies").update({ is_accepted: false }).eq("post_id", postId);
  await sb.from("replies").update({ is_accepted: true }).eq("id", replyId);
  await loadReplies(postId);
}
