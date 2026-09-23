export type SurveyQuestionType =
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'RATING_5'
  | 'RATING_10'
  | 'TEXT'
  | 'TEXTAREA';

export type SurveyBranchKey = "THUE_ACC" | "GDTG" | "WEBSITE" | "CAY_THUE";

export interface SurveyQuestion {
  id: string;
  section?: string;
  branch?: "ALL" | SurveyBranchKey;
  title: string;
  subtitle?: string;
  placeholder?: string;
  type: SurveyQuestionType;
  options?: string[];
  required: boolean;
  enabled: boolean;
}

export interface SurveyRewardConfig {
  enabled: boolean;
  voucherCode: string;
  rewardTitle: string;
  rewardDescription: string;
  discountValue?: number;
}

export interface SurveyHeaderConfig {
  title: string;
  subtitle: string;
  description: string;
}

export interface SurveyConfig {
  header: SurveyHeaderConfig;
  reward: SurveyRewardConfig;
  branchRewards?: Record<string, SurveyRewardConfig>;
  questions: SurveyQuestion[];
}

export interface SurveyResponse {
  id: string;
  createdAt: string;
  servicesUsed: string[];
  satisfactionRating: number; // 1 to 5
  deliverySpeed: string;
  supportAttitude: string;
  accountQuality: string;
  requestedAdditions?: string;
  pricingPerception: string;
  improvementSuggestion: string;
  recommendScore: number; // 1 to 10
  customerName?: string;
  customerZalo?: string;
  customAnswers?: Record<string, any>;
  giftDelivered?: boolean;
  giftDeliveredAt?: string;
  giftDeliveredNote?: string;
  rewardCode?: string;
  rewardTitle?: string;
  branch?: string;
}


export interface SurveySummary {
  total: number;
  avgSatisfaction: number;
  satisfactionRate: number; // % rating >= 4
  fastDeliveryRate: number; // % delivery <= 5 mins
  avgRecommendScore: number;
  giftDeliveredCount: number;
  giftPendingCount: number;
  serviceUsageCounts: Record<string, number>;
  speedCounts: Record<string, number>;
  attitudeCounts: Record<string, number>;
  qualityCounts: Record<string, number>;
  pricingCounts: Record<string, number>;
}

export function calculateSurveySummary(surveys: SurveyResponse[]): SurveySummary {
  const total = surveys.length;
  if (total === 0) {
    return {
      total: 0,
      avgSatisfaction: 5.0,
      satisfactionRate: 100,
      fastDeliveryRate: 100,
      avgRecommendScore: 10,
      giftDeliveredCount: 0,
      giftPendingCount: 0,
      serviceUsageCounts: {},
      speedCounts: {},
      attitudeCounts: {},
      qualityCounts: {},
      pricingCounts: {},
    };
  }

  let totalSatisfaction = 0;
  let positiveSatisfactionCount = 0;
  let fastDeliveryCount = 0;
  let totalRecommend = 0;
  let giftDeliveredCount = 0;

  const serviceUsageCounts: Record<string, number> = {};
  const speedCounts: Record<string, number> = {};
  const attitudeCounts: Record<string, number> = {};
  const qualityCounts: Record<string, number> = {};
  const pricingCounts: Record<string, number> = {};

  surveys.forEach((s) => {
    totalSatisfaction += s.satisfactionRating || 5;
    if (s.satisfactionRating >= 4) positiveSatisfactionCount++;

    if (
      s.deliverySpeed?.includes('< 1 phút') ||
      s.deliverySpeed?.includes('1 - 5 phút') ||
      s.deliverySpeed?.includes('Siêu nhanh') ||
      s.deliverySpeed?.includes('Nhanh')
    ) {
      fastDeliveryCount++;
    }

    totalRecommend += s.recommendScore || 10;

    if (s.giftDelivered) {
      giftDeliveredCount++;
    }

    // Services
    if (Array.isArray(s.servicesUsed)) {
      s.servicesUsed.forEach((srv) => {
        serviceUsageCounts[srv] = (serviceUsageCounts[srv] || 0) + 1;
      });
    }

    if (s.deliverySpeed) speedCounts[s.deliverySpeed] = (speedCounts[s.deliverySpeed] || 0) + 1;
    if (s.supportAttitude) attitudeCounts[s.supportAttitude] = (attitudeCounts[s.supportAttitude] || 0) + 1;
    if (s.accountQuality) qualityCounts[s.accountQuality] = (qualityCounts[s.accountQuality] || 0) + 1;
    if (s.pricingPerception) pricingCounts[s.pricingPerception] = (pricingCounts[s.pricingPerception] || 0) + 1;
  });

  return {
    total,
    avgSatisfaction: Number((totalSatisfaction / total).toFixed(1)),
    satisfactionRate: Math.round((positiveSatisfactionCount / total) * 100),
    fastDeliveryRate: Math.round((fastDeliveryCount / total) * 100),
    avgRecommendScore: Number((totalRecommend / total).toFixed(1)),
    giftDeliveredCount,
    giftPendingCount: total - giftDeliveredCount,
    serviceUsageCounts,
    speedCounts,
    attitudeCounts,
    qualityCounts,
    pricingCounts,
  };
}

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('shoptft_admin_token');
    if (token) {
      headers['x-admin-token'] = token;
    }
  }
  return headers;
};

export async function submitSurveyApi(
  payload: Omit<SurveyResponse, 'id' | 'createdAt'>
): Promise<{ success: boolean; data?: SurveyResponse; discountCode?: string; reward?: SurveyRewardConfig; error?: string }> {
  try {
    const res = await fetch('/api/surveys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      return { success: false, error: result.error || 'Không thể gửi biểu mẫu khảo sát' };
    }

    return { success: true, data: result.data, discountCode: result.discountCode, reward: result.reward };
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi kết nối máy chủ' };
  }
}

export async function getSurveysApi(): Promise<{
  success: boolean;
  data: SurveyResponse[];
  summary?: SurveySummary;
  error?: string;
}> {
  try {
    const res = await fetch('/api/surveys', {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store',
      credentials: 'include',
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      return { success: false, data: [], error: result.error || 'Lỗi tải danh sách khảo sát' };
    }

    return { success: true, data: result.data || [], summary: result.summary };
  } catch (err: any) {
    return { success: false, data: [], error: err.message || 'Lỗi kết nối' };
  }
}

export async function deleteSurveyApi(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/surveys?id=' + encodeURIComponent(id), {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      return { success: false, error: result.error || 'Không thể xóa phản hồi khảo sát' };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi kết nối máy chủ' };
  }
}

/**
 * Lấy cấu hình câu hỏi và phần quà khảo sát
 */
export async function getSurveyConfigApi(): Promise<{
  success: boolean;
  data?: SurveyConfig;
  error?: string;
}> {
  try {
    const res = await fetch('/api/surveys/config', {
      method: 'GET',
      cache: 'no-store',
      credentials: 'include',
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      return { success: false, error: result.error || 'Không thể tải cấu hình khảo sát' };
    }

    return { success: true, data: result.data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi kết nối máy chủ' };
  }
}

/**
 * Cập nhật cấu hình câu hỏi và phần quà khảo sát (Dành cho Admin)
 */
export async function updateSurveyConfigApi(
  config: SurveyConfig
): Promise<{ success: boolean; data?: SurveyConfig; error?: string }> {
  try {
    const res = await fetch('/api/surveys/config', {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(config),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      return { success: false, error: result.error || 'Không thể cập nhật cấu hình khảo sát' };
    }

    return { success: true, data: result.data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi kết nối máy chủ' };
  }
}

/**
 * Cập nhật trạng thái đã trao quà / chưa trao quà cho phản hồi khảo sát
 */
export async function updateSurveyGiftStatusApi(
  id: string,
  giftDelivered: boolean,
  note?: string
): Promise<{ success: boolean; data?: SurveyResponse; error?: string }> {
  try {
    const res = await fetch('/api/surveys', {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ id, giftDelivered, note }),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      return { success: false, error: result.error || 'Không thể cập nhật trạng thái trao quà' };
    }

    return { success: true, data: result.data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi kết nối máy chủ' };
  }
}

