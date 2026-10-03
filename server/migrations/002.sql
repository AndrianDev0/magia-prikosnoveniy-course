ALTER TABLE course_leads DROP CONSTRAINT IF EXISTS course_leads_status_check;
ALTER TABLE course_leads ADD CONSTRAINT course_leads_status_check CHECK(status IN ('pending','confirmed','rejected','refund_requested','refunded'));
ALTER TABLE course_leads ADD COLUMN bank_reference text UNIQUE;
ALTER TABLE course_leads ADD COLUMN confirmed_at timestamptz;
ALTER TABLE course_leads ADD COLUMN refund_reference text UNIQUE;
ALTER TABLE course_leads ADD COLUMN refunded_at timestamptz;
ALTER TABLE course_admin_audit ADD COLUMN bank_reference text;
-- Earlier confirmations had no uniquely reconciled bank operation. Recheck them
-- before any future entitlement can be derived from the payment status.
INSERT INTO course_admin_audit(lead_id,actor,old_status,new_status,note)
SELECT id,'migration-002','confirmed','pending','Повторная сверка в банке обязательна: старое подтверждение не содержит номера операции'
FROM course_leads WHERE status='confirmed';
UPDATE course_leads SET status='pending',evidence_mode='legacy-recheck-required',version=version+1 WHERE status='confirmed';
CREATE TABLE IF NOT EXISTS course_contact_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  lead_id uuid NOT NULL REFERENCES course_leads(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  actor text NOT NULL,
  old_email text NOT NULL,
  new_email text NOT NULL,
  note text NOT NULL
);
