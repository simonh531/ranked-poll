# How to Contribute

Thanks for your interest in contributing! Ranked Poll doesn't have all major features features like user accounts yet so I don't really want contributions to the backend right now, though I may be convinced otherwise. The front-end however can use a lot of improvements so feel free to try your hand at that if you'd like! 

You'll want to clone and make pull requests to the development branch. It is hosted at https://ranked-poll.vercel.app/. When it is verified as stable, it is merged to main which goes to https://rankedpoll.com.

Ranked Poll uses [PostgreSQL](https://www.postgresql.org/download/) as a database so you'll need to install that.

## PostgreSQL Database

At the time of this writing, you'll only need to run these queries on your Postgres database to run Ranked Poll.

Create the protection type first:
```sql
CREATE TYPE public.protection AS ENUM
    ('ip', 'cookie_id', 'user_id', 'none');
```

Then create the poll table:
```sql
CREATE TABLE public.poll
(
    id text COLLATE pg_catalog."default" NOT NULL,
    owner_id uuid,
    title text COLLATE pg_catalog."default",
    description text COLLATE pg_catalog."default",
    options text[] COLLATE pg_catalog."default" NOT NULL,
    color smallint[] NOT NULL,
    randomize boolean NOT NULL DEFAULT true,
    protection protection NOT NULL DEFAULT 'cookie_id'::protection,
    created_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    edited_at timestamp with time zone,
    CONSTRAINT poll_pkey PRIMARY KEY (id)
)
```

And finally create the vote table:
```sql
CREATE TABLE public.vote
(
    id uuid NOT NULL,
    user_id uuid,
    cookie_id text COLLATE pg_catalog."default",
    ip text COLLATE pg_catalog."default",
    poll_id text COLLATE pg_catalog."default" NOT NULL,
    vote text[] COLLATE pg_catalog."default" NOT NULL DEFAULT '{}'::text[],
    low_vote text[] COLLATE pg_catalog."default" NOT NULL DEFAULT '{}'::text[],
    created_at timestamp with time zone DEFAULT now(),
    edited_at timestamp with time zone,
    deleted_at timestamp with time zone,
    CONSTRAINT vote_pkey PRIMARY KEY (id),
    CONSTRAINT vote_poll_id_fkey FOREIGN KEY (poll_id)
        REFERENCES public.poll (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)
```

## Contentful

Ranked Poll's about pages are mostly built from [Contentful](https://www.contentful.com/) data. You only really need to do this if you want to modify the about pages so you may skip this if you are not interested.

You'll need to create a Contentful account if you don't already have one and then create a Content model called "Page." Within it, create a Short text field called "Title" and check the box to make it the Entry title as well. Create an Integer field called "Priority" and a Long text field called "Content".

Under the Content tab you can create pages that will show up in the about section. A page with the title "Intro" is used as the index for about so that should be created first.

## Environment Variables

The backend uses [pg](https://www.npmjs.com/package/pg) to query your Postgres database so you'll need to create .env.development with variables outlined in their [documentation](https://node-postgres.com/features/connecting).

If you set up Contentful, you'll also need to set CONTENTFUL_HOST which will be either preview.contentful.com or cdn.contentful.com, CONTENTFUL_SPACE, and CONTENTFUL_ACCESS_TOKEN according to your API keys in settings.

Finally, run with: 
```bash
npm run dev
```
