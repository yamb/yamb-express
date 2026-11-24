import { PostStatusError, PostValidationError, UriTakenError } from 'yamb/errors';
import { IdSchema, UriSchema } from 'yamb/schemas';

import * as views from '../views/blog.js';

const invalid = [PostStatusError, PostValidationError, UriTakenError];

async function save(res, post, { title, text, status }) {
  try {
    Object.assign(post, { title, text, status });
    await post.save();

    res.redirect(303, '/');
  } catch (error) {
    if (!invalid.some((type) => error instanceof type)) {
      throw error;
    }

    const values = { id: post.id, title, text, status };

    res.status(422).send(views.form(values, error.message));
  }
}

export function controller(blog) {
  const find = (id) => (IdSchema.safeParse(id).success ? blog.find(id) : null);

  return {
    async index(_req, res) {
      const posts = await blog.all().toArray();

      res.send(views.index(posts));
    },

    async article(req, res) {
      const { year, month, slug } = req.params;
      const uri = `${year}/${month}/${slug}`;
      const post = UriSchema.safeParse(uri).success ? await blog.fetch(uri) : null;

      if (post?.status !== 'published') {
        res.sendStatus(404);

        return;
      }

      const { body } = await post.render('html');

      res.send(views.article(post.title, body));
    },

    add(_req, res) {
      res.send(views.form({}));
    },

    async create(req, res) {
      await save(res, blog.build(), req.body);
    },

    async edit(req, res) {
      const post = await find(req.params.id);

      if (post) {
        res.send(views.form(post));
      } else {
        res.sendStatus(404);
      }
    },

    async update(req, res) {
      const post = await find(req.params.id);

      if (post) {
        await save(res, post, req.body);
      } else {
        res.sendStatus(404);
      }
    },

    async remove(req, res) {
      const post = await find(req.params.id);

      if (post) {
        await post.remove();
        res.redirect(303, '/');
      } else {
        res.sendStatus(404);
      }
    }
  };
}
