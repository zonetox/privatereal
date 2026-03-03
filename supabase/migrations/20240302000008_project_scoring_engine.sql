-- Migration: Project Intelligence Scoring Engine
-- Description: Implements weights table, scoring function, and automated trigger for projects.
-- 1. Create Weights Table
CREATE TABLE IF NOT EXISTS public.project_scoring_weights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legal_weight NUMERIC NOT NULL DEFAULT 1,
    location_weight NUMERIC NOT NULL DEFAULT 1,
    infrastructure_weight NUMERIC NOT NULL DEFAULT 1,
    liquidity_weight NUMERIC NOT NULL DEFAULT 1,
    growth_weight NUMERIC NOT NULL DEFAULT 1,
    risk_weight NUMERIC NOT NULL DEFAULT 1,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Ensure only one active record exists
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_scoring_weight ON public.project_scoring_weights (active)
WHERE (active = true);
-- Enable RLS
ALTER TABLE public.project_scoring_weights ENABLE ROW LEVEL SECURITY;
-- Admin Policy
CREATE POLICY "Admins have full access to scoring weights" ON public.project_scoring_weights FOR ALL TO authenticated USING (public.is_admin());
-- 2. Create Scoring Function
CREATE OR REPLACE FUNCTION public.calculate_project_grade(project_id UUID) RETURNS NUMERIC LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE p_rec RECORD;
w_rec RECORD;
weighted_sum NUMERIC := 0;
total_weight NUMERIC := 0;
final_score NUMERIC := 0;
BEGIN -- 1. Fetch project scores
SELECT legal_score,
    location_score,
    infrastructure_score,
    liquidity_score,
    growth_score,
    risk_score INTO p_rec
FROM public.projects
WHERE id = project_id;
IF NOT FOUND THEN RETURN 0;
END IF;
-- 2. Fetch active weights
SELECT legal_weight,
    location_weight,
    infrastructure_weight,
    liquidity_weight,
    growth_weight,
    risk_weight INTO w_rec
FROM public.project_scoring_weights
WHERE active = true
LIMIT 1;
-- If no active weights, use equal weights of 1
IF NOT FOUND THEN w_rec := (1, 1, 1, 1, 1, 1);
END IF;
-- 3. Calculate weighted sum
weighted_sum := (
    COALESCE(p_rec.legal_score, 0) * w_rec.legal_weight
) + (
    COALESCE(p_rec.location_score, 0) * w_rec.location_weight
) + (
    COALESCE(p_rec.infrastructure_score, 0) * w_rec.infrastructure_weight
) + (
    COALESCE(p_rec.liquidity_score, 0) * w_rec.liquidity_weight
) + (
    COALESCE(p_rec.growth_score, 0) * w_rec.growth_weight
) + (
    COALESCE(p_rec.risk_score, 0) * w_rec.risk_weight
);
total_weight := w_rec.legal_weight + w_rec.location_weight + w_rec.infrastructure_weight + w_rec.liquidity_weight + w_rec.growth_weight + w_rec.risk_weight;
-- 4. Normalize to 0-100 (assuming scores are 0-100)
IF total_weight > 0 THEN final_score := ROUND((weighted_sum / total_weight)::NUMERIC, 2);
ELSE final_score := 0;
END IF;
-- 5. Update project grade (string representation of the score for now)
UPDATE public.projects
SET investment_grade = final_score::TEXT
WHERE id = project_id;
RETURN final_score;
END;
$$;
-- 3. Create Trigger Function
CREATE OR REPLACE FUNCTION public.handle_project_grading() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE w_rec RECORD;
weighted_sum NUMERIC := 0;
total_weight NUMERIC := 0;
final_score NUMERIC := 0;
BEGIN -- We can't call calculate_project_grade directly on the NEW record easily via UUID 
-- because the UPDATE/INSERT hasn't finished. So we implement the logic inside the trigger 
-- to update NEW.investment_grade BEFORE the write.
-- 1. Fetch active weights
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
-- 2. Calculate weighted sum using NEW record values
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
) + (COALESCE(NEW.risk_score, 0) * w_rec.risk_weight);
total_weight := w_rec.legal_weight + w_rec.location_weight + w_rec.infrastructure_weight + w_rec.liquidity_weight + w_rec.growth_weight + w_rec.risk_weight;
-- 3. Normalize
IF total_weight > 0 THEN final_score := ROUND((weighted_sum / total_weight)::NUMERIC, 2);
ELSE final_score := 0;
END IF;
-- 4. Update the column directly in the transition record
NEW.investment_grade := final_score::TEXT;
RETURN NEW;
END;
$$;
-- 4. Create Trigger
DROP TRIGGER IF EXISTS trg_calculate_project_grade ON public.projects;
CREATE TRIGGER trg_calculate_project_grade BEFORE
INSERT
    OR
UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_project_grading();
-- 5. Seed default weights
INSERT INTO public.project_scoring_weights (
        legal_weight,
        location_weight,
        infrastructure_weight,
        liquidity_weight,
        growth_weight,
        risk_weight,
        active
    )
VALUES (2.0, 2.5, 1.5, 1.0, 2.0, 1.0, true) ON CONFLICT DO NOTHING;
-- Notify PostgREST
NOTIFY pgrst,
'reload schema';