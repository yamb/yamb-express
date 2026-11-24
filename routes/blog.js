import express from 'express';

import { controller } from '../controllers/blog.js';

function trusted(base) {
  return (req, res, next) => {
    const host = req.get('host') === base.host;
    const origin = req.method !== 'POST' || req.get('origin') === base.origin;

    if (host && origin) {
      next();
    } else {
      res.sendStatus(403);
    }
  };
}

export function routes(blog, base) {
  const posts = controller(blog);

  return express
    .Router({ strict: true })
    .use(trusted(base), express.urlencoded({ limit: '10mb' }))
    .get('/', posts.index)
    .get('/posts/new', posts.add)
    .post('/posts', posts.create)
    .get('/posts/:id', posts.edit)
    .post('/posts/:id', posts.update)
    .post('/posts/:id/delete', posts.remove)
    .get('/:year/:month/:slug', posts.article);
}
