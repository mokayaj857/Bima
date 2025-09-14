# Strapi Connection Setup

## Quick Setup

1. **Create `.env.local` file in your client directory:**

```bash
# Strapi server URL
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_URL=http://localhost:1337

# Your Strapi API token (if you have private content)
STRAPI_TOKEN=your_token_here

# API paths (usually these defaults work)
STRAPI_COURSES_PATH=/api/courses
STRAPI_LESSONS_PATH=/api/lessons
```

2. **Start your Strapi server** (usually on port 1337)

3. **Start your Next.js app:** `npm run dev`

## What This Does

- **Fetches course content** from Strapi and displays it in your existing UI
- **Fetches lesson content** from Strapi and shows it below the course
- **No UI changes** - just connects your existing design to Strapi data

## Debug Features Added

- Console logs show what data is fetched from Strapi
- Yellow debug boxes show the raw content from each lesson
- Remove these debug features once everything is working

## Strapi Content Fields Needed

**Courses:**
- `title` - Course title
- `content` - Course description/overview
- `category` - Course category
- `publishedAt` - Publication date
- `readTime` - Reading time
- `imagescontent` or `image` - Course image

**Lessons:**
- `title` - Lesson title  
- `content` - Lesson content (the actual wording/text)
- `image` - Lesson image
- `order` - Lesson sequence number
- `course` - Relation to parent course

## Testing

1. Navigate to any course page
2. Check browser console for Strapi data logs
3. Look for yellow debug boxes showing lesson content
4. If you see content, the connection is working!

## Remove Debug Features

Once everything works, remove:
- Console.log statements
- Yellow debug boxes
- This config file
