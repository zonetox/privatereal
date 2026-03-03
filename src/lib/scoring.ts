export type CapitalRange = 'capital_1_3' | 'capital_3_5' | 'capital_5_10' | 'capital_10_20' | 'capital_20plus';
export type CashflowRange = 'cashflow_lt100' | 'cashflow_100_300' | 'cashflow_300_1b' | 'cashflow_gt1b';
export type Occupation = 'owner' | 'executive' | 'investor' | 'other';
export type Objective = 'preserve' | 'diversify' | 'income' | 'growth';

export function calculateLeadScore(
    capital: CapitalRange,
    cashflow: CashflowRange,
    occupation: Occupation,
    objective: Objective
) {
    let score = 0;

    // Capital weights
    const capitalWeights: Record<CapitalRange, number> = {
        capital_1_3: 5,
        capital_3_5: 10,
        capital_5_10: 25,
        capital_10_20: 35,
        capital_20plus: 50,
    };

    // Cashflow weights
    const cashflowWeights: Record<CashflowRange, number> = {
        cashflow_lt100: 5,
        cashflow_100_300: 15,
        cashflow_300_1b: 25,
        cashflow_gt1b: 40,
    };

    // Occupation weights
    const occupationWeights: Record<Occupation, number> = {
        owner: 25,
        executive: 20,
        investor: 15,
        other: 5,
    };

    // Objective weights
    const objectiveWeights: Record<Objective, number> = {
        preserve: 15,
        diversify: 15,
        income: 10,
        growth: 5,
    };

    score += capitalWeights[capital] || 0;
    score += cashflowWeights[cashflow] || 0;
    score += occupationWeights[occupation] || 0;
    score += objectiveWeights[objective] || 0;

    let status = 'new';
    if (score >= 70) status = 'qualified';
    else if (score < 50) status = 'rejected';

    return { score, status };
}
