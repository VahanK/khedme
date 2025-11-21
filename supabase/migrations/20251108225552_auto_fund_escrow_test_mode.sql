-- Auto-fund escrow in test mode when proposal is accepted
-- This trigger automatically sets escrow_status to 'funded' and creates payment records

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS auto_fund_escrow_on_proposal_acceptance() CASCADE;

-- Create function to auto-fund escrow when proposal is accepted
CREATE OR REPLACE FUNCTION auto_fund_escrow_on_proposal_acceptance()
RETURNS TRIGGER AS $$
DECLARE
  v_project_id UUID;
  v_project_budget DECIMAL;
  v_platform_fee DECIMAL;
  v_freelancer_payout DECIMAL;
BEGIN
  -- Only proceed if proposal status changed to 'accepted'
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN

    -- Get project details
    SELECT id, budget_max INTO v_project_id, v_project_budget
    FROM projects
    WHERE id = NEW.project_id;

    -- Use the proposal's proposed budget instead of project budget
    v_project_budget := NEW.proposed_budget;

    -- Calculate fees (5% platform fee)
    v_platform_fee := ROUND(v_project_budget * 0.05, 2);
    v_freelancer_payout := v_project_budget - v_platform_fee;

    -- Update project with escrow details and auto-fund
    UPDATE projects
    SET
      escrow_amount = v_project_budget,
      platform_fee_amount = v_platform_fee,
      freelancer_payout_amount = v_freelancer_payout,
      escrow_status = 'funded',  -- Auto-fund for test mode
      payment_method = 'test_mode',
      status = 'in_progress',  -- Move to in_progress automatically
      updated_at = NOW()
    WHERE id = NEW.project_id;

    -- Log for debugging
    RAISE NOTICE 'Auto-funded escrow for project % with amount %', NEW.project_id, v_project_budget;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_auto_fund_escrow ON proposals;
CREATE TRIGGER trigger_auto_fund_escrow
  AFTER UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION auto_fund_escrow_on_proposal_acceptance();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION auto_fund_escrow_on_proposal_acceptance() TO authenticated;
