# Instagram Posts Management — Design Specification

**Date:** 2026-04-13
**Project:** Scandic School (API + Frontend)
**Feature:** CRUD for Instagram posts with admin dashboard management and carousel integration

---

## Overview

Add Instagram post management system that allows admins to:
- Manage Instagram post URLs with display order
- Toggle posts between active/inactive status
- Reorder posts via drag-and-drop (auto-save)
- Create and delete posts

Frontend will:
- Load posts from API instead of hardcoded array
- Display active posts in the Instagram carousel component

---

## Database Schema

**Table:** `InstagramPost` (Prisma model)

```prisma
model InstagramPost {
  id        Int      @id @default(autoincrement())
  url       String   @unique
  order     Int
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Notes:**
- `url` is unique to prevent duplicate posts
- `order` determines carousel display order and should be indexed for performance
- `isActive` controls visibility (public API returns only active posts)
- Timestamps track creation and modifications

---

## API Design

**Base path:** `/instagram-posts`
**Module:** New `InstagramModule` (follows existing patterns)

### Endpoints

#### GET /instagram-posts
Returns all active Instagram posts sorted by order.

**Response (200):**
```json
[
  {
    "id": 1,
    "url": "https://www.instagram.com/p/DOScJt1AsIs/",
    "order": 1,
    "isActive": true,
    "createdAt": "2026-04-13T10:00:00Z",
    "updatedAt": "2026-04-13T10:00:00Z"
  }
]
```

**Query params (optional, for admin use):**
- `includeInactive=true` — return all posts (inactive + active)

---

#### POST /instagram-posts (Admin only)
Create a new Instagram post.

**Request body:**
```json
{
  "url": "https://www.instagram.com/p/DOScJt1AsIs/",
  "isActive": true
}
```

**Response (201):**
Same as GET response item.

**Validation:**
- URL must be valid Instagram post URL or full URL
- URL must be unique
- `isActive` defaults to `true`

---

#### PATCH /instagram-posts/:id (Admin only)
Update a post (URL, order, or active status).

**Request body (all optional):**
```json
{
  "url": "https://www.instagram.com/p/NEW_ID/",
  "order": 2,
  "isActive": false
}
```

**Response (200):**
Updated post object.

**Notes:**
- Called automatically on every drag-and-drop reorder
- Called on toggle switch changes

---

#### DELETE /instagram-posts/:id (Admin only)
Remove a post permanently.

**Response (204 No Content)**

---

## Admin Dashboard (/admin/instagram)

**Location:** Server-side rendered HTML page in `AdminController`

**Features:**

### Table Display
Three-column table:
1. **URL** — text field, editable inline
2. **Order** — numeric value, updates on drag-and-drop
3. **Active** — toggle switch

### Interactions

**Drag-and-Drop:**
- User drags table row to new position
- System recalculates `order` values for affected rows
- Auto-PATCH request to `/instagram-posts/:id` with new order
- Row re-sorts immediately (optimistic update)

**Toggle Active/Inactive:**
- Switch on each row
- Auto-PATCH request with `isActive: boolean`
- Instant visual feedback

**Add New Post:**
- Button "Add Post" opens modal/inline form
- Form fields: URL (required), Active (checkbox, default true)
- POST `/instagram-posts` on submit
- New row appends to table

**Delete Post:**
- Delete button on each row
- Confirmation dialog recommended
- DELETE `/instagram-posts/:id`
- Row removed from table

### Design Notes
- Inline editing for URL field (or click-to-edit pattern)
- Existing admin panel styling (no new CSS framework)
- Simple HTML/CSS, no React component needed (SSR in NestJS controller)

---

## Frontend Service Layer

**File:** `src/lib/api/services/instagram.ts`

**Interface:**
```typescript
export interface InstagramPost {
  id: number;
  url: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInstagramPostRequest {
  url: string;
  isActive?: boolean;
}

export interface UpdateInstagramPostRequest {
  url?: string;
  order?: number;
  isActive?: boolean;
}

export class InstagramService {
  async getAll(): Promise<InstagramPost[]>;
  async create(data: CreateInstagramPostRequest): Promise<InstagramPost>;
  async update(id: number, data: UpdateInstagramPostRequest): Promise<InstagramPost>;
  async delete(id: number): Promise<void>;
}

export const instagramService = new InstagramService();
```

**Notes:**
- Follows `DocumentsService` pattern
- Uses `apiClient` from `src/lib/api/client.ts`
- All methods are client-side (not server actions)

---

## Instagram Carousel Component

**File:** `src/components/instagram-carousel.tsx`

**Changes:**
- Remove hardcoded `instagramPosts` array
- Add `useState` for posts loading
- Add `useEffect` to fetch posts on mount: `instagramService.getAll()`
- Add loading state (show spinner while fetching)
- Add error handling (fallback message if fetch fails)
- Render carousel with fetched posts instead of hardcoded

**Loading state:**
- Show placeholder or spinner while loading
- Use existing "Loading post..." message from translations

**Error handling:**
- If fetch fails, display user-friendly message
- Carousel doesn't render empty (shows error instead)

**Carousel logic:** unchanged (framer-motion, InstagramEmbed, auto-scroll)

---

## Implementation Sequence

1. **Database:** Add Prisma migration for `InstagramPost` table
2. **API:** Create `InstagramModule` with controller and service
3. **Admin:** Add `/admin/instagram` page with table UI and interactions
4. **Frontend:** Create `instagramService` in services folder
5. **Component:** Update `instagram-carousel.tsx` to use service
6. **Testing:** Verify CRUD operations and carousel functionality

---

## Supabase Configuration

**Actions:**
- Create PostgreSQL migration: `create table instagram_posts (...)`
- Or: run Prisma migration directly (`npx prisma migrate dev`)
- Ensure `DATABASE_URL` env var points to Supabase PostgreSQL instance

No additional Supabase features needed (standard PostgreSQL).

---

## Success Criteria

✅ Admin can create, read, update, delete Instagram posts
✅ Drag-and-drop reorder saves immediately
✅ Toggle active/inactive works and persists
✅ Public GET endpoint returns only active posts, sorted by order
✅ Instagram carousel displays posts from API (not hardcoded)
✅ Loading and error states handled gracefully
✅ All endpoints protected (admin auth for writes)

---

## Dependencies

- NestJS modules: `@nestjs/common`, `@nestjs/swagger` (existing)
- Prisma: `@prisma/client` (existing)
- Frontend: `apiClient` from existing config (existing)
- No new npm packages required

---

## Notes

- Admin auth uses existing `scandic_admin` cookie pattern
- All endpoints follow existing NestJS conventions
- Frontend service follows `DocumentsService` pattern
- No breaking changes to existing features
