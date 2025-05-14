import { z } from "zod";
import { formatToolResponse } from "../utils/response.js";

/**
 * Commission calculator schema
 */
export const commissionSchema = z.object({
	profit: z.number().min(0, "利润必须是非负数"),
});

/**
 * Calculate commission based on profit levels
 */
export async function commissionCalculator({
	profit,
}: z.infer<typeof commissionSchema>) {
	try {
		// Fixed base salary
		const baseSalary = 3500;

		// Commission calculation based on profit tiers
		let commission = 0;

		// Tier 1: 0-10000, 5%
		const tier1Limit = 10000;
		const tier1Rate = 0.05;
		if (profit > 0) {
			commission += Math.min(profit, tier1Limit) * tier1Rate;
		}

		// Tier 2: 10000-25000, 7.3%
		const tier2Limit = 25000;
		const tier2Rate = 0.073;
		if (profit > tier1Limit) {
			commission += (Math.min(profit, tier2Limit) - tier1Limit) * tier2Rate;
		}

		// Tier 3: 25000-40000, 13.8%
		const tier3Limit = 40000;
		const tier3Rate = 0.138;
		if (profit > tier2Limit) {
			commission += (Math.min(profit, tier3Limit) - tier2Limit) * tier3Rate;
		}

		// Tier 4: 40000+, 21%
		const tier4Rate = 0.21;
		if (profit > tier3Limit) {
			commission += (profit - tier3Limit) * tier4Rate;
		}

		// Calculate total before tax
		const totalBeforeTax = baseSalary + commission;

		// Calculate income tax (30%)
		const taxRate = 0.3;
		const incomeTax = totalBeforeTax * taxRate;

		// Fixed costs (social security + other fixed costs)
		const fixedCosts = 1550;

		// Calculate net income
		const netIncome = totalBeforeTax - incomeTax - fixedCosts;

		// Prepare detailed breakdown
		const breakdown = {
			profit,
			baseSalary,
			commissionBreakdown: {
				tier1: profit > 0 ? Math.min(profit, tier1Limit) * tier1Rate : 0,
				tier2:
					profit > tier1Limit
						? (Math.min(profit, tier2Limit) - tier1Limit) * tier2Rate
						: 0,
				tier3:
					profit > tier2Limit
						? (Math.min(profit, tier3Limit) - tier2Limit) * tier3Rate
						: 0,
				tier4: profit > tier3Limit ? (profit - tier3Limit) * tier4Rate : 0,
			},
			totalCommission: commission,
			totalBeforeTax,
			incomeTax,
			fixedCosts,
			netIncome,
		};

		// Return formatted response with results as a string
		return formatToolResponse(`利润${profit}元的收入计算结果:
基本工资: ${baseSalary}元
提成明细:
  0-10000元: ${breakdown.commissionBreakdown.tier1.toFixed(2)}元
  10000-25000元: ${breakdown.commissionBreakdown.tier2.toFixed(2)}元
  25000-40000元: ${breakdown.commissionBreakdown.tier3.toFixed(2)}元
  40000元以上: ${breakdown.commissionBreakdown.tier4.toFixed(2)}元
总提成: ${commission.toFixed(2)}元
税前总收入: ${totalBeforeTax.toFixed(2)}元
个人所得税(30%): ${incomeTax.toFixed(2)}元
社保+固定成本: ${fixedCosts.toFixed(2)}元
最终净收入: ${netIncome.toFixed(2)}元`);
	} catch (error) {
		console.error("佣金计算错误:", error);
		return formatToolResponse(
			`计算失败: ${error instanceof Error ? error.message : String(error)}`,
			true,
		);
	}
}
