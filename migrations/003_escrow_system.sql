-- Migration: Escrow System
-- Adds escrow tracking, payment proof, and transaction audit trail

-- Add escrow-related fields to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS escrow_status TEXT DEFAULT 'pending_payment' CHECK (escrow_status IN ('pending_payment', 'payment_submitted', 'verified_held', 'pending_release', 'released', 'disputed', 'refunded')),
ADD COLUMN IF NOT EXISTS escrow_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS freelancer_payout_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS platform_fee_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS platform_fee_percentage DECIMAL(5, 2) DEFAULT 5.00,
ADD COLUMN IF NOT EXISTS payment_proof_url TEXT,
ADD COLUMN IF NOT EXISTS payment_submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS escrow_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS escrow_verified_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS escrow_release_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS escrow_released_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS escrow_released_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS contact_shared_at TIMESTAMPTZ;

-- Create escrow_transactions table for audit trail
CREATE TABLE IF NOT EXISTS escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment_submitted', 'payment_verified', 'release_requested', 'payment_released', 'refund_issued', 'dispute_opened')),
  amount DECIMAL(10, 2),
  transaction_id TEXT, -- External transaction ID (bank transfer, OMT, etc.)
  payment_method TEXT, -- 'bank_transfer', 'omt', 'whish', 'crypto', 'other'
  notes TEXT,
  performed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB -- For additional transaction details
);

-- Create index for querying transactions by project
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_project_id ON escrow_transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_created_at ON escrow_transactions(created_at DESC);

-- Row Level Security for escrow_transactions
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;

-- Admins can see all transactions
CREATE POLICY "Admins can view all escrow transactions"
  ON escrow_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Project participants can see their project transactions
CREATE POLICY "Project participants can view their escrow transactions"
  ON escrow_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = escrow_transactions.project_id
      AND (projects.client_id = auth.uid() OR projects.freelancer_id = auth.uid())
    )
  );

-- Only admins can insert escrow transactions
CREATE POLICY "Only admins can create escrow transactions"
  ON escrow_transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Update RLS policies for projects to handle escrow fields
-- Clients can update payment_proof_url and payment_submitted_at
CREATE POLICY "Clients can submit payment proof"
  ON projects FOR UPDATE
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- Function to calculate platform fee and payout amounts
CREATE OR REPLACE FUNCTION calculate_escrow_amounts(
  budget_amount DECIMAL,
  fee_percentage DECIMAL
)
RETURNS TABLE (
  escrow_amount DECIMAL,
  platform_fee DECIMAL,
  freelancer_payout DECIMAL
) AS $$
BEGIN
  RETURN QUERY SELECT
    budget_amount AS escrow_amount,
    ROUND(budget_amount * (fee_percentage / 100), 2) AS platform_fee,
    ROUND(budget_amount - (budget_amount * (fee_percentage / 100)), 2) AS freelancer_payout;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-update escrow amounts when project budget changes
CREATE OR REPLACE FUNCTION update_escrow_amounts()
RETURNS TRIGGER AS $$
DECLARE
  fee_pct DECIMAL;
  amounts RECORD;
BEGIN
  -- Use platform fee percentage (default 5%)
  fee_pct := COALESCE(NEW.platform_fee_percentage, 5.00);

  -- Calculate amounts based on proposed_budget or budget_max
  SELECT * INTO amounts
  FROM calculate_escrow_amounts(
    COALESCE(NEW.budget_max, 0),
    fee_pct
  );

  NEW.escrow_amount := amounts.escrow_amount;
  NEW.platform_fee_amount := amounts.platform_fee;
  NEW.freelancer_payout_amount := amounts.freelancer_payout;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate escrow amounts on insert/update
CREATE TRIGGER trigger_update_escrow_amounts
  BEFORE INSERT OR UPDATE OF budget_max, platform_fee_percentage
  ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_escrow_amounts();

-- Function to log escrow state changes and share contact info when payment verified
CREATE OR REPLACE FUNCTION log_escrow_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Log payment submission
  IF OLD.escrow_status IS DISTINCT FROM NEW.escrow_status THEN
    IF NEW.escrow_status = 'payment_submitted' THEN
      INSERT INTO escrow_transactions (
        project_id,
        transaction_type,
        amount,
        performed_by,
        notes
      ) VALUES (
        NEW.id,
        'payment_submitted',
        NEW.escrow_amount,
        NEW.client_id,
        'Client submitted payment proof'
      );
    ELSIF NEW.escrow_status = 'verified_held' THEN
      -- Share contact information when payment is verified
      NEW.contact_shared_at := NOW();

      INSERT INTO escrow_transactions (
        project_id,
        transaction_type,
        amount,
        performed_by,
        notes
      ) VALUES (
        NEW.id,
        'payment_verified',
        NEW.escrow_amount,
        NEW.escrow_verified_by,
        'Admin verified payment - funds held in escrow, contact info shared'
      );
    ELSIF NEW.escrow_status = 'pending_release' THEN
      INSERT INTO escrow_transactions (
        project_id,
        transaction_type,
        amount,
        performed_by,
        notes
      ) VALUES (
        NEW.id,
        'release_requested',
        NEW.freelancer_payout_amount,
        NEW.client_id,
        'Client approved work - payment release requested'
      );
    ELSIF NEW.escrow_status = 'released' THEN
      INSERT INTO escrow_transactions (
        project_id,
        transaction_type,
        amount,
        performed_by,
        notes
      ) VALUES (
        NEW.id,
        'payment_released',
        NEW.freelancer_payout_amount,
        NEW.escrow_released_by,
        'Admin released payment to freelancer'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-log escrow transactions
CREATE TRIGGER trigger_log_escrow_transaction
  AFTER UPDATE OF escrow_status
  ON projects
  FOR EACH ROW
  EXECUTE FUNCTION log_escrow_transaction();

COMMENT ON TABLE escrow_transactions IS 'Audit trail for all escrow-related transactions and state changes';
COMMENT ON COLUMN projects.escrow_status IS 'Current escrow status: pending_payment → payment_submitted → verified_held → pending_release → released';
COMMENT ON COLUMN projects.escrow_amount IS 'Total amount held in escrow (what client pays)';
COMMENT ON COLUMN projects.freelancer_payout_amount IS 'Amount freelancer receives (escrow_amount - platform_fee)';
COMMENT ON COLUMN projects.platform_fee_amount IS 'Platform commission amount';
COMMENT ON COLUMN projects.contact_shared_at IS 'Timestamp when contact info becomes visible (after payment verified)';
