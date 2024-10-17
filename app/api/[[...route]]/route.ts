import { Hono } from 'hono';
import { handle } from 'hono/vercel';

import authors from './authors';
import books from './books';

export const runtime = 'edge';

const app = new Hono().basePath('/api');

app.route('/books', books);
app.route('/authors', authors);

export const GET = handle(app);
export const POST = handle(app);