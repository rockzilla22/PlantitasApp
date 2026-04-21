import { atom, map } from "nanostores";
import { Post, Reply, PostType } from "@/core/forum/domain/Forum";
import { supabaseBrowser } from "@/libs/db";

// State
export const $posts = atom<Post[]>([]);
export const $replies = map<Record<string, Reply[]>>({});
export const $forumFilter = atom<PostType | "all">("all");
export const $forumSearch = atom<string>("");
export const $forumLoading = atom<boolean>(false);
export const $userVotes = map<Record<string, -1 | 1>>({});
export const $userReplyVotes = map<Record<string, -1 | 1>>({});

// Load posts
export async function loadPosts() {
  $forumLoading.set(true);
  const sb = supabaseBrowser();
  
  // Traemos los posts y contamos las replies de forma reactiva
  const { data } = await sb
    .from("posts")
    .select("*, replies(count)")
    .order("pinned_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (data) {
    const formatted = data.map((p: any) => ({
      ...p,
      reply_count: p.replies?.[0]?.count ?? 0
    }));
    $posts.set(formatted as Post[]);
  }
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
  if (data) {
    $replies.setKey(postId, data as Reply[]);

    // Sincronización automática de contador si hay desvío
    const posts = $posts.get();
    const post = posts.find((p) => p.id === postId);
    if (post && post.reply_count !== data.length) {
      const updatedPosts = posts.map((p) => (p.id === postId ? { ...p, reply_count: data.length } : p));
      $posts.set(updatedPosts);
      // Corregimos la DB de forma silenciosa
      await sb.from("posts").update({ reply_count: data.length }).eq("id", postId);
    }
  }
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

// Load user reply votes
export async function loadUserReplyVotes(userId: string) {
  const sb = supabaseBrowser();
  const { data } = await sb
    .from("reply_votes")
    .select("reply_id, vote")
    .eq("user_id", userId);
  if (data) {
    const map: Record<string, -1 | 1> = {};
    data.forEach((v: any) => { map[v.reply_id] = v.vote; });
    $userReplyVotes.set(map);
  }
}

// Create post
export async function createPost(payload: {
  author_id: string;
  author_name: string;
  title: string;
  content: string;
  type: PostType;
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
  const { data: replyData, error } = await sb.from("replies").insert(payload).select("id").single();
  
  if (!error && replyData) {
    await loadReplies(payload.post_id);
    // Update local post count
    const posts = $posts.get();
    const post = posts.find(p => p.id === payload.post_id);
    const newCount = (post?.reply_count || 0) + 1;
    
    const updatedPosts = posts.map((p) =>
      p.id === payload.post_id ? { ...p, reply_count: newCount } : p
    );
    $posts.set(updatedPosts);

    // Persist count in DB (in case trigger is missing)
    await sb.from("posts").update({ reply_count: newCount }).eq("id", payload.post_id);

    // Notifications handled by DB trigger fn_notify_on_reply
  }
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

// Vote reply
export async function voteReply(replyId: string, postId: string, userId: string, vote: 1 | -1) {
  const sb = supabaseBrowser();
  const currentVotes = $userReplyVotes.get();
  const current = currentVotes[replyId];
  
  // 1. Update UI Optimistically
  const repliesMap = $replies.get();
  const postReplies = [...(repliesMap[postId] || [])];
  const replyIdx = postReplies.findIndex(r => r.id === replyId);
  
  if (replyIdx !== -1) {
    const r = { ...postReplies[replyIdx] };
    // Revertimos voto anterior si existe
    if (current === 1) r.upvotes = Math.max(0, (r.upvotes || 0) - 1);
    if (current === -1) r.downvotes = Math.max(0, (r.downvotes || 0) - 1);
    
    // Aplicamos nuevo voto si no es toggle-off
    if (current !== vote) {
      if (vote === 1) r.upvotes = (r.upvotes || 0) + 1;
      if (vote === -1) r.downvotes = (r.downvotes || 0) + 1;
      $userReplyVotes.setKey(replyId, vote);
    } else {
      $userReplyVotes.setKey(replyId, undefined as any);
    }
    
    postReplies[replyIdx] = r;
    $replies.setKey(postId, postReplies);
  }

  // 2. Persist to DB
  let dbErr;
  if (current === vote) {
    const { error } = await sb.from("reply_votes").delete().eq("user_id", userId).eq("reply_id", replyId);
    dbErr = error;
  } else {
    const { error } = await sb.from("reply_votes").upsert({ user_id: userId, reply_id: replyId, vote });
    dbErr = error;
  }

  if (dbErr) {
    console.error("Error al persistir voto en reply_votes:", dbErr);
    return;
  }

  // 3. Sync final counts to DB
  const [{ count: up }, { count: down }] = await Promise.all([
    sb.from("reply_votes").select("*", { count: "exact", head: true }).eq("reply_id", replyId).eq("vote", 1),
    sb.from("reply_votes").select("*", { count: "exact", head: true }).eq("reply_id", replyId).eq("vote", -1),
  ]);

  const { error: updateErr } = await sb.from("replies").update({ upvotes: up ?? 0, downvotes: down ?? 0 }).eq("id", replyId);
  
  if (updateErr) {
    console.error("Error al actualizar contadores en tabla 'replies'. ¿Existen las columnas upvotes/downvotes?:", updateErr);
  }
}

// Accept reply (post author only)
export async function acceptReply(replyId: string, postId: string) {
  const sb = supabaseBrowser();
  // Unaccept others first
  await sb.from("replies").update({ is_accepted: false }).eq("post_id", postId);
  await sb.from("replies").update({ is_accepted: true }).eq("id", replyId);
  await loadReplies(postId);
}

// Update post
export async function updatePost(postId: string, payload: Partial<Post>): Promise<boolean> {
  const sb = supabaseBrowser();
  const { error } = await sb.from("posts").update(payload).eq("id", postId);
  if (!error) await loadPosts();
  return !error;
}

// Delete post (Moderation)
export async function deletePost(postId: string): Promise<boolean> {
  const sb = supabaseBrowser();
  const { error } = await sb.from("posts").delete().eq("id", postId);
  if (!error) {
    $posts.set($posts.get().filter((p) => p.id !== postId));
  }
  return !error;
}
