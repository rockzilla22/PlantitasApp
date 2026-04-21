# AI/specs/FORUM_SPEC.md: Alelopatía - Foro Communidad

## 1. VISIÓN GENERAL

**Alelopatía** es el sistema de comunidad donde usuarios comparten experiencias, preguntan, responden y discuten sobre plantas y cuidados.

> **Nota**: El nombre "Alelopatía" viene del fenómeno botánico donde plantas liberan químicos que afectan otras plantas — simboliza la comunidad afectando positively el crecimiento de otros.

### Features Core

- **Posts**: Contenido principal (preguntas, tips, experiências)
- **Respuestas**: Comentarios en posts
- **Citas**: "Quote" de otro post dentro de respuesta
- **Votos**: Upvote/downvote en posts y respuestas
- **Access**: All can read, only login users can send post.

File: E:\Archivos\Documents\devcode\5.Pruebas\PlantitasApp\src\app\(pages)\forum
---

## 2. DATA MODEL

### 2.1 Post

```typescript
interface Post {
  id: string;
  authorId: string;        // User ID
  authorName: string;
  authorAvatar: string;

  title: string;        // Nullable para Tips
  content: string;       // Markdown supported

  type: 'question' | 'tip' | 'experience' | 'discussion';
  tags: string[];       // ["Monstera", "Riego", "Plagas", etc.]

  plantRef?: string;     // ID de planta referenced (optional)
  location?: string;    // Ubicación

  upvotes: number;
  downvotes: number;
  replyCount: number;

  createdAt: string;
  updatedAt: string;
  pinnedAt?: string;    // Admin puede fixed
}
```

### 2.2 Reply (Respuesta)

```typescript
interface Reply {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;

  content: string;

  quotedReplyId?: string;   // ID de respuesta citada
  quotedContent?: string; // Copy del contenido original

  upvotes: number;
  downvotes: number;

  isAccepted?: boolean;  // Solo para questions
  createdAt: string;
}
```

### 2.3 User Reputation

```typescript
interface UserReputation {
  userId: string;
  reputation: number;     // Puntos totales

  // Stats
  postCount: number;
  replyCount: number;
  acceptedCount: number;  // Respuestas aceptadas como correctas

  // Badges (futuro)
  badges: string[];
}
```

---

## 3. UI/UX STRUCTURE

### 3.1 Main Feed

```
┌─────────────────────────────────────────────┐
│  🌿 Alelopatía              [Mi Perfil]    │
├─────────────────────────────────────────────┤
│  [Todas] [Preguntas] [Tips] [Experiencias] │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ 👤 Juan · hace 2h                 │    │
│  │ ¿Por qué se me pudren las raíces?   │    │
│  │ #Monstera #Riego               │    │
│  │ ⬆️ 12  ⬇️ 2    💬 8 respuestas │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ 👤 Maria · hace 5h                 │    │
│  │ 💡 Tip: Usa carbón en la tierra...  │    │
│  │ #Maceta #Sustrato               │    │
│  │ ⬆️ 25  ⬇️ 0                   │    │
│  └��────────────────────────────────────┘    │
│                                             │
│  ___________________________________________│
│  + Nuevo Post                               │
└─────────────────────────────────────────────┘
```

### 3.2 Post Detail

```
┌─────────────────────────────────────────────┐
│  ← Volver                                 │
├─────────────────────────────────────────────┤
│  👤 Juan · hace 2h · #Monstera        │
│  ¿Por qué se me pudren las raíces?         │
│  ──────────────────────────────────   │
│  Tengo una Monstera que regué todos    │
│  los días y ahora tiene las raíces    │
│  blandas. ¿Qué hago?                 │
│  ──────────────────────────────────   │
│  ⬆️ 12  ⬇️ 2    💬 8           │
├─────────────────────────────────────────────┤
│  Respuestas:                              │
│                                         │
│  ┌─────────────────────────────────────┐  │
│  │ 👤 Carlos · hace 1h                 │  │
│  │可能有 Pilang problema! Explico... │  │
│  │ ⬆️ 5  ✓ (aceptada)               │  │
│  └─────────────────────────────────────┘  │
│                                         │
│  ┌─────────────────────────────────────┐  │
│  │ 👤 Ana · hace 30m                   │  │
│  │ "可能有 Pilang problema!"          │  │
│  │ >> Cita                          │  │
│  │ Yo tuve lo mismo,解决方案...   │  │
│  │ ⬆️ 2                           │  │
│  └─────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│  Escribir respuesta...                    │
└─────────────────────────────────────────────┘
```

---

## 4. FILTERS & TABS

### 4.1 Main Tabs

| Tab | Query | Description |
|-----|-------|-------------|
| **Todas** | `type: *` | Todos los posts |
| **Preguntas** | `type: question` | Dudas y preguntas |
| **Tips** | `type: tip` | Consejos útils |
| **Experiencias** | `type: experience` | Historias personales |

### 4.2 Filter Bar

```
[Búsqueda: _______________]

Tags: [+Monstera] [+Riego] [+Plagas] [+Sustrato] [+Todos]

Ordenar: [Más recientes] [Más votados] [Sin responder]
```

---

## 5. PLAN DE DESARROLLO (HIper-seccionado)

### Enfoque: "Primero estructura de datos, después UI"

| Etapa | Enfoque | Entregable |
|------|---------|-----------|
| **A** | Database + API | Tabla posts, replies, queries |
| **B** | Feed básico | Lista de posts (solo texto) |
| **C** | Crear post | Formulario new post |
| **D** | Respuestas | Ver y crear replies |
| **E** | Citas | Quote functionality |
| **F** | Votos | Upvote/downvote |
| **G** | Filtros | Tags, tabs, search |

---

### ETAPA A: Database & API

**Objetivo**: Crear tablas y basic API endpoints.

#### A1: Supabase Tables

```sql
-- Tabla de posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id),
  title TEXT,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('question', 'tip', 'experience', 'discussion')),
  tags TEXT[],
  plant_ref UUID REFERENCES plants(id),
  location TEXT,
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,
  reply_count INT DEFAULT 0,
  pinned_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de replies
CREATE TABLE replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  quoted_reply_id UUID REFERENCES replies(id),
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,
  is_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de votos (futuro)
CREATE TABLE post_votes (
  user_id UUID REFERENCES auth.users(id),
  post_id UUID REFERENCES posts(id),
  vote INT CHECK (vote IN (-1, 1)),
  PRIMARY KEY (user_id, post_id)
);
```

#### A2: API Routes (supabase functions)

```typescript
// functions/get-posts/index.ts
// functions/create-post/index.ts
// functions/get-replies(index.ts
// functions/create-reply/index.ts
// functions/vote-post/index.ts
```

**Entregable Etapa A**: ✅ Tablas creadas + endpoints fungsionales.

---

### ETAPA B: Feed Básico (Texto)

**Objetivo**: Lista de posts sin stilystyling, solo texto.

#### B1: GardenStore para posts

```typescript
// src/store/forumStore.ts
import { map } from 'nanostores';

export const $posts = map<Post[]>([]);
export const $currentFilter = map<string>('all');
```

#### B2: Feed component

```tsx
// src/components/forum/PostList.tsx
import { useStore } from '@nanostores/react';
import { $posts, $currentFilter } from '@/store/forumStore';

export function PostList() {
  const posts = useStore($posts);
  const filter = useStore($currentFilter);

  const filtered = filter === 'all'
    ? posts
    : posts.filter(p => p.type === filter);

  return (
    <div className="post-list">
      {filtered.map(post => (
        <div key={post.id} className="post-item">
          <span className="post-type">[{post.type}]</span>
          <span className="post-title">{post.title || post.content.slice(0, 50)}</span>
          <span className="post-author">@{post.authorName}</span>
          <span className="post-stats">⬆{post.upvotes} 💬{post.replyCount}</span>
        </div>
      ))}
    </div>
  );
}
```

**Entregable Etapa B**: ✅ Lista de posts en pantalla.

---

### ETAPA C: Crear Post

**Objetivo**: Formulario para nuevo post.

#### C1: NewPostModal component

```tsx
// src/components/forum/NewPostModal.tsx
interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewPostModal({ isOpen, onClose }: NewPostModalProps) {
  const [type, setType] = useState<'question' | 'tip' | 'experience'>('question');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const handleSubmit = async () => {
    await createPost({ type, title, content, tags });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Nuevo {[question: 'Pregunta', tip: 'Tip', experience: 'Experiencia'][type]}</h2>

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="question">❓ Pregunta</option>
          <option value="tip">💡 Tip</option>
          <option value="experience">📖 Experiencia</option>
        </select>

        <input
          placeholder={type === 'tip' ? 'Título corto (opcional)' : 'Título'}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="¿Qué quieres compartir?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
        />

        {/* Tags input - por ahora manual */}
        <input placeholder="Tags (separados por coma)" />

        <button onClick={handleSubmit}>Publicar</button>
        <button onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
}
```

**Entregable Etapa C**: ✅ Formulario para crear posts.

---

### ETAPA D: Respuestas

**Objetivo**: Ver y crear respuestas a posts.

#### D1: ReplyList component

```tsx
// src/components/forum/ReplyList.tsx
export function ReplyList({ postId }: { postId: string }) {
  const replies = useStore($replies).filter(r => r.postId === postId);

  return (
    <div className="reply-list">
      {replies.map(reply => (
        <div key={reply.id} className="reply">
          <span>@{reply.authorName}</span>
          <p>{reply.content}</p>
          <span>⬆{reply.upvotes}</span>
          {reply.isAccepted && <span>✓</span>}
        </div>
      ))}
    </div>
  );
}
```

#### D2: Reply input

```tsx
// En PostDetail, debajo del contenido
<textarea placeholder="Escribe una respuesta..." />
<button>Responder</button>
```

**Entregable Etapa D**: ✅ Sistema de respuestas.

---

### ETAPA E: Citas (Quotes)

**Objetivo**: Responder citando otra respuesta.

#### E1: Quote button

```tsx
// En ReplyList, cada reply tiene botón "Citar"
<button onClick={() => setQuoteMode(reply.id)}>↩️ Citar</button>
```

#### E2: Reply con quote

```tsx
const [quotedReplyId, setQuotedReplyId] = useState<string | null>(null);

// En el input
<>
  {quotedReplyId && (
    <div className="quoted">
      ↩️ "{getReply(quotedReplyId).content}"
    </div>
  )}
  <textarea value={content} ... />
</>
```

#### E3: Mostrar quote

```tsx
// En Reply render
{reply.quotedContent && (
  <blockquote className="quote">
    ↩️ "{reply.quotedContent}"
  </blockquote>
)}
```

**Entregable Etapa E**: ✅ Sistema de citascquotes.

---

### ETAPA F: Votos

**Objetivo**: Upvote/downvote en posts y respuestas.

#### F1: Vote buttons

```tsx
<button onClick={() => vote(post.id, 1)}>⬆️</button>
<span>{post.upvotes - post.downvotes}</span>
<button onClick={() => vote(post.id, -1)}>⬇️</button>
```

#### F2: Vote logic

```typescript
async function vote(postId: string, value: 1 | -1) {
  // Verificar si ya votó
  // Optimistically update UI
  // Call API
}
```

**Entregable Etapa F**: ✅ Sistema de votos.

---

### ETAPA G: Filtros

**Objetivo**: Filtros por tags, tabs, search.

#### G1: Tabs component

```tsx
const TABS = ['all', 'question', 'tip', 'experience'];

<Tabs>
  {TABS.map(tab => (
    <button
      key={tab}
      className={currentTab === tab ? 'active' : ''}
      onClick={() => setTab(tab)}
    >
      {tab === 'all' ? 'Todas' : TABS_LABELS[tab]}
    </button>
  ))}
</Tabs>
```

#### G2: Filter by tags

```tsx
// tags: ["Monstera", "Riego", "Plagas"]
<FilterTags>
  {AVAILABLE_TAGS.map(tag => (
    <button onClick={() => toggleTag(tag)}>{tag}</button>
  ))}
</FilterTags>
```

#### G3: Search

```tsx
<input
  placeholder="Buscar..."
  onChange={(e) => setSearch(e.target.value)}
/>
```

**Entregable Etapa G**: ✅ Filtros completos.

---

## 6. RESUMEN: Orden de Desarrollo

| # | Sub-paso | Qué | Dependencias | Dificult |
|-----|--------|-------------|----------|---------|
| **A1** | Tabla posts | None | Baja |
| **A2** | Tabla replies | A1 | Baja |
| **A3** | API endpoints | A1+A2 | Media |
| **B1** | Forum store | A3 | Baja |
| **B2** | PostList UI | B1 | Baja |
| **C1** | NewPostModal | B2 | Media |
| **C2** | Create post API | C1 | Media |
| **D1** | ReplyList | B2 | Baja |
| **D2** | Reply input | D1 | Baja |
| **E1** | Quote UI | D2 | Media |
| **E2** | Quote display | E1 | Baja |
| **F1** | Vote buttons | B2 | Baja |
| **F2** | Vote logic | F1 | Media |
| **G1** | Tabs | B2 | Baja |
| **G2** | Tags filter | G1 | Media |
| **G3** | Search | G2 | Baja |

---

### Entregables por Etapa

| Etapa | Entregable | Tiempo |
|------|----------|-------|
| **A** | Database + API | 30 min |
| **B** | Feed textual | 15 min |
| **C** | Crear post | 15 min |
| **D** | Respuestas | 15 min |
| **E** | Citas | 15 min |
| **F** | Votos | 15 min |
| **G** | Filtros | 15 min |

**Total estimado**: ~2 horas para feature completo.

---

## 7. REGLAS

1. **Solo usuarios autenticados**: Posts y replies requieren login
2. **Markdown support**: Para contenido rico (futuro)
3. **Sanitización**: Limpiar HTML输入 antes de guardar
4. **Rate limiting**: Max 10 posts/día por usuario
5. **Moderación**: Admin puede delete y pin posts

---

## 8. NOTAS

- **Nombre**: "Alelopatía" — interacción entre plantas (y usuarios)
- **Tag suggestions**: Basados en PLANT_TYPES y LOG_ACTIONS del catálogo
- **Reputation**:Points para upvotes (futuro feature)
- **Accepted answer**: Solo para posts tipo "question"