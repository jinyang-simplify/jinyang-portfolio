CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 30),
  message TEXT NOT NULL CHECK (length(message) BETWEEN 4 AND 500),
  paper TEXT NOT NULL DEFAULT 'lined' CHECK (paper IN ('lined', 'grid', 'dots', 'plain')),
  created_at TEXT NOT NULL,
  is_visible INTEGER NOT NULL DEFAULT 1 CHECK (is_visible IN (0, 1))
);

CREATE INDEX IF NOT EXISTS messages_public_created_at
ON messages (is_visible, created_at DESC);
