export type PostType = "question" | "tip" | "experience" | "discussion";

export interface Post {
  id: string;
  author_id: string;
  author_name: string;
  title: string | null;
  content: string;
  type: PostType;
  plant_ref: number | null;
  upvotes: number;
  downvotes: number;
  reply_count: number;
  pinned_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Reply {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  content: string;
  quoted_reply_id: string | null;
  quoted_content: string | null;
  upvotes: number;
  downvotes: number;
  is_accepted: boolean;
  created_at: string;
}

export const POST_TYPE_LABELS: Record<PostType, string> = {
  question: "Pregunta",
  tip: "Tip",
  experience: "Experiencia",
  discussion: "Discusión",
};

export const POST_TYPE_EMOJI: Record<PostType, string> = {
  question: "❓",
  tip: "💡",
  experience: "📖",
  discussion: "💬",
};
