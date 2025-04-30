import axios from "axios";
import { z } from "zod";
import { formatToolResponse } from "../utils/response";

// 定义关键词研究工具的参数模式
export const keywordsResearchSchema = z.object({
  keywords: z.array(z.string()).min(1).max(100).describe("要查询的关键词数组，最多100个"),
  country: z.string().optional().default("us").describe("目标国家代码，例如'us', 'gb', 'cn'等，默认为'us'"),
  currency: z.string().optional().default("USD").describe("货币代码，例如'USD', 'GBP', 'CNY'等，默认为'USD'"),
  dataSource: z.enum(["gkp", "cli", "tpm"]).optional().default("gkp").describe("数据源: gkp-Google Keyword Planner, cli-Clickstream data, tpm-Trend data"),
});

// 趋势数据条目接口
interface TrendEntry {
  month: string;
  year: number;
  value: number;
}

// CPC值接口
interface CpcValue {
  currency: string;
  value: string;
}

// 关键词数据接口
interface KeywordData {
  keyword: string;
  searchVolume: number | null;
  cpc: CpcValue | null;
  competition: number | null;
  trend: TrendEntry[] | null;
  error?: string;
}

// API响应接口
interface KeywordsEverywhereResponse {
  data: Array<{
    keyword: string;
    vol: number;
    cpc: CpcValue;
    competition: number;
    trend: TrendEntry[];
  }>;
  credits: number;
  credits_consumed: number;
  time: number;
}

/**
 * 调用KeywordsEverywhere API查询关键词数据
 */
export async function getKeywordsData({ 
  keywords, 
  country = "us", 
  currency = "USD", 
  dataSource = "gkp",
  apiKey
}: z.infer<typeof keywordsResearchSchema> & { apiKey: string }) {
  try {
    // KeywordsEverywhere API端点
    const url = "https://api.keywordseverywhere.com/v1/get_keyword_data";
    
    // 准备请求数据 - 使用URLSearchParams格式
    const params = new URLSearchParams();
    
    // 添加关键词数组 - 每个关键词作为单独的 "kw[]" 参数
    keywords.forEach(keyword => {
      params.append("kw[]", keyword);
    });
    
    // 添加其他参数 - 确保国家为美国 (us)
    const countryCode = country.toLowerCase();
    params.append("country", countryCode);
    params.append("currency", currency.toLowerCase());
    params.append("dataSource", dataSource);
    
    console.log(`Sending KE request with params: ${params.toString()}`);
    
    // 发送请求到KeywordsEverywhere API
    const response = await axios.post<KeywordsEverywhereResponse>(url, params, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
    
    console.log(`KE API response status: ${response.status}`);
    
    // 处理API响应
    if (response.status === 200 && response.data) {
      console.log(`KE API response: Credits consumed: ${response.data.credits_consumed}, Remaining: ${response.data.credits}`);
      
      // 添加调试日志
      const firstKeyword = response.data.data && response.data.data[0] ? response.data.data[0].keyword : 'none';
      const hasTrend = response.data.data && response.data.data[0] && response.data.data[0].trend ? 'yes' : 'no';
      const trendLength = response.data.data && response.data.data[0] && response.data.data[0].trend ? response.data.data[0].trend.length : 0;
      console.log(`First keyword: ${firstKeyword}, Has trend data: ${hasTrend}, Trend data length: ${trendLength}`);
      if (trendLength > 0 && response.data.data[0].trend) {
        const sampleTrend = response.data.data[0].trend[0];
        console.log(`Sample trend item: ${JSON.stringify(sampleTrend)}`);
      }
      
      // 转换API响应为统一格式
      const results: KeywordData[] = keywords.map(keyword => {
        // 在KE API响应中查找关键词数据
        const data = response.data.data?.find(item => 
          item.keyword.toLowerCase() === keyword.toLowerCase()
        );
        
        if (!data) {
          return {
            keyword,
            searchVolume: null,
            cpc: null,
            competition: null,
            trend: null,
            error: "No data found"
          };
        }
        
        return {
          keyword: data.keyword,
          searchVolume: data.vol,
          cpc: data.cpc,
          competition: data.competition,
          trend: data.trend.length > 0 ? data.trend : null
        };
      });
      
      // 返回符合MCP工具响应格式的数据
      return formatToolResponse(`## 关键词研究结果

${results.map(data => {
  // 格式化CPC值
  const cpcFormatted = data.cpc ? `${data.cpc.currency}${data.cpc.value}` : 'N/A';
  
  // 格式化竞争度为百分比
  const competitionFormatted = data.competition !== null 
    ? `${(data.competition * 100).toFixed(1)}%` 
    : 'N/A';
  
  // 格式化趋势数据，显示近一年的数据
  let trendSection = 'N/A';
  if (data.trend && data.trend.length > 0) {
    try {
      console.log(`处理关键词 "${data.keyword}" 的趋势数据，共 ${data.trend.length} 条`);
      console.log(`趋势数据第一条: ${JSON.stringify(data.trend[0])}`);
      
      // 最多取12个月的数据
      const yearTrends = data.trend.slice(-12);
      
      // 获取趋势值数组，确保是数字
      const trendValues = yearTrends.map(t => {
        // 如果value是对象或其他非数字格式，尝试转换
        if (typeof t.value !== 'number') {
          console.log(`非标准趋势值: ${JSON.stringify(t.value)}`);
          return parseInt(String(t.value), 10) || 0;
        }
        return t.value;
      });
      
      // 计算最大值（用于标准化展示）
      const maxTrend = Math.max(...trendValues, 1);
      console.log(`趋势值: ${trendValues.join(', ')}, 最大值: ${maxTrend}`);
      
      // 创建月份与数值的对应关系
      const trendData = yearTrends.map((t, index) => {
        let month = '';
        let year = '';
        
        // 处理月份
        if (typeof t.month === 'string') {
          month = t.month.substring(0, 3);
        } else if (t.month !== undefined) {
          month = String(t.month).substring(0, 3);
        } else {
          month = 'Unk';
        }
        
        // 处理年份
        if (typeof t.year === 'number') {
          year = String(t.year).substring(2);
        } else if (t.year !== undefined) {
          year = String(t.year).substring(0, 2);
        } else {
          year = 'XX';
        }
        
        // 关联月份和对应的搜索量
        return {
          label: `${month}'${year}`,
          value: trendValues[index]
        };
      });
      
      // 格式化为列表
      const trendListItems = trendData.map(item => `- ${item.label}: ${item.value}`).join('\n');
      
      // 组合成最终格式
      trendSection = `**近一年趋势数据:**\n${trendListItems}`;
    } catch (error) {
      console.error(`处理趋势数据时出错:`, error);
      trendSection = '解析趋势数据失败';
    }
  }
  
  return `### ${data.keyword}
- **搜索量：** ${data.searchVolume || 'N/A'}
- **CPC：** ${cpcFormatted}
- **竞争度：** ${competitionFormatted}
${trendSection}
`;
}).join('\n')}

**API使用情况:** 消耗积分 ${response.data.credits_consumed}, 剩余积分 ${response.data.credits}, 处理时间 ${response.data.time.toFixed(3)}秒`);
    } else {
      throw new Error(`API返回了非200状态码或没有数据: ${response.status}`);
    }
  } catch (error) {
    console.error("KeywordsEverywhere API调用失败:", error);
    
    // 错误响应
    return formatToolResponse(`获取关键词数据时出错: ${error instanceof Error ? error.message : "未知错误"}`, true);
  }
} 