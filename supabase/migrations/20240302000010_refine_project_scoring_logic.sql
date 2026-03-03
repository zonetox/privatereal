-- Migration: Project Intelligence Engine Final Refinement
-- Description: Refine normalization logic (Risk excluded from denominator) and refactor grading function.
-- 1. Create Internal Scoring Function (Pure calculation from values)
CREATE OR REPLACE FUNCTION public.internal_calculate_project_final_score(
        p_legal INT,
        p_location INT,
        p_infra INT,
        p_liquidity INT,
        p_growth INT,
        p_risk INT,
        w_legal NUMERIC,
        w_location NUMERIC,
        w_infra NUMERIC,
        w_liquidity NUMERIC,
        w_growth NUMERIC,
        w_risk NUMERIC
    ) RETURNS NUMERIC LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE positive_weighted_sum NUMERIC := 0;
total_positive_weight NUMERIC := 0;
final_val NUMERIC := 0;
BEGIN -- Sum positive components
positive_weighted_sum := (COALESCE(p_legal, 0) * w_legal) + (COALESCE(p_location, 0) * w_location) + (COALESCE(p_infra, 0) * w_infra) + (COALESCE(p_liquidity, 0) * w_liquidity) + (COALESCE(p_growth, 0) * w_growth);
-- Denominator is ONLY positive weights
total_positive_weight := w_legal + w_location + w_infra + w_liquidity + w_growth;
-- Calculate base normalized score and subtract Risk Penalty
IF total_positive_weight > 0 THEN final_val := (positive_weighted_sum / total_positive_weight) - (
    (COALESCE(p_risk, 0) * w_risk) / total_positive_weight
);
ELSE final_val := 0;
END IF;
-- Floor at 0
IF final_val < 0 THEN final_val := 0;
END IF;
RETURN ROUND(final_val::NUMERIC, 2);
END;
$$;
-- 2. Create Internal Grade Mapping Function
CREATE OR REPLACE FUNCTION public.internal_map_score_to_grade(score NUMERIC) RETURNS TEXT LANGUAGE plpgsql IMMUTABLE AS $$ BEGIN IF score >= 80 THEN RETURN 'A';
ELSIF score >= 65 THEN RETURN 'B';
ELSIF score >= 50 THEN RETURN 'C';
ELSE RETURN 'D';
END IF;
END;
$$;
-- 3. Update the handle_project_grading trigger function
CREATE OR REPLACE FUNCTION public.handle_project_grading() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE w_rec RECORD;
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
-- Fallback to default weights
IF NOT FOUND THEN w_rec := (1.0, 1.0, 1.0, 1.0, 1.0, 1.0);
END IF;
-- 2. Use internal function to calculate final_score
NEW.final_score := public.internal_calculate_project_final_score(
    NEW.legal_score,
    NEW.location_score,
    NEW.infrastructure_score,
    NEW.liquidity_score,
    NEW.growth_score,
    NEW.risk_score,
    w_rec.legal_weight,
    w_rec.location_weight,
    w_rec.infrastructure_weight,
    w_rec.liquidity_weight,
    w_rec.growth_weight,
    w_rec.risk_weight
);
-- 3. Map to alphabetical grade
NEW.investment_grade := public.internal_map_score_to_grade(NEW.final_score);
RETURN NEW;
END;
$$;
-- 4. Refactor calculate_project_grade to be a pure getter (Read-only)
CREATE OR REPLACE FUNCTION public.calculate_project_grade(project_id UUID) RETURNS NUMERIC LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE p_score NUMERIC;
BEGIN
SELECT final_score INTO p_score
FROM public.projects
WHERE id = project_id;
RETURN COALESCE(p_score, 0);
END;
$$;
-- Notify PostgREST
NOTIFY pgrst,
'reload schema';