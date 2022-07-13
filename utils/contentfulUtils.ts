import { ContentfulClientApi, Entry } from 'contentful';

// eslint-disable-next-line import/prefer-default-export
export async function getAboutPages(
  client: ContentfulClientApi,
  currentTitle?:string,
):Promise<[string[], string|undefined]> {
  const entries = await client.getEntries<{title:string, priority:number}>({
    content_type: 'aboutPage',
    select: 'fields.title,fields.priority',
  });
  entries.items.push(
    { fields: { title: 'Calculation', priority: 4 } } as Entry<{title:string, priority:number}>,
  );

  let id:string|undefined;
  const pages = entries.items.sort(
    (entry1, entry2) => {
      if ( // logic for negative values indicating from end
        (entry1.fields.priority > 0 && entry2.fields.priority > 0)
        || (entry1.fields.priority < 0 && entry2.fields.priority < 0)
      ) {
        return entry1.fields.priority - entry2.fields.priority;
      }
      if (entry1.fields.priority < 0) {
        return 1;
      }
      return -1;
    },
  ).map(({ fields, sys }) => {
    if (fields.title === currentTitle) {
      id = sys.id;
    }
    return fields.title;
  });
  return [pages, id];
}
