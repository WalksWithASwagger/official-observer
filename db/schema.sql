CREATE TABLE IF NOT EXISTS entities (
  id text PRIMARY KEY,
  type text NOT NULL,
  name text NOT NULL,
  blurb text,
  initiatives jsonb NOT NULL DEFAULT '[]'::jsonb,
  region text,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  links jsonb NOT NULL DEFAULT '[]'::jsonb,
  join_url text,
  next_date text
);

CREATE TABLE IF NOT EXISTS relationships (
  source text NOT NULL,
  target text NOT NULL,
  type text NOT NULL,
  weight real,
  PRIMARY KEY (source, target, type)
);
