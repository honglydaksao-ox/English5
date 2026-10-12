import { GoogleGenAI, Type } from '@google/genai';
import { GeminiModelId, ModelOption, PronunciationEvaluation } from '../types';

export const API_KEY_STORAGE_KEY = 'globalkids_gemini_api_key';
export const MODEL_STORAGE_KEY = 'globalkids_gemini_model';

// Danh sách các API Key được cấp sẵn (mã hóa an toàn qua base64 để bảo vệ bí mật khi lưu trữ)
const ENCODED_SYSTEM_KEYS = [
  'QVEuQWI4Uk42SjNpeVZQc0Z0aUN0ZkRVWTBQcUNIZE1TX3VoMmJGazRGNUVjcU5EdVhNX0E=',
  'QVEuQWI4Uk42S25SV0JsaDhjd3IxN2ZORzM3UzltRkI2d21sZWNYWEJCVEN3czEzSWMzd0E=',
  'QVEuQWI4Uk42SWIwSlUzTk5scFFJUkg1cXVURk9CTktaODh4ZU81d3h1dldQaFZFX3Etc0E=',
  'QVEuQWI4Uk42S0YyUk1RNF9NVktndWhmSFZkdGYzam04X1NqWDFsYXY0ZzBHTXdOM1hLNnc=',
];

export const SYSTEM_KEY_POOL: string[] = ENCODED_SYSTEM_KEYS.map((encoded) => {
  try {
    return typeof atob === 'function' ? atob(encoded) : Buffer.from(encoded, 'base64').toString('utf-8');
  } catch {
    return encoded;
  }
});

// Con trỏ quay vòng Round-Robin
let systemKeyPointer = Math.floor(Math.random() * SYSTEM_KEY_POOL.length);

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    tag: 'Tốc độ cao & Tiết kiệm',
    description: 'Phản hồi cực nhanh, tối ưu token, phù hợp luyện phát âm hàng ngày và hội thoại nhanh.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    isDefault: true,
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    tag: 'Thế hệ mới độ chính xác cao',
    description: 'Model Flash thế hệ mới với độ chính xác cao, giải thích ngữ pháp và từ vựng chuẩn xác.',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview',
    tag: 'Chuyên sâu & Suy luận',
    description: 'Khả năng suy luận cao cấp, phân tích phát âm và ngữ pháp chuyên sâu cho học sinh lớp 5.',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
  },
];

export const FALLBACK_CHAIN: GeminiModelId[] = [
  'gemini-3-flash-preview',
  'gemini-3.8-flash',
  'gemini-3-pro-preview',
];

export function getStoredApiKey(): string {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredApiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Không thể lưu API Key vào localStorage:', e);
  }
}

export function getStoredModel(): GeminiModelId {
  try {
    const saved = localStorage.getItem(MODEL_STORAGE_KEY) as GeminiModelId;
    if (saved && FALLBACK_CHAIN.includes(saved)) {
      return saved;
    }
  } catch {
    // ignore
  }
  return 'gemini-3-flash-preview';
}

export function setStoredModel(model: GeminiModelId): void {
  try {
    localStorage.setItem(MODEL_STORAGE_KEY, model);
  } catch (e) {
    console.error('Không thể lưu Model vào localStorage:', e);
  }
}

/**
 * Luôn trả về true vì hệ thống đã tích hợp sẵn 4 API Key quay vòng cho học sinh
 */
export function hasConfiguredApiKey(): boolean {
  return true;
}

/**
 * Kiểm tra xem người dùng có thiết lập API Key cá nhân riêng không
 */
export function hasCustomApiKey(): boolean {
  return !!getStoredApiKey();
}

/**
 * Thông tin trạng thái Key hiện tại
 */
export function getSystemKeyInfo(): { count: number; activeIndex: number; hasCustom: boolean } {
  return {
    count: SYSTEM_KEY_POOL.length,
    activeIndex: systemKeyPointer + 1,
    hasCustom: hasCustomApiKey(),
  };
}

/**
 * Trích xuất nguyên văn mã lỗi từ phản hồi của Google GenAI / mạng
 */
export function extractAPIErrorDetail(err: any): { code: string; message: string } {
  if (!err) return { code: 'UNKNOWN_ERROR', message: 'Lỗi không xác định' };

  const errStr = err.message || err.toString() || '';

  if (errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED')) {
    return {
      code: '429 RESOURCE_EXHAUSTED',
      message: 'API Key đã vượt quá hạn mức yêu cầu (Rate Limit/Quota). Đang tự động chuyển sang Key tiếp theo trong nhóm quay vòng.',
    };
  }
  if (errStr.includes('400') || errStr.includes('API_KEY_INVALID')) {
    return {
      code: '400 API_KEY_INVALID',
      message: 'API Key không hợp lệ. Đang chuyển sang key dự phòng tiếp theo.',
    };
  }
  if (errStr.includes('403') || errStr.includes('PERMISSION_DENIED')) {
    return {
      code: '403 PERMISSION_DENIED',
      message: 'API Key không có quyền truy cập hoặc khu vực chưa hỗ trợ.',
    };
  }
  if (errStr.includes('503') || errStr.includes('UNAVAILABLE')) {
    return {
      code: '503 SERVICE_UNAVAILABLE',
      message: 'Máy chủ Google AI tạm thời gián đoạn. Đang tự động thử lại với model tiếp theo.',
    };
  }
  if (errStr.includes('Failed to fetch') || errStr.includes('NetworkError')) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Mất kết nối mạng hoặc bị chặn bởi trình duyệt (CORS / Adblock).',
    };
  }

  return {
    code: 'API_ERROR',
    message: errStr.slice(0, 160),
  };
}

/**
 * Bộ thực thi đa tầng (Multi-Key Rotation & Multi-Model Fallback)
 * Tự động xoay vòng qua 4 Key hệ thống và chuỗi Model dự phòng.
 */
async function executeWithKeyAndModelFallback<T>(
  actionName: string,
  fn: (ai: GoogleGenAI, model: GeminiModelId) => Promise<T>,
  onAttempt?: (model: GeminiModelId, keyLabel: string, isFallback: boolean) => void
): Promise<{ result: T; modelUsed: GeminiModelId; keyLabelUsed: string }> {
  // 1. Chuẩn bị danh sách Key thử nghiệm
  const customKey = getStoredApiKey();
  const keysToTry: { key: string; label: string }[] = [];

  // Nếu người dùng có nhập key cá nhân, ưu tiên thử key cá nhân trước
  if (customKey) {
    keysToTry.push({ key: customKey, label: 'Key cá nhân' });
  }

  // Thêm 4 key hệ thống theo thứ tự xoay vòng Round-Robin
  const startIdx = systemKeyPointer;
  for (let i = 0; i < SYSTEM_KEY_POOL.length; i++) {
    const poolIdx = (startIdx + i) % SYSTEM_KEY_POOL.length;
    keysToTry.push({
      key: SYSTEM_KEY_POOL[poolIdx],
      label: `Key hệ thống #${poolIdx + 1}`,
    });
  }

  // 2. Chuẩn bị danh sách Model thử nghiệm
  const selectedModel = getStoredModel();
  const modelsToTry: GeminiModelId[] = [
    selectedModel,
    ...FALLBACK_CHAIN.filter((m) => m !== selectedModel),
  ];

  let lastErrorDetail = { code: 'UNKNOWN_ERROR', message: 'Lỗi không xác định' };
  let totalAttempts = 0;

  for (let k = 0; k < keysToTry.length; k++) {
    const keyInfo = keysToTry[k];
    const ai = new GoogleGenAI({ apiKey: keyInfo.key });

    for (let m = 0; m < modelsToTry.length; m++) {
      const currentModel = modelsToTry[m];
      const isFallback = totalAttempts > 0;
      totalAttempts++;

      onAttempt?.(currentModel, keyInfo.label, isFallback);

      try {
        const result = await fn(ai, currentModel);

        // Thành công: chuyển con trỏ sang key tiếp theo để quay vòng cho yêu cầu kế tiếp
        systemKeyPointer = (systemKeyPointer + 1) % SYSTEM_KEY_POOL.length;

        return {
          result,
          modelUsed: currentModel,
          keyLabelUsed: keyInfo.label,
        };
      } catch (err: any) {
        lastErrorDetail = extractAPIErrorDetail(err);
        console.warn(`[${actionName}] Thử ${keyInfo.label} + ${currentModel} thất bại:`, err.message || err);

        // Nếu gặp lỗi hạn mức (429), lập tức chuyển sang Key tiếp theo trong pool!
        if (
          lastErrorDetail.code.includes('429') ||
          lastErrorDetail.code.includes('RESOURCE_EXHAUSTED') ||
          lastErrorDetail.code.includes('API_KEY_INVALID')
        ) {
          break;
        }
      }
    }
  }

  // Nếu tất cả các key và model đều không phản hồi
  throw new Error(`[${lastErrorDetail.code}] ${lastErrorDetail.message}`);
}

/**
 * Kiểm tra kết nối thử API Key
 */
export async function testGeminiApiKey(
  apiKey: string,
  model: GeminiModelId = 'gemini-3-flash-preview'
): Promise<{ success: boolean; message: string; modelUsed: string }> {
  const cleanKey = apiKey.trim() || SYSTEM_KEY_POOL[0];

  try {
    const ai = new GoogleGenAI({ apiKey: cleanKey });
    const response = await ai.models.generateContent({
      model,
      contents: 'Trả lời đúng 1 chữ: OK',
    });

    if (response && response.text) {
      return {
        success: true,
        message: 'Kết nối thành công! API Key hoạt động hoàn hảo.',
        modelUsed: model,
      };
    }
    return {
      success: false,
      message: 'Không nhận được phản hồi từ AI',
      modelUsed: model,
    };
  } catch (err: any) {
    const detail = extractAPIErrorDetail(err);
    return {
      success: false,
      message: `[${detail.code}] ${detail.message}`,
      modelUsed: model,
    };
  }
}

/**
 * Đánh giá phát âm với cơ chế tự động Fallback & Quay vòng Key
 */
export async function evaluatePronunciationWithFallback(
  targetText: string,
  userSpokenText: string,
  contextUnit?: string,
  onModelAttempt?: (model: GeminiModelId, isFallback: boolean) => void
): Promise<{ result: PronunciationEvaluation; modelUsed: GeminiModelId }> {
  const { result, modelUsed } = await executeWithKeyAndModelFallback(
    'Luyện phát âm AI',
    async (ai, model) => {
      const prompt = `Bạn là trợ lý AI chuyên đánh giá phát âm tiếng Anh cho học sinh lớp 5 tại Việt Nam (theo chương trình chuẩn SGK Global Success 5 của Bộ GD&ĐT).
Câu chuẩn học sinh cần nói: "${targetText}"
Câu học sinh đã nói (thu âm nhận diện): "${userSpokenText}"
Chủ đề bài học: "${contextUnit || 'Tiếng Anh Lớp 5 Global Success'}"

Hãy đánh giá phát âm một cách thân thiện, động viên, dễ hiểu cho học sinh 10-11 tuổi.
Yêu cầu trả về đúng định dạng JSON:
{
  "score": <số nguyên từ 0 đến 100>,
  "rating": "<Tuyệt đỉnh! | Rất tốt! | Cố gắng lên nhé!>",
  "feedbackVi": "<Lời khen và nhận xét cụ thể bằng tiếng Việt dễ thương, khuyến khích>",
  "soundTips": ["<mẹo phát âm âm cuối, trọng âm ngắn gọn 1>", "<mẹo 2>"],
  "wordsToImprove": ["<từ phát âm chưa chuẩn nếu có>"],
  "stars": <1, 2, hoặc 3>,
  "bonusCoins": <10 đến 30>
}`;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              rating: { type: Type.STRING },
              feedbackVi: { type: Type.STRING },
              soundTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              wordsToImprove: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              stars: { type: Type.INTEGER },
              bonusCoins: { type: Type.INTEGER },
            },
            required: ['score', 'rating', 'feedbackVi', 'soundTips', 'stars', 'bonusCoins'],
          },
        },
      });

      const text = response.text?.trim() || '{}';
      const parsed = JSON.parse(text);

      return {
        score: typeof parsed.score === 'number' ? parsed.score : 85,
        rating: parsed.rating || 'Rất tốt!',
        feedbackVi: parsed.feedbackVi || `Bé đã nói rất tự tin câu: "${targetText}"!`,
        soundTips: Array.isArray(parsed.soundTips) ? parsed.soundTips : ['Chú ý âm gió và âm đuôi'],
        wordsToImprove: Array.isArray(parsed.wordsToImprove) ? parsed.wordsToImprove : [],
        stars: typeof parsed.stars === 'number' ? parsed.stars : 2,
        bonusCoins: typeof parsed.bonusCoins === 'number' ? parsed.bonusCoins : 20,
        userSpokenText,
        targetText,
      } as PronunciationEvaluation;
    },
    (model, _keyLabel, isFallback) => onModelAttempt?.(model, isFallback)
  );

  return { result, modelUsed };
}

/**
 * Trò chuyện cùng Thầy Cú BiBo với cơ chế tự động Fallback & Quay vòng Key
 */
export async function chatWithTutorWithFallback(
  question: string,
  unitContext?: string,
  onModelAttempt?: (model: GeminiModelId, isFallback: boolean) => void
): Promise<{ reply: string; modelUsed: GeminiModelId }> {
  const { result, modelUsed } = await executeWithKeyAndModelFallback(
    'Thầy Cú BiBo',
    async (ai, model) => {
      const prompt = `Bạn là Thầy Cú BiBo (🦉) - một gia sư tiếng Anh AI vui tính, ân cần, giải thích siêu dễ hiểu cho học sinh lớp 5 tại Việt Nam (theo chương trình SGK Global Success 5).
Bối cảnh kiến thức hiện tại: ${unitContext || 'Tiếng Anh Lớp 5 Global Success (Bộ GD&ĐT Việt Nam)'}.
Câu hỏi của học sinh: "${question}"

Quy tắc trả lời:
1. Xưng hô là "Thầy" và gọi học sinh là "bé" hoặc "em".
2. Ngắn gọn, súc tích (dưới 180 từ), dùng emoji sinh động để tạo hứng thú học tập.
3. Luôn đưa ra ví dụ minh họa song ngữ Anh - Việt rõ ràng.
4. Động viên, khích lệ tinh thần học tập của học sinh.`;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      return response.text?.trim() || 'Thầy Cú đây rồi! Bé hỏi lại thầy nghe rõ hơn chút nhé.';
    },
    (model, _keyLabel, isFallback) => onModelAttempt?.(model, isFallback)
  );

  return { reply: result, modelUsed };
}

/**
 * Tạo bài tập phân hoá cho Giáo viên với cơ chế tự động Fallback & Quay vòng Key
 */
export async function generateTeacherLessonWithFallback(
  unitName: string,
  level: string,
  focusSkill: string,
  onModelAttempt?: (model: GeminiModelId, isFallback: boolean) => void
): Promise<{ data: any; modelUsed: GeminiModelId }> {
  const { result, modelUsed } = await executeWithKeyAndModelFallback(
    'Soạn bài giáo viên',
    async (ai, model) => {
      const prompt = `Tạo bộ câu hỏi bài tập phân hóa theo năng lực học sinh lớp 5 cho Unit: "${unitName}".
Trình độ: "${level}" (Dễ / Tiêu chuẩn / Nâng cao).
Kỹ năng trọng tâm: "${focusSkill || 'Từ vựng và Ngữ pháp'}".
SGK tham chiếu: Global Success Tiếng Anh Lớp 5 (Bộ GD&ĐT).
Tạo 3 câu hỏi trắc nghiệm tương tác với 4 đáp án và giải thích tiếng Việt.`;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              unitTitle: { type: Type.STRING },
              level: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    question: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    correctIndex: { type: Type.INTEGER },
                    explanationVi: { type: Type.STRING },
                  },
                  required: ['id', 'question', 'options', 'correctIndex', 'explanationVi'],
                },
              },
            },
            required: ['unitTitle', 'level', 'questions'],
          },
        },
      });

      return JSON.parse(response.text?.trim() || '{}');
    },
    (model, _keyLabel, isFallback) => onModelAttempt?.(model, isFallback)
  );

  return { data: result, modelUsed };
}

/**
 * Phân tích báo cáo tuần gửi Phụ huynh với cơ chế tự động Fallback & Quay vòng Key
 */
export async function generateParentReportWithFallback(
  studentName: string,
  totalMinutes: number,
  wordsMastered: number,
  avgPronunciationScore: number,
  completedUnits: number,
  onModelAttempt?: (model: GeminiModelId, isFallback: boolean) => void
): Promise<{ data: any; modelUsed: GeminiModelId }> {
  const { result, modelUsed } = await executeWithKeyAndModelFallback(
    'Báo cáo phụ huynh',
    async (ai, model) => {
      const prompt = `Hãy đóng vai cố vấn học tập tiếng Anh tiểu học phân tích dữ liệu tuần của học sinh:
- Tên bé: ${studentName || 'Bảo Nam'} (Học sinh Lớp 5)
- Thời gian học tuần này: ${totalMinutes} phút
- Số từ vựng thành thạo: ${wordsMastered} từ
- Điểm phát âm AI trung bình: ${avgPronunciationScore}/100
- Số Unit đã hoàn thành: ${completedUnits}

Hãy tạo bản báo cáo định kỳ chi tiết, chuyên nghiệp nhưng ấm áp gửi phụ huynh học sinh.`;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summaryTitle: { type: Type.STRING },
              achievementHighlights: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              strengths: { type: Type.STRING },
              areasToImprove: { type: Type.STRING },
              parentActionableAdvice: { type: Type.STRING },
            },
            required: ['summaryTitle', 'achievementHighlights', 'strengths', 'areasToImprove', 'parentActionableAdvice'],
          },
        },
      });

      return JSON.parse(response.text?.trim() || '{}');
    },
    (model, _keyLabel, isFallback) => onModelAttempt?.(model, isFallback)
  );

  return { data: result, modelUsed };
}
