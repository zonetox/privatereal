-- Migration: Correct Project Intelligence Engine Architecture
-- Description: Add final_score, A-D grades, subtract risk, and add 0-100 constraints.
-- 1. Alter projects table: Add final_score and restrict investment_grade
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS final_score NUMERIC;
-- First, clear invalid grades to avoid constraint failure
UPDATE public.projects
SET investment_grade = NULL;
-- Alter column to use A-D check constraint
ALTER TABLE public.projects
ALTER COLUMN investment_grade TYPE TEXT,
    DROP CONSTRAINT IF EXISTS projects_investment_grade_check,
    ADD CONSTRAINT projects_investment_grade_check CHECK (investment_grade IN ('A', 'B', 'C', 'D'));
-- 2. Add 0-100 check constraints for all score components
ALTER TABLE public.projects
ADD CONSTRAINT check_legal_score_range CHECK (
        legal_score >= 0
        AND legal_score <= 100
    ),
    ADD CONSTRAINT check_location_score_range CHECK (
        location_score >= 0
        AND location_score <= 100
    ),
    ADD CONSTRAINT check_infrastructure_score_range CHECK (
        infrastructure_score >= 0
        AND infrastructure_score <= 100
    ),
    ADD CONSTRAINT check_liquidity_score_range CHECK (
        liquidity_score >= 0
        AND liquidity_score <= 100
    ),
    ADD CONSTRAINT check_growth_score_range CHECK (
        growth_score >= 0
        AND growth_score <= 100
    ),
    ADD CONSTRAINT check_risk_score_range CHECK (
        risk_score >= 0
        AND risk_score <= 100
    );
-- 3. Update the handle_project_grading trigger function
CREATE OR REPLACE FUNCTION public.handle_project_grading() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE w_rec RECORD;
weighted_sum NUMERIC := 0;
total_weight NUMERIC := 0;
v_final_score NUMERIC := 0;
BEGIN -- 1. Fetch active weights
SELECT legal_weight,
    location_weight,
    infrastructure_weight,
    liquidity_weight,
    growth_weight,
    risk_weight INTO w_rec
FROM public.project_scoring_weights
WHERE active = true
LIMIT 1;
IF NOT FOUND THEN w_rec := (1, 1, 1, 1, 1, 1);
END IF;
-- 2. Calculate weighted sum
-- IMPORTANT: Risk is SUBTRACTED as per CTO requirement
weighted_sum := (
    COALESCE(NEW.legal_score, 0) * w_rec.legal_weight
) + (
    COALESCE(NEW.location_score, 0) * w_rec.location_weight
) + (
    COALESCE(NEW.infrastructure_score, 0) * w_rec.infrastructure_weight
) + (
    COALESCE(NEW.liquidity_score, 0) * w_rec.liquidity_weight
) + (
    COALESCE(NEW.growth_score, 0) * w_rec.growth_weight
) - (COALESCE(NEW.risk_score, 0) * w_rec.risk_weight);
total_weight := w_rec.legal_weight + w_rec.location_weight + w_rec.infrastructure_weight + w_rec.liquidity_weight + w_rec.growth_weight + w_rec.risk_weight;
-- 3. Calculate final numeric score (normalized)
-- Using numeric score for final_score
IF total_weight > 0 THEN v_final_score := ROUND((weighted_sum / total_weight)::NUMERIC, 2);
ELSE v_final_score := 0;
END IF;
-- Floor at 0 if risk subtraction makes it negative
IF v_final_score < 0 THEN v_final_score := 0;
END IF;
NEW.final_score := v_final_score;
-- 4. Map score to alphabetical Investment Grade
IF v_final_score >= 80 THEN NEW.investment_grade := 'A';
ELSIF v_final_score >= 65 THEN NEW.investment_grade := 'B';
ELSIF v_final_score >= 50 THEN NEW.investment_grade := 'C';
ELSE NEW.investment_grade := 'D';
END IF;
RETURN NEW;
END;
$$;
-- 4. Update the calculate_project_grade wrapper function
CREATE OR REPLACE FUNCTION public.calculate_project_grade(project_id UUID) RETURNS NUMERIC LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE final_val NUMERIC;
BEGIN -- This function now simply triggers the update logic
UPDATE public.projects
SET updated_at = now() -- dummy update to fire trigger if nothing else changes
WHERE id = project_id;
SELECT final_score INTO final_val
FROM public.projects
WHERE id = project_id;
RETURN final_val;
END;
$$;
-- Notify PostgREST
NOTIFY pgrst,
'reload schema';