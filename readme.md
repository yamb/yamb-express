# Yamb on Express

[![Build status][github-actions-image]][github-actions-url]

A small Express blog built on [Yamb](https://github.com/yamb/yamb). Express handles HTTP, and Yamb keeps posts as Markdown files and renders them as HTML. Read the code as an example of where the line between the two runs.

## Quick start

Use Node.js 26.13 and pnpm 12.23.

```bash
pnpm install --frozen-lockfile
pnpm start
```

Open the [local blog](http://127.0.0.1:3000/) and select **New post**. Enter a title and Markdown text, choose `published` and select **Save**. The title in the list opens the rendered post, and **Edit** changes or deletes it.

The editor has no authentication. The server listens on `127.0.0.1` only, answers only requests addressed to that address and rejects form submissions from other origins.

## How Yamb fits into Express

Express knows requests and responses. Yamb knows posts: their IDs and URIs, draft and published status, validation, storage and rendering. Neither reaches into the other, and the [controller](controllers/blog.js) is the only place where they meet.

| Express | Yamb |
| --- | --- |
| Routes, form parsing, status codes and redirects | Post fields, validation and unique URIs |
| Host and Origin checks | Markdown files in `.data/posts`, owned by one process |
| Pages and forms | Markdown converted to sanitized HTML |

The [model](models/blog.js) is the same file in [yamb-hono](https://github.com/yamb/yamb-hono) and [yamb-bun](https://github.com/yamb/yamb-bun). Moving the blog to another framework rewrites the routes, controller and views and leaves Yamb as it is. Moving the posts to [SQLite](https://github.com/yamb/storage-sqlite) or [MongoDB](https://github.com/yamb/storage-mongo) changes the storage in the model and nothing in Express.

### The model opens Yamb

```js
export async function open(resources, { base, path = '.data/posts' }) {
  const md = resources.use(markdown());
  const stages = [md, md.html(), md.clean()];

  const blog = resources.use(
    yamb({
      storage: files({ path }),
      renderers: {
        html: html({
          prepare: (source, ctx) => prepare(source, stages, { ...ctx, base })
        })
      }
    })
  );

  return blog.open();
}
```

[yamb-markdown](https://github.com/yamb/markdown) runs in a worker. Its three stages parse the Markdown source, convert it to HTML and sanitize that HTML, so a page can insert the result without escaping it again. `prepare` connects the stages to the [HTML renderer](https://github.com/yamb/render-html) and passes `base`, the server address that relative links and images in a post resolve against.

`blog.open()` takes the posts directory for this process and loads the index of IDs and URIs. Both the worker and the blog go into `resources`, so the server decides when they close.

### The server owns the lifetime

```js
await using resources = new AsyncDisposableStack();

const blog = await open(resources, {
  base,
  path: process.env.YAMB_POSTS_DIR
});

const app = express();
app.set('env', 'production');
app.use(routes(blog, base));

const server = app.listen(port, hostname);
await once(server, 'listening');

await using listener = server;
base.port = String(listener.address().port);
```

On `SIGINT` or `SIGTERM`, disposal runs in reverse order: the HTTP server stops first, then Yamb closes the storage and releases the directory, then the Markdown worker exits. A request in progress never finds the blog closed.

With `PORT=0` the system picks a free port, so the server writes the real port back into `base` once it listens. Post links and the Host check read the same `base` object and follow it.

### The controller translates between HTTP and posts

Each action asks Yamb for posts: `blog.all()` for the list, `blog.find(id)` for the editor, `blog.fetch(uri)` for a public page and `blog.build()` for a new post. An ID from the path is checked with Yamb's own `IdSchema` first, and `blog.fetch` returns `null` for a path that is not a post URI, so a malformed path is a plain 404. Only published posts are served publicly; drafts stay in the editor.

```js
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
```

`post.save()` validates the post, derives its slug and URI and writes it. A mistake the author can fix, such as an empty title, an unknown status or a URI another post already uses, arrives as `PostValidationError`, `PostStatusError` or `UriTakenError`, and the form comes back with status 422 and the message. Any other error goes on to Express and becomes a 500.

### The views insert prepared HTML

`post.render('html')` returns the sanitized body, and the [views](views/blog.js) insert it as it is. Everything else on the page, such as titles, form values and error messages, is plain text and goes through `escape`.

## Reference

### Configuration

`PORT` defaults to `3000`. `YAMB_POSTS_DIR` defaults to `.data/posts` relative to the working directory. Only one process can open the posts directory at a time.

### Routes

| Request                   | Action                             |
| ------------------------- | ---------------------------------- |
| `GET /`                   | List every post                    |
| `GET /posts/new`          | Show the form for a new post       |
| `POST /posts`             | Create a post                      |
| `GET /posts/:id`          | Show the form for an existing post |
| `POST /posts/:id`         | Update the post                    |
| `POST /posts/:id/delete`  | Delete the post                    |
| `GET /:year/:month/:slug` | Show a published post              |

## Author

[Alexey Simonenko](https://simonenko.xyz)

## License

MIT. See `LICENSE`.

[github-actions-image]: https://github.com/yamb/yamb-express/actions/workflows/ci.yml/badge.svg
[github-actions-url]: https://github.com/yamb/yamb-express/actions/workflows/ci.yml
