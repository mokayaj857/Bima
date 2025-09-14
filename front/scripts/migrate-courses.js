#!/usr/bin/env node
/*
 Migration: fill in missing image and content for existing Strapi Course entries.
 - Reads STRAPI_URL, STRAPI_TOKEN from .env.local (or process env)
 - Loads mapping from scripts/migrate-courses-map.json: [{ id, imageUrl, content, title? }, ...]
 - For each course id, uploads image (if provided) and updates fields via REST
 - Supports Strapi v4/v5 by accepting both flattened and attributes-wrapped bodies
*/

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const FormData = require('form-data');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;
const COURSES_PATH = process.env.STRAPI_COURSES_PATH || '/api/courses';

if (!STRAPI_TOKEN) {
  console.error('Missing STRAPI_TOKEN. Create a read/write token and put it in client/.env.local');
  process.exit(1);
}

const mappingPath = path.join(__dirname, 'migrate-courses-map.json');
if (!fs.existsSync(mappingPath)) {
  fs.writeFileSync(mappingPath, JSON.stringify([
    { id: 1, imageUrl: 'https://www.google.com/imgres?q=ai&imgurl=https%3A%2F%2Fbeconnected.esafety.gov.au%2Fpluginfile.php%2F99437%2Fmod_resource%2Fcontent%2F2%2Fwhat-is-ai%2520%25281%2529.jpg&imgrefurl=https%3A%2F%2Fbeconnected.esafety.gov.au%2Ftopic-library%2Farticles-and-tips%2Fwhat-is-ai&docid=J99FPk0-Rzpp5M&tbnid=EDzB-AIyO5rpbM&vet=12ahUKEwie5MOG1ZmPAxU1SKQEHVjVCkQQM3oECBUQAA..i&w=1130&h=616&hcb=2&ved=2ahUKEwie5MOG1ZmPAxU1SKQEHVjVCkQQM3oECBUQAA', content: 'Course content here', title: 'Optional title' }
  ], null, 2));
  console.log('Created template mapping at scripts/migrate-courses-map.json. Edit it and re-run.');
  process.exit(0);
}

/** Fetch JSON helper */
async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${text}`);
    return json;
  } catch (e) {
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${text}`);
    throw e;
  }
}

/** Download an image into a Buffer */
function download(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client
      .get(url, (resp) => {
        if (resp.statusCode && resp.statusCode >= 400) {
          reject(new Error(`Download failed ${resp.statusCode}`));
          return;
        }
        const data = [];
        resp.on('data', (d) => data.push(d));
        resp.on('end', () => resolve(Buffer.concat(data)));
      })
      .on('error', reject);
  });
}

/** Upload image to Strapi upload plugin, return file id */
async function uploadImageFromUrl(imageUrl) {
  const buf = await download(imageUrl);
  const form = new FormData();
  const filename = path.basename(new URL(imageUrl).pathname) || 'upload.jpg';
  form.append('files', buf, { filename });

  const res = await fetch(`${STRAPI_URL}/api/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      // form.getHeaders() will be merged by fetch implementation in Node18+
    },
    body: form,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Upload failed: ${res.status} ${JSON.stringify(json)}`);
  const file = Array.isArray(json) ? json[0] : json;
  return file?.id;
}

/** Update a course by id with content and optional image relation */
const MEDIA_FIELD = process.env.STRAPI_COURSE_MEDIA_FIELD || 'imagescontent';

async function updateCourse(id, { content, title, imageFileId }) {
  // body supports v4 (data wrapper) and v5 (flattened). We'll use flattened fields commonly working in v5.
  const body = { content };
  if (title) body.title = title;
  if (imageFileId) {
    // Write to your specific media field
    body[MEDIA_FIELD] = imageFileId;
  }
  try {
    // Try flattened (v5)
    await fetchJson(`${STRAPI_URL}${COURSES_PATH}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    return;
  } catch (e1) {
    // Fallback: v4 data wrapper
    await fetchJson(`${STRAPI_URL}${COURSES_PATH}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data: body }),
    });
  }
}

(async () => {
  const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
  for (const entry of mapping) {
    const { id, imageUrl, content, title } = entry;
    try {
      let fileId = null;
      if (imageUrl) {
        fileId = await uploadImageFromUrl(imageUrl);
        console.log(`Uploaded image for course ${id}, fileId=${fileId}`);
      }
      await updateCourse(id, { content, title, imageFileId: fileId });
      console.log(`Updated course ${id}`);
    } catch (err) {
      console.error(`Failed to update course ${id}:`, err.message);
    }
  }
})();


