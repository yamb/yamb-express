import { yamb } from 'yamb';
import { markdown } from 'yamb-markdown';
import { html } from 'yamb-render-html';
import { files } from 'yamb-storage-files';
import { prepare } from 'yamb/transform';

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
