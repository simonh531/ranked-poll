import { SitemapStream, streamToPromise } from 'sitemap';
import { createClient } from 'contentful';
import Cursor from 'pg-cursor';
import Pool from '../../postgresPool';

const write = async (cursor, stream) => {
  cursor.read(100, async (err, rows) => {
    if (err) {
      throw err;
    }
    if (rows.length) {
      rows.forEach((row) => {
        stream.write({
          url: `/poll/${row.id}`,
          lastmod: row.created_at,
        });
      });
      await write(cursor, stream);
    } else {
      stream.end();
    }
  });
};

export default async (req, res) => {
  try {
    const smStream = new SitemapStream({
      hostname: `https://${req.headers.host}`,
    });

    smStream.write({
      url: '',
      priority: 1,
    });

    smStream.write({
      url: '/about',
      priority: 0.8,
    });

    const contentfulClient = createClient({
      space: process.env.CONTENTFUL_SPACE,
      accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
      host: process.env.CONTENTFUL_HOST,
    });

    const entries = await contentfulClient.getEntries({
      content_type: 'page',
      select: 'fields.title',
    });

    entries.items.forEach(({ fields }) => {
      if (fields.title !== 'Intro') {
        smStream.write({
          url: `/about/${fields.title}`,
          priority: 0.7,
        });
      }
    });

    smStream.write({
      url: '/about/Calculation',
      priority: 0.7,
    });

    const text = 'SELECT id, created_at FROM poll ORDER BY created_at';
    const client = await Pool.connect();
    const cursor = client.query(new Cursor(text));

    await write(cursor, smStream);

    // XML sitemap string
    const sitemapOutput = (await streamToPromise(smStream)).toString();

    // Change headers
    res.writeHead(200, {
      'Content-Type': 'application/xml',
    });

    // Display output to user
    res.end(sitemapOutput);
  } catch (e) {
    console.log(e);
    res.send(JSON.stringify(e));
  }
};
