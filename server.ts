import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialize Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'GlobalKids English 5 Backend' });
});

// API 1: AI Pronunciation & Speaking Assessment
app.post('/api/gemini/pronunciation', async (req, res) => {
  try {
    const { targetText, userSpokenText, contextUnit } = req.body;

    if (!targetText || !userSpokenText) {
      return res.status(400).json({
        error: 'targetText và userSpokenText là bắt buộc',
      });
    }

    const ai = getGemini();
    if (!ai) {
      // Graceful fallback with rule-based heuristics if API key is not configured
      const cleanTarget = targetText.trim().toLowerCase().replace(/[.,?!]/g, '');
      const cleanSpoken = userSpokenText.trim().toLowerCase().replace(/[.,?!]/g, '');
      const isExact = cleanTarget === cleanSpoken;
      const targetWords = cleanTarget.split(/\s+/);
      const spokenWords = cleanSpoken.split(/\s+/);
      const matchCount = targetWords.filter((w: string) => spokenWords.includes(w)).length;
      const matchRatio = matchCount / Math.max(targetWords.length, 1);
      const score = Math.round(isExact ? 95 + Math.floor(Math.random() * 5) : Math.max(40, matchRatio * 85));

      return res.json({
        score,
        rating: score >= 85 ? 'Tuyệt đỉnh!' : score >= 70 ? 'Rất tốt!' : 'Cần luyện thêm chút nữa!',
        feedbackVi: score >= 80 
          ? `Bé phát âm rất chuẩn câu "${targetText}". Ngữ điệu tự nhiên và âm đuôi rất rõ ràng!`
          : `Bé đã nói được khá tốt! Hãy chú ý phát âm rõ hơn các âm gió và phụ âm cuối nhé.`,
        soundTips: [
          'Nhớ bật nhẹ âm cuối (ending sound) như /s/, /t/, /d/',
          'Lên giọng nhẹ ở cuối câu hỏi Yes/No và xuống giọng ở câu trần thuật'
        ],
        wordsToImprove: targetWords.filter((w: string) => !spokenWords.includes(w)),
        stars: score >= 85 ? 3 : score >= 65 ? 2 : 1,
        bonusCoins: score >= 85 ? 30 : 15
      });
    }

    const prompt = `Bạn là trợ lý AI luyện phát âm tiếng Anh cho học sinh lớp 5 tại Việt Nam (theo chương trình Global Success 5 của Bộ GD&ĐT).
Câu chuẩn học sinh cần nói: "${targetText}"
Câu học sinh đã nói (thu âm nhận diện): "${userSpokenText}"
Chủ đề bài học: "${contextUnit || 'Tiếng Anh Lớp 5'}"

Hãy đánh giá phát âm một cách thân thiện, động viên, dễ hiểu cho trẻ em 10-11 tuổi.
Trả về JSON cấu trúc:
- score: số nguyên 0-100
- rating: "Tuyệt đỉnh!" (>=85) | "Rất tốt!" (70-84) | "Cố gắng lên nhé!" (<70)
- feedbackVi: Lời khen và nhận xét cụ thể bằng tiếng Việt dễ thương, khuyến khích học sinh
- soundTips: mảng 2-3 lời khuyên phát âm cụ thể (ví dụ âm /t/, /s/, /ʃ/, trọng âm từ)
- wordsToImprove: mảng các từ học sinh phát âm chưa chuẩn
- stars: 1, 2, hoặc 3 sao
- bonusCoins: số xu thưởng (10 đến 30)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
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
          required: ['score', 'rating', 'feedbackVi', 'soundTips', 'wordsToImprove', 'stars', 'bonusCoins'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json(parsed);
  } catch (error) {
    console.error('Error in /api/gemini/pronunciation:', error);
    return res.status(500).json({
      error: 'Không thể phân tích phát âm lúc này.',
      details: String(error),
    });
  }
});

// API 2: AI Mascot Tutor (Hỏi đáp ngữ pháp, từ vựng theo giáo trình Global Success 5)
app.post('/api/gemini/ai-tutor', async (req, res) => {
  try {
    const { question, currentUnit, chatHistory } = req.body;
    const ai = getGemini();

    if (!ai) {
      return res.json({
        reply: `Chào bé! Thầy Cú BiBo đây! Trong chương trình Tiếng Anh Lớp 5 Global Success, bài "${currentUnit || 'Bài học'}" rất thú vị. Cấu trúc câu hỏi chính hãy nhớ dùng trợ động từ phù hợp nhé! Bé hãy luyện tập thêm flashcard để ghi nhớ siêu tốc nha! 🌟`,
      });
    }

    const systemInstruction = `Bạn là Thầy Cú BiBo - Linh vật đại sứ học tập Tiếng Anh Lớp 5 chương trình Global Success tại Việt Nam.
Phong cách trò chuyện: Vui tươi, khuyến khích, ngộ nghĩnh, dùng từ ngữ ấm áp, gần gũi với học sinh 10 tuổi. Luôn giải thích ngữ pháp và từ vựng một cách đơn giản nhất, có ví dụ song ngữ Anh - Việt sinh động.`;

    const contents = `Học sinh đang học Unit: ${currentUnit || 'Global Success 5'}.
Câu hỏi của bé: "${question}"
Lịch sử tóm tắt: ${JSON.stringify(chatHistory || [])}

Hãy trả lời ngắn gọn (khoảng 2-4 câu dễ thương), giải thích dễ hiểu kèm ví dụ mẫu câu vui nhộn.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
      },
    });

    return res.json({ reply: response.text });
  } catch (error) {
    console.error('Error in /api/gemini/ai-tutor:', error);
    return res.status(500).json({ error: 'Lỗi trợ lý AI' });
  }
});

// API 3: Teacher Customized Lesson Generator
app.post('/api/gemini/teacher-generate', async (req, res) => {
  try {
    const { unitName, level, focusSkill } = req.body;
    const ai = getGemini();

    if (!ai) {
      return res.json({
        unitTitle: unitName || 'Unit 1: All About Me',
        level: level || 'Tiêu chuẩn',
        questions: [
          {
            id: 1,
            question: 'What is your favourite subject?',
            options: ['I like English and Art.', 'She is ten years old.', 'I live in Hanoi.', 'It is on Monday.'],
            correctIndex: 0,
            explanationVi: 'Câu hỏi về môn học yêu thích (favourite subject) nên câu trả lời là "I like English and Art".'
          },
          {
            id: 2,
            question: 'How often do you have English?',
            options: ['I have it four times a week.', 'I am in class 5A.', 'My teacher is Ms. Hoa.', 'Yes, I do.'],
            correctIndex: 0,
            explanationVi: '"How often" hỏi tần suất, trả lời "four times a week" (bốn lần một tuần).'
          }
        ]
      });
    }

    const prompt = `Tạo bộ câu hỏi bài tập phân hóa theo năng lực học sinh lớp 5 cho Unit: "${unitName}".
Trình độ: "${level}" (Dễ / Tiêu chuẩn / Nâng cao).
Kỹ năng trọng tâm: "${focusSkill || 'Từ vựng và Ngữ pháp'}".
SGK tham chiếu: Global Success Tiếng Anh Lớp 5.
Tạo 3 câu hỏi trắc nghiệm tương tác với 4 đáp án và giải thích tiếng Việt.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
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
                    items: { type: Type.STRING }
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanationVi: { type: Type.STRING }
                },
                required: ['id', 'question', 'options', 'correctIndex', 'explanationVi']
              }
            }
          },
          required: ['unitTitle', 'level', 'questions']
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json(parsed);
  } catch (error) {
    console.error('Error in /api/gemini/teacher-generate:', error);
    return res.status(500).json({ error: 'Lỗi tạo bài tập giáo viên' });
  }
});

// API 4: Parent Weekly AI Insights Report
app.post('/api/gemini/parent-report', async (req, res) => {
  try {
    const { studentName, totalMinutes, wordsMastered, avgPronunciationScore, completedUnits } = req.body;
    const ai = getGemini();

    if (!ai) {
      return res.json({
        summaryTitle: `Báo Cáo Học Tập Tuần Của Bé ${studentName || 'Bảo Nam'}`,
        achievementHighlights: [
          `Đã hoàn thành xuất sắc ${completedUnits || 3} bài học trong tuần.`,
          `Thời lượng rèn luyện đạt ${totalMinutes || 120} phút, duy trì thói quen học tập đều đặn.`,
          `Điểm phát âm AI trung bình đạt ${avgPronunciationScore || 88}/100 điểm.`
        ],
        strengths: 'Khả năng ghi nhớ từ vựng qua Flashcard và phản xạ ngữ điệu câu hỏi rất tốt.',
        areasToImprove: 'Cần chú ý thêm âm gió đuôi (/s/, /z/) trong các từ chỉ hành động số ít.',
        parentActionableAdvice: 'Phụ huynh nên dành 10 phút cùng bé thi đấu Đấu trường từ vựng để khen ngợi và thưởng sticker cho bé!'
      });
    }

    const prompt = `Hãy đóng vai cố vấn học tập tiếng Anh tiểu học phân tích dữ liệu tuần của học sinh:
- Tên bé: ${studentName || 'Bảo Nam'} (Học sinh Lớp 5)
- Thời gian học tuần này: ${totalMinutes} phút
- Số từ vựng thành thạo: ${wordsMastered} từ
- Điểm phát âm AI trung bình: ${avgPronunciationScore}/100
- Số Unit đã hoàn thành: ${completedUnits}

Hãy tạo bản báo cáo định kỳ chi tiết, chuyên nghiệp nhưng ấm áp gửi phụ huynh học sinh.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summaryTitle: { type: Type.STRING },
            achievementHighlights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            strengths: { type: Type.STRING },
            areasToImprove: { type: Type.STRING },
            parentActionableAdvice: { type: Type.STRING }
          },
          required: ['summaryTitle', 'achievementHighlights', 'strengths', 'areasToImprove', 'parentActionableAdvice']
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json(parsed);
  } catch (error) {
    console.error('Error in /api/gemini/parent-report:', error);
    return res.status(500).json({ error: 'Lỗi tạo báo cáo phụ huynh' });
  }
});

// Vite middleware / static serving
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GlobalKids English 5 server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
