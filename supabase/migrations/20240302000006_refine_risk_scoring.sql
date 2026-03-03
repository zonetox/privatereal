-- Migration: Refine Risk Scoring Logic
-- Description: Change function to STABLE and ensure NULL safety for incomplete data.
-- 1. Update calculation function to STABLE
CREATE OR REPLACE FUNCTION public.calculate_risk_score(
        max_drawdown INT,
        liquidity_pref TEXT,
        crash_react TEXT,
        leverage_pref TEXT
    ) RETURNS INT LANGUAGE plpgsql STABLE AS $$
DECLARE score INT := 0;
BEGIN -- 1. Drawdown Tolerance
IF max_drawdown <= 10 THEN score := score + 10;
ELSIF max_drawdown <= 20 THEN score := score + 20;
ELSIF max_drawdown <= 30 THEN score := score + 35;
ELSE score := score + 50;
END IF;
-- 2. Liquidity Preference
IF liquidity_pref = 'high' THEN score := score + 10;
ELSIF liquidity_pref = 'medium' THEN score := score + 20;
ELSIF liquidity_pref = 'low' THEN score := score + 30;
END IF;
-- 3. Crash Reaction
IF crash_react = 'panic_sell' THEN score := score + 5;
ELSIF crash_react = 'hold' THEN score := score + 20;
ELSIF crash_react = 'buy_more' THEN score := score + 35;
END IF;
-- 4. Leverage Preference
IF leverage_pref = 'none' THEN score := score + 5;
ELSIF leverage_pref = 'moderate' THEN score := score + 15;
ELSIF leverage_pref = 'high' THEN score := score + 30;
END IF;
RETURN score;
END;
$$;
-- 2. Update trigger function for NULL safety
CREATE OR REPLACE FUNCTION public.handle_client_risk_scoring() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE calculated_score INT;
BEGIN -- If any required field is missing, strictly set to NULL
IF NEW.max_drawdown_percent IS NULL
OR NEW.liquidity_preference IS NULL
OR NEW.crash_reaction IS NULL
OR NEW.leverage_preference IS NULL THEN NEW.risk_score := NULL;
NEW.risk_profile := NULL;
ELSE -- All fields present, calculate as normal
calculated_score := public.calculate_risk_score(
    NEW.max_drawdown_percent,
    NEW.liquidity_preference,
    NEW.crash_reaction,
    NEW.leverage_preference
);
NEW.risk_score := calculated_score;
-- Map to Risk Profile
IF calculated_score <= 40 THEN NEW.risk_profile := 'conservative';
ELSIF calculated_score <= 75 THEN NEW.risk_profile := 'balanced';
ELSE NEW.risk_profile := 'aggressive';
END IF;
END IF;
RETURN NEW;
END;
$$;
-- Notify PostgREST
NOTIFY pgrst,
'reload schema';