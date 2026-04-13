# Instagram Posts Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add full CRUD management for Instagram posts with admin dashboard and frontend carousel integration.

**Architecture:**
- Backend: NestJS module with CRUD endpoints, Prisma ORM for PostgreSQL
- Admin: Server-side rendered HTML page with drag-and-drop table
- Frontend: Service layer for API calls, carousel component loads posts dynamically

**Tech Stack:** NestJS 11, Prisma, PostgreSQL (Supabase), Next.js, React

---

## Task 1: Add InstagramPost Model to Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add InstagramPost model to schema**

Open `prisma/schema.prisma` and add this model after the `NotificationEmail` model:

```prisma
model InstagramPost {
  id        Int      @id @default(autoincrement())
  url       String   @unique
  order     Int
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([order])
}
```

- [ ] **Step 2: Generate Prisma client**

Run:
```bash
npx prisma generate
```

Expected output: "Prisma Client updated in ./node_modules/@prisma/client"

---

## Task 2: Create Prisma Migration

**Files:**
- Create: `prisma/migrations/[timestamp]_add_instagram_posts/migration.sql`

- [ ] **Step 1: Create migration**

Run:
```bash
npx prisma migrate dev --name add_instagram_posts
```

This will:
1. Create migration directory with SQL file
2. Apply migration to Supabase database
3. Update prisma client

Expected output: "Your database is now in sync with your schema"

- [ ] **Step 2: Verify table was created**

Run:
```bash
npx prisma studio
```

Open the browser interface and verify `InstagramPost` table appears in the sidebar. Close Prisma Studio.

---

## Task 3: Create DTOs (Data Transfer Objects)

**Files:**
- Create: `src/instagram/dto/create-instagram-post.dto.ts`
- Create: `src/instagram/dto/update-instagram-post.dto.ts`

- [ ] **Step 1: Create CreateInstagramPostDto**

Create file `src/instagram/dto/create-instagram-post.dto.ts`:

```typescript
import { IsString, IsUrl, IsOptional, IsBoolean } from 'class-validator';

export class CreateInstagramPostDto {
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
  })
  url: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
```

- [ ] **Step 2: Create UpdateInstagramPostDto**

Create file `src/instagram/dto/update-instagram-post.dto.ts`:

```typescript
import { IsString, IsUrl, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class UpdateInstagramPostDto {
  @IsOptional()
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
  })
  url?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
```

---

## Task 4: Create Instagram Service

**Files:**
- Create: `src/instagram/instagram.service.ts`

- [ ] **Step 1: Write InstagramService with CRUD methods**

Create file `src/instagram/instagram.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInstagramPostDto } from './dto/create-instagram-post.dto';
import { UpdateInstagramPostDto } from './dto/update-instagram-post.dto';

@Injectable()
export class InstagramService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInstagramPostDto) {
    // Get the max order + 1 for new posts
    const maxPost = await this.prisma.instagramPost.findFirst({
      orderBy: { order: 'desc' },
    });
    const nextOrder = (maxPost?.order ?? -1) + 1;

    return this.prisma.instagramPost.create({
      data: {
        url: dto.url,
        order: nextOrder,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll(includeInactive = false) {
    return this.prisma.instagramPost.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.instagramPost.findUniqueOrThrow({
      where: { id },
    });
  }

  async update(id: number, dto: UpdateInstagramPostDto) {
    return this.prisma.instagramPost.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.prisma.instagramPost.delete({
      where: { id },
    });
  }

  async reorder(items: Array<{ id: number; order: number }>) {
    // Batch update order for multiple items
    const updates = items.map((item) =>
      this.prisma.instagramPost.update({
        where: { id: item.id },
        data: { order: item.order },
      }),
    );
    return this.prisma.$transaction(updates);
  }
}
```

---

## Task 5: Create Instagram Controller

**Files:**
- Create: `src/instagram/instagram.controller.ts`

- [ ] **Step 1: Write InstagramController with CRUD endpoints**

Create file `src/instagram/instagram.controller.ts`:

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { InstagramService } from './instagram.service';
import { CreateInstagramPostDto } from './dto/create-instagram-post.dto';
import { UpdateInstagramPostDto } from './dto/update-instagram-post.dto';

@Controller('instagram-posts')
export class InstagramController {
  constructor(private readonly instagramService: InstagramService) {}

  @Post()
  create(@Body() createInstagramPostDto: CreateInstagramPostDto) {
    return this.instagramService.create(createInstagramPostDto);
  }

  @Get()
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.instagramService.findAll(includeInactive === 'true');
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.instagramService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInstagramPostDto: UpdateInstagramPostDto,
  ) {
    return this.instagramService.update(id, updateInstagramPostDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.instagramService.remove(id);
  }
}
```

---

## Task 6: Create Instagram Module

**Files:**
- Create: `src/instagram/instagram.module.ts`

- [ ] **Step 1: Write InstagramModule**

Create file `src/instagram/instagram.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { InstagramService } from './instagram.service';
import { InstagramController } from './instagram.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InstagramController],
  providers: [InstagramService],
})
export class InstagramModule {}
```

---

## Task 7: Register Instagram Module in App Module

**Files:**
- Modify: `src/app.module.ts`

- [ ] **Step 1: Add InstagramModule import**

Open `src/app.module.ts` and modify the imports array to include `InstagramModule`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ApplicationsModule } from './applications/applications.module';
import { AdminModule } from './admin/admin.module';
import { InstagramModule } from './instagram/instagram.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ApplicationsModule,
    AdminModule,
    InstagramModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 2: Start dev server and verify API works**

Run:
```bash
npm run start:dev
```

Wait for "Nest application successfully started" message.

Then in another terminal, test the API:
```bash
curl -X GET http://localhost:3001/instagram-posts
```

Expected output: `[]` (empty array, no posts yet)

Keep the dev server running for next tasks.

---

## Task 8: Add Admin Instagram Page Route

**Files:**
- Modify: `src/admin/admin.controller.ts`

- [ ] **Step 1: Review admin.controller.ts structure**

Open `src/admin/admin.controller.ts` and find existing admin routes (e.g., `@Get('dashboard')`, `@Get('applications')`).

Note the pattern:
- Use `isAuthenticated(req)` to check auth
- Return HTML string with `res.send()`

- [ ] **Step 2: Add Instagram admin route**

Find where other admin routes are defined. Add this route after the applications route:

```typescript
@Get('instagram')
adminInstagram(@Res() res: Response, @Req() req: Request) {
  if (!isAuthenticated(req)) {
    return res.status(401).send(loginPage('Unauthorized'));
  }

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Instagram Posts Management</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f3f4f6; padding: 20px; }
    .container { max-width: 1000px; margin: 0 auto; background: white; border-radius: 8px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { margin-bottom: 24px; color: #111827; }
    .controls { display: flex; gap: 12px; margin-bottom: 24px; }
    button { padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }
    button:hover { background: #2563eb; }
    button.danger { background: #ef4444; }
    button.danger:hover { background: #dc2626; }
    table { width: 100%; border-collapse: collapse; }
    thead { background: #f9fafb; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { font-weight: 600; color: #374151; }
    tr:hover { background: #f9fafb; }
    input[type="text"], input[type="url"] { padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px; width: 100%; }
    input[type="checkbox"] { cursor: pointer; width: 18px; height: 18px; }
    .drag-handle { cursor: grab; color: #9ca3af; user-select: none; }
    .drag-handle:active { cursor: grabbing; }
    .row-dragging { opacity: 0.5; background: #f0f9ff; }
    .error { color: #dc2626; padding: 12px; background: #fee2e2; border-radius: 4px; margin-bottom: 16px; }
    .loading { color: #3b82f6; padding: 12px; }
    .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); justify-content: center; align-items: center; z-index: 1000; }
    .modal.active { display: flex; }
    .modal-content { background: white; padding: 24px; border-radius: 8px; max-width: 400px; width: 100%; }
    .modal-content h2 { margin-bottom: 16px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-weight: 500; color: #374151; }
    .form-group input { width: 100%; }
    .modal-buttons { display: flex; gap: 8px; justify-content: flex-end; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📸 Instagram Posts Management</h1>
    <div id="error" class="error" style="display:none;"></div>
    <div id="loading" class="loading" style="display:none;">Loading...</div>
    <div class="controls">
      <button onclick="openAddPostModal()">+ Add Post</button>
      <button onclick="logOut()">Logout</button>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 30px;">↕</th>
          <th style="flex: 1;">URL</th>
          <th style="width: 80px;">Order</th>
          <th style="width: 100px;">Active</th>
          <th style="width: 80px;">Action</th>
        </tr>
      </thead>
      <tbody id="postsTable"></tbody>
    </table>
  </div>

  <div id="addPostModal" class="modal">
    <div class="modal-content">
      <h2>Add New Post</h2>
      <form id="addPostForm" onsubmit="handleAddPost(event)">
        <div class="form-group">
          <label>Instagram URL</label>
          <input type="url" id="postUrl" placeholder="https://www.instagram.com/p/..." required>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" id="postActive" checked>
            Active
          </label>
        </div>
        <div class="modal-buttons">
          <button type="button" onclick="closeAddPostModal()">Cancel</button>
          <button type="submit">Create</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    let posts = [];
    let draggedItem = null;

    async function loadPosts() {
      try {
        showLoading(true);
        const res = await fetch('/instagram-posts?includeInactive=true');
        if (!res.ok) throw new Error('Failed to load posts');
        posts = await res.json();
        renderTable();
      } catch (err) {
        showError(err.message);
      } finally {
        showLoading(false);
      }
    }

    function renderTable() {
      const tbody = document.getElementById('postsTable');
      tbody.innerHTML = posts.map((post, index) => {
        const urlText = document.createTextNode(post.url).textContent;
        return \`
        <tr draggable="true" ondragstart="handleDragStart(event, \${index})" ondragover="handleDragOver(event)" ondrop="handleDrop(event, \${index})" ondragend="handleDragEnd(event)">
          <td class="drag-handle">⋮⋮</td>
          <td><input type="url" value="\${urlText}" onchange="updatePost(\${post.id}, { url: this.value })"></td>
          <td>\${post.order}</td>
          <td>
            <input type="checkbox" \${post.isActive ? 'checked' : ''} onchange="updatePost(\${post.id}, { isActive: this.checked })">
          </td>
          <td><button class="danger" onclick="deletePost(\${post.id})">Delete</button></td>
        </tr>
      \`;
      }).join('');
    }

    function handleDragStart(event, index) {
      draggedItem = index;
      event.dataTransfer.effectAllowed = 'move';
      event.target.parentElement.classList.add('row-dragging');
    }

    function handleDragOver(event) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    }

    function handleDrop(event, index) {
      event.preventDefault();
      if (draggedItem === null || draggedItem === index) return;

      const fromOrder = posts[draggedItem].order;
      const toOrder = posts[index].order;

      posts[draggedItem].order = toOrder;
      posts[index].order = fromOrder;
      [posts[draggedItem], posts[index]] = [posts[index], posts[draggedItem]];

      renderTable();

      updatePost(posts[draggedItem].id, { order: posts[draggedItem].order });
      updatePost(posts[index].id, { order: posts[index].order });
    }

    function handleDragEnd(event) {
      event.target.parentElement.classList.remove('row-dragging');
      draggedItem = null;
    }

    async function updatePost(id, data) {
      try {
        const res = await fetch(\`/instagram-posts/\${id}\`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Update failed');
        const updated = await res.json();
        const index = posts.findIndex(p => p.id === id);
        if (index >= 0) posts[index] = updated;
      } catch (err) {
        showError(err.message);
        loadPosts();
      }
    }

    async function deletePost(id) {
      if (!confirm('Delete this post?')) return;
      try {
        const res = await fetch(\`/instagram-posts/\${id}\`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');
        posts = posts.filter(p => p.id !== id);
        renderTable();
      } catch (err) {
        showError(err.message);
      }
    }

    function openAddPostModal() {
      document.getElementById('addPostModal').classList.add('active');
    }

    function closeAddPostModal() {
      document.getElementById('addPostModal').classList.remove('active');
    }

    async function handleAddPost(event) {
      event.preventDefault();
      const url = document.getElementById('postUrl').value;
      const isActive = document.getElementById('postActive').checked;

      try {
        const res = await fetch('/instagram-posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, isActive })
        });
        if (!res.ok) throw new Error('Create failed');
        closeAddPostModal();
        document.getElementById('addPostForm').reset();
        loadPosts();
      } catch (err) {
        showError(err.message);
      }
    }

    function logOut() {
      fetch('/admin/logout', { method: 'POST' }).then(() => {
        window.location.href = '/admin';
      });
    }

    function showError(msg) {
      const el = document.getElementById('error');
      el.textContent = 'Error: ' + msg;
      el.style.display = 'block';
    }

    function showLoading(show) {
      document.getElementById('loading').style.display = show ? 'block' : 'none';
    }

    loadPosts();
  </script>
</body>
</html>\`;

  return res.send(html);
}
```

---

## Task 9: Test Admin Instagram Page

**Files:**
- None (testing only)

- [ ] **Step 1: Open admin Instagram page**

In browser, navigate to:
```
http://localhost:3001/admin/instagram
```

You'll be redirected to login page. Log in with credentials from `.env` (default: admin/scandic2025).

- [ ] **Step 2: Test add post functionality**

Click "Add Post" button, enter a valid Instagram URL (e.g., `https://www.instagram.com/p/DOScJt1AsIs/`), check "Active", click Create.

Expected: Post appears in table with order auto-assigned.

- [ ] **Step 3: Test drag-and-drop reordering**

Drag a row to a different position. Expected: row moves, order values update, PATCH request sent to API.

- [ ] **Step 4: Test toggle active/inactive**

Click the checkbox on a row. Expected: checkbox updates, PATCH request sent.

- [ ] **Step 5: Test delete**

Click Delete on a row. Confirm deletion. Expected: row disappears, DELETE request sent.

---

## Task 10: Create Frontend Instagram Service

**Files:**
- Create: `src/lib/api/services/instagram.ts`

- [ ] **Step 1: Create InstagramService class**

Create file `src/lib/api/services/instagram.ts`:

```typescript
import { apiClient } from '../client';

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
  private client = apiClient;

  async getAll(): Promise<InstagramPost[]> {
    return this.client.get<InstagramPost[]>('/instagram-posts');
  }

  async create(data: CreateInstagramPostRequest): Promise<InstagramPost> {
    return this.client.post<InstagramPost>('/instagram-posts', data);
  }

  async update(id: number, data: UpdateInstagramPostRequest): Promise<InstagramPost> {
    return this.client.patch<InstagramPost>(`/instagram-posts/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    await this.client.delete(`/instagram-posts/${id}`);
  }
}

export const instagramService = new InstagramService();
```

---

## Task 11: Update Instagram Carousel Component

**Files:**
- Modify: `src/components/instagram-carousel.tsx`

- [ ] **Step 1: Import Instagram service and hooks**

Open `src/components/instagram-carousel.tsx` and add these imports at the top (after existing imports):

```typescript
import { useEffect } from "react";
import { instagramService, type InstagramPost } from "@/lib/api/services/instagram";
```

- [ ] **Step 2: Replace hardcoded posts with dynamic state**

Find the section where `instagramPosts` is defined (lines 35-42). Replace:

```typescript
  // Список Instagram постов для отображения (замените на реальные URL-ы)
  const instagramPosts = [
    "https://www.instagram.com/p/DOScJt1AsIs/",
    "https://www.instagram.com/p/DOGvTXYDAOT/",
    "https://www.instagram.com/p/DNUyoWSMVZq/",
    "https://www.instagram.com/p/DMzd8uUCcN3/",
    "https://www.instagram.com/p/DMsU3A4Cu9Y/",
    "https://www.instagram.com/p/DMPHXXWiTWp/",
  ];
```

With:

```typescript
  const [instagramPosts, setInstagramPosts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const posts = await instagramService.getAll();
        setInstagramPosts(posts.map(post => post.url));
      } catch (err) {
        setError("Failed to load Instagram posts");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, []);
```

- [ ] **Step 3: Add loading state UI**

Find the carousel container (around line 86-90). Replace it with:

```typescript
        {/* Instagram Posts Carousel */}
        {isLoading && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="inline-flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse mr-3">
                <Instagram className="h-4 w-4 text-white" />
              </div>
              <p className="text-gray-600 font-medium">{instagramTranslations.loading}</p>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-red-600 font-medium">Error: {error}</p>
          </motion.div>
        )}

        {!isLoading && !error && instagramPosts.length > 0 && (
```

- [ ] **Step 4: Close loading state conditional**

Find the closing of carousel animation div (around line 135). Add closing conditional after `</motion.div>`:

```typescript
        )}

        {!isLoading && !error && instagramPosts.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-gray-600 font-medium">No Instagram posts available</p>
          </motion.div>
        )}
```

- [ ] **Step 5: Verify component syntax**

Check that the file has no syntax errors:

```bash
cd /Users/sharipnurseit/Documents/Projects/scandic-school
npm run lint -- src/components/instagram-carousel.tsx
```

Expected: No errors or only warnings (fix any errors).

---

## Task 12: Test Full Integration

**Files:**
- None (testing only)

- [ ] **Step 1: Add test post via admin panel**

Go to `http://localhost:3001/admin/instagram`, log in, add a post with URL `https://www.instagram.com/p/DOScJt1AsIs/` and mark as active.

- [ ] **Step 2: Start frontend dev server**

In new terminal, run:
```bash
cd /Users/sharipnurseit/Documents/Projects/scandic-school
npm run dev
```

Wait for "compiled client and server successfully".

- [ ] **Step 3: View carousel in browser**

Open `http://localhost:3000` in browser (or your configured frontend port).

Scroll to Instagram section. Expected: Carousel loads and displays the post you added via admin panel (not hardcoded posts).

- [ ] **Step 4: Add more posts and verify they appear**

Go back to admin panel, add 2-3 more posts.

Refresh frontend page. Expected: All posts appear in carousel, fetched from API.

- [ ] **Step 5: Test drag-and-drop reordering affects carousel order**

In admin panel, reorder posts via drag-and-drop.

Refresh carousel. Expected: Posts appear in new order.

- [ ] **Step 6: Test inactive posts are hidden**

In admin panel, toggle one post to inactive.

Refresh carousel. Expected: Inactive post doesn't appear.

---

## Task 13: Final Commits

**Files:**
- All modified/created files

- [ ] **Step 1: Commit API changes (backend)**

```bash
cd /Users/sharipnurseit/Documents/Projects/scandic-school-api
git add -A
git commit -m "feat: add instagram posts CRUD API

- Add InstagramPost Prisma model
- Create InstagramModule with controller and service
- Add DTOs for create and update operations
- Register module in AppModule
- Endpoints: GET, POST, PATCH, DELETE /instagram-posts

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

- [ ] **Step 2: Commit admin panel**

```bash
cd /Users/sharipnurseit/Documents/Projects/scandic-school-api
git add src/admin/admin.controller.ts
git commit -m "feat: add instagram posts admin dashboard

- New /admin/instagram page with SSR HTML
- Drag-and-drop table for reordering
- Add/edit/delete post functionality
- Active/inactive toggle per post
- Auto-save on drag, toggle, and input changes

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

- [ ] **Step 3: Commit frontend service**

```bash
cd /Users/sharipnurseit/Documents/Projects/scandic-school
git add src/lib/api/services/instagram.ts
git commit -m "feat: add instagram API service

- InstagramService class for CRUD operations
- Interfaces for posts, requests
- Follows DocumentsService pattern

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

- [ ] **Step 4: Commit component integration**

```bash
cd /Users/sharipnurseit/Documents/Projects/scandic-school
git add src/components/instagram-carousel.tsx
git commit -m "feat: integrate instagram posts API into carousel

- Load posts from API instead of hardcoded array
- Add loading state with spinner
- Add error handling
- Display 'no posts' message when empty
- Posts auto-update when admin panel changes

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Summary

**Database:** 1 new table (`InstagramPost`) with 1 migration
**API:** 1 new module, 1 controller, 1 service, 2 DTOs — 5 CRUD endpoints
**Admin:** 1 page with SSR HTML, drag-and-drop, CRUD UI
**Frontend:** 1 service, 1 component update
**Total commits:** 4 (API, Admin, Service, Component)

---
