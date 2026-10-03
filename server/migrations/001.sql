CREATE TABLE IF NOT EXISTS course_leads (
  id uuid PRIMARY KEY,
  idempotency_hash text UNIQUE NOT NULL,
  input_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  plan_id text NOT NULL CHECK(plan_id IN ('standard','vip','vip-plus')),
  amount_rub integer NOT NULL CHECK(amount_rub > 0),
  status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','rejected')),
  version integer NOT NULL DEFAULT 1,
  acknowledgments jsonb NOT NULL,
  evidence_mode text NOT NULL DEFAULT 'server-received'
);
CREATE INDEX IF NOT EXISTS course_leads_created_idx ON course_leads(created_at DESC);
CREATE TABLE IF NOT EXISTS course_admin_sessions (
  token_hash text PRIMARY KEY,
  credential_hash text NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS course_admin_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  lead_id uuid NOT NULL REFERENCES course_leads(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  actor text NOT NULL,
  old_status text NOT NULL,
  new_status text NOT NULL,
  note text NOT NULL
);
CREATE TABLE IF NOT EXISTS course_rate_limits (
  key_hash text PRIMARY KEY,
  count integer NOT NULL,
  expires_at timestamptz NOT NULL
);
