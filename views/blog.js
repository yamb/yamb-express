const entities = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

function escape(value) {
  return String(value).replace(/[&<>"']/g, (character) => entities[character]);
}

function page(title, content) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escape(title)}</title>
</head>
<body>
  <main>
    ${content}
  </main>
</body>
</html>`;
}

function item(post) {
  const title = escape(post.title);
  const link =
    post.status === 'published' ? `<a href="${escape(post.url().pathname)}">${title}</a>` : title;

  return `<li>${link} (${post.status}) <a href="/posts/${encodeURIComponent(post.id)}">Edit</a></li>`;
}

export function index(posts) {
  return page(
    'Posts',
    `<h1>Posts</h1>
    <p><a href="/posts/new">New post</a></p>
    <ul>
      ${posts.map(item).join('\n      ')}
    </ul>`
  );
}

export function article(title, body) {
  return page(
    title,
    `<article>
      <h1>${escape(title)}</h1>
      ${body}
    </article>
    <a href="/">All posts</a>`
  );
}

export function form({ id, title = '', text = '', status = 'draft' }, error) {
  const heading = id ? 'Edit post' : 'New post';
  const action = id ? `/posts/${encodeURIComponent(id)}` : '/posts';
  const option = (value) => `<option${value === status ? ' selected' : ''}>${value}</option>`;

  return page(
    heading,
    `<h1>${heading}</h1>
    ${error ? `<p role="alert">${escape(error)}</p>` : ''}
    <form method="post" action="${action}">
      <p><label>Title <input name="title" value="${escape(title)}" required></label></p>
      <p><label>Text <textarea name="text" rows="12">${escape(text)}</textarea></label></p>
      <p><label>Status <select name="status">${option('draft')}${option('published')}</select></label></p>
      <p><button>Save</button></p>
    </form>
    ${id ? `<form method="post" action="${action}/delete"><button>Delete</button></form>` : ''}
    <a href="/">All posts</a>`
  );
}
