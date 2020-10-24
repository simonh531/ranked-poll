import { SitemapStream, streamToPromise } from 'sitemap';
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
