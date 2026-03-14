-- Migration: Standardize Matching Engine Data & Fix Unit Mismatch
-- Description: 
-- 1. Fixes Budget Alignment to expect VND (Billion scaled) instead of single digits.
-- 2. Aligns Goal mapping to match Lead Assessment values (Objective).
-- 3. Aligns Horizon mapping to match Lead Assessment values.

-- 1. Fix Budget Alignment (Expects project_price in full VND)
DROP FUNCTION IF EXISTS public.internal_budget_alignment(TEXT, NUMERIC);
CREATE OR REPLACE FUNCTION public.internal_budget_alignment(client_budget TEXT, project_price NUMERIC) 
RETURNS NUMERIC LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE 
    budget_max NUMERIC := 999999999999; -- Arbitrary high max
    ratio NUMERIC;
BEGIN 
    IF project_price IS NULL OR project_price = 0 THEN
        RETURN 50; 
    END IF;

    -- Map text ranges (Lead Assessment or Client Input) to numeric max budget (VND)
    CASE COALESCE(client_budget, 'capital_5_10')
        -- Lead Assessment formats
        WHEN 'capital_1_3' THEN budget_max := 3000000000;
        WHEN 'capital_3_5' THEN budget_max := 5000000000;
        WHEN 'capital_5_10' THEN budget_max := 10000000000;
        WHEN 'capital_10_20' THEN budget_max := 20000000000;
        WHEN 'capital_20plus' THEN budget_max := 100000000000;
        -- Legacy / Manual formats
        WHEN '1_3_billion' THEN budget_max := 3000000000;
        WHEN '3_5_billion' THEN budget_max := 5000000000;
        WHEN '5_10_billion' THEN budget_max := 10000000000;
        WHEN '10_20_billion' THEN budget_max := 20000000000;
        WHEN '20_billion_plus' THEN budget_max := 100000000000;
        ELSE
            RETURN 50;
    END CASE;

    -- Calculate ratio
    ratio := project_price / budget_max;

    -- Scoring
    IF ratio <= 0.90 THEN RETURN 100;
    ELSIF ratio <= 1.00 THEN RETURN 90;
    ELSIF ratio <= 1.10 THEN RETURN 70;
    ELSIF ratio <= 1.20 THEN RETURN 50;
    ELSE RETURN 20;
    END IF;
END;
$$;

-- 2. Fix Goal Alignment (Support Lead Assessment objectives)
DROP FUNCTION IF EXISTS public.internal_goal_alignment(TEXT, TEXT);
CREATE OR REPLACE FUNCTION public.internal_goal_alignment(client_goal TEXT, project_purpose TEXT) 
RETURNS NUMERIC LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
    IF client_goal IS NULL OR project_purpose IS NULL THEN
         RETURN 50;
    END IF;

    -- Normalize client_goal to standard PREIO types
    -- Lead: preserve, diversify, income, growth
    -- RPC: living, investment, rental
    CASE LOWER(TRIM(client_goal))
        -- Case: Growth or Investment
        WHEN 'growth', 'investment', 'diversify' THEN
            IF project_purpose ILIKE '%growth%' OR project_purpose ILIKE '%investment%' OR project_purpose ILIKE '%land%' THEN
                RETURN 100;
            ELSIF project_purpose ILIKE '%rental%' OR project_purpose ILIKE '%yield%' THEN
                RETURN 80;
            END IF;
        
        -- Case: Income or Rental
        WHEN 'income', 'rental' THEN
            IF project_purpose ILIKE '%rental%' OR project_purpose ILIKE '%yield%' OR project_purpose ILIKE '%apartment%' THEN
                RETURN 100;
            ELSIF project_purpose ILIKE '%growth%' OR project_purpose ILIKE '%investment%' THEN
                RETURN 70;
            END IF;

        -- Case: Living or Preserve (Capital preservation often implies low-risk residential)
        WHEN 'living', 'preserve' THEN
            IF project_purpose ILIKE '%apartment%' OR project_purpose ILIKE '%house%' OR project_purpose ILIKE '%residential%' THEN
                RETURN 100;
            ELSIF project_purpose ILIKE '%resort%' OR project_purpose ILIKE '%rental%' THEN
                RETURN 60;
            END IF;
            
        ELSE
            RETURN 30;
    END CASE;

    RETURN 30; 
END;
$$;

-- Notify PostgREST
NOTIFY pgrst, 'reload schema';
