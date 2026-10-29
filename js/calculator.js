/**
 * Economic Target & CAGR Calculator Module
 * Viksit Bengal Dashboard — বিকশিত বাংলা ড্যাশবোর্ড
 *
 * Implements compound annual growth rate (CAGR) formula:
 * Required annual growth rate = (Target value / Baseline value) ^ (1 / Number of years) - 1
 */

/**
 * Calculate required compound annual growth rate (CAGR)
 * @param {number} baseline - Starting GSDP value
 * @param {number} target - Target GSDP value
 * @param {number} years - Number of elapsed compounding years (Target Year - Base Year)
 * @returns {number} Required annual growth rate in percentage (e.g. 16.8 for 16.8%)
 */
function calculateRequiredCAGR(baseline, target, years) {
  if (!baseline || !target || !years || years <= 0 || baseline <= 0 || target <= 0) {
    return 0;
  }
  const rate = Math.pow(target / baseline, 1 / years) - 1;
  return Number((rate * 100).toFixed(2));
}

/**
 * Generate yearly projection trajectory based on an assumed annual CAGR
 * @param {number} baseline - Baseline GSDP value
 * @param {number} startYear - Base year (e.g. 2024)
 * @param {number} endYear - Target year (e.g. 2033)
 * @param {number} cagrPercent - Annual growth rate in percent (e.g. 12.5)
 * @returns {Array<{year: number, projectedValue: number}>}
 */
function generateTrajectory(baseline, startYear, endYear, cagrPercent) {
  const years = endYear - startYear;
  if (years <= 0 || baseline <= 0) return [];
  const rate = cagrPercent / 100;
  const trajectory = [];

  for (let i = 0; i <= years; i++) {
    const yr = startYear + i;
    const val = baseline * Math.pow(1 + rate, i);
    trajectory.push({
      year: yr,
      projectedValue: Number(val.toFixed(2))
    });
  }
  return trajectory;
}

/**
 * Compute the 3 benchmark scenarios for West Bengal's $1 Trillion Target
 * Assumptions:
 * - Baseline 2023-24: ₹17.19 Lakh Crore (~$207 Billion USD at ₹83/$ avg)
 * - Target 2033: $1,000 Billion USD (~₹83.50 Lakh Crore at ₹83.5/$ avg)
 * - Years: 9 years (2024 to 2033)
 * - Conservative Scenario: Historical avg nominal growth (9.0% CAGR)
 * - Base Scenario: Projected steady state industrial expansion (12.5% CAGR)
 * - Ambitious / Required Scenario: Calculated CAGR to hit $1T exactly
 */
function calculateScenarios(baselineUsd = 207, targetUsd = 1000, startYear = 2024, targetYear = 2033) {
  const years = targetYear - startYear;
  const requiredCAGR = calculateRequiredCAGR(baselineUsd, targetUsd, years);

  const conservativeRate = 9.0;
  const baseRate = 12.5;

  const conservativeVal = baselineUsd * Math.pow(1 + conservativeRate / 100, years);
  const baseVal = baselineUsd * Math.pow(1 + baseRate / 100, years);
  const ambitiousVal = targetUsd;

  return {
    baselineUsd,
    targetUsd,
    startYear,
    targetYear,
    years,
    requiredCAGR,
    scenarios: {
      conservative: {
        name: 'Conservative Growth',
        name_bn: 'রক্ষণশীল প্রবৃদ্ধি',
        cagr: conservativeRate,
        projected2033Usd: Number(conservativeVal.toFixed(1)),
        projected2033InrLakhCr: Number((conservativeVal * 0.0835).toFixed(2)),
        notes: 'Assumes continuation of historical nominal trend without major industrial breakthrough.'
      },
      base: {
        name: 'Accelerated Industrial Base',
        name_bn: 'ত্বরান্বিত শিল্পায়ন ভিত্তি',
        cagr: baseRate,
        projected2033Usd: Number(baseVal.toFixed(1)),
        projected2033InrLakhCr: Number((baseVal * 0.0835).toFixed(2)),
        notes: 'Reflects realization of Tajpur Port, DFC, and semiconductor investments with high capital outlay.'
      },
      ambitious: {
        name: 'Required $1T Trajectory',
        name_bn: 'কাঙ্ক্ষিত ১ ট্রিলিয়ন ডলার লক্ষ্যমাত্রা',
        cagr: requiredCAGR,
        projected2033Usd: Number(ambitiousVal.toFixed(1)),
        projected2033InrLakhCr: Number((ambitiousVal * 0.0835).toFixed(2)),
        notes: 'Mathematical requirement to achieve US$1 Trillion (₹83.5 Lakh Crore) by target year.'
      }
    }
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateRequiredCAGR,
    generateTrajectory,
    calculateScenarios
  };
}
