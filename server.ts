import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Initialize Gemini SDK if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI Advisor API endpoint for Japanese University Entrance Exam Study Guidance
app.post('/api/ai-advisor', async (req: Request, res: Response) => {
  try {
    const {
      targetSchool,
      grade,
      stream, // '理系' | '文系'
      weeklyHours,
      subjectBreakdown, // Record<string, number>
      weakPoints,
      userQuestion,
    } = req.body;

    if (!aiClient) {
      // Heuristic fallback if GEMINI_API_KEY is not yet populated
      const fallbackAdvice = generateRuleBasedAdvice(
        targetSchool || '国公立・難関私大',
        stream || '理系',
        weeklyHours || 30,
        weakPoints || '英語・数学の基礎定着',
        userQuestion || ''
      );
      return res.json({ advice: fallbackAdvice, isFallback: true });
    }

    const systemInstruction = `あなたは大学受験（東大・京大・旧帝大・医学部・早慶・MARCH・関関同立など）のトップ学習戦略コーチです。
日本の大学受験システム（共通テスト、2次試験、個別日程、配点比率）に極めて精通しています。
高校生目線で温かく励ましつつも、根拠ある数値（時間配分、周回ペース、過去問開始時期）を交えて具体的かつ即効性のあるアドバイスを提供してください。
回答は高校生が読みやすいように、要点を簡潔な箇条書きやステップに整理してください。`;

    const prompt = `【受験生の現況】
- 志望校: ${targetSchool || '未定（難関大志望）'}
- 学年 / 文理: ${grade || '高3'} (${stream || '理系'})
- 直近の週間勉強時間: ${weeklyHours || 0}時間
- 科目別の勉強時間配分: ${JSON.stringify(subjectBreakdown || {})}
- 克服したい弱点・悩み: ${weakPoints || '特になし'}
- 相談内容: ${userQuestion || '今週の優先課題と科目配分の最適化について'}

以下の項目を含むアドバイスを日本語で作成してください:
1. 【現状分析と評価】（ポジティブな評価と改善点）
2. 【今週・今月の科目別推奨時間バランス】（比率と具体的な理由）
3. 【具体的な教材・勉強法アクションプラン】（明日からすぐできること3つ）
4. 【アドバイザーからの激励の一言】`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({
      advice: response.text || '計画を定期的に見直して前進しましょう！',
      isFallback: false,
    });
  } catch (error: any) {
    console.error('Gemini API call failed:', error);
    // Graceful fallback on network or API failure
    const fallbackAdvice = generateRuleBasedAdvice(
      req.body.targetSchool || '志望校',
      req.body.stream || '理系',
      req.body.weeklyHours || 30,
      req.body.weakPoints || '弱点補強',
      req.body.userQuestion || ''
    );
    return res.json({ advice: fallbackAdvice, isFallback: true });
  }
});

function generateRuleBasedAdvice(
  target: string,
  stream: string,
  hours: number,
  weak: string,
  question: string
): string {
  const isScience = stream.includes('理');
  return `### 【学習戦略アドバイス】${target}合格へ向けた優先戦略

#### 1. 現状分析と評価
現在の週間勉強時間（約${hours}時間）は、合格基準ラインに向けて${hours >= 35 ? '非常に高い水準を維持できています！' : '基礎を固めつつ、もう一段階ギアを上げていける伸び代があります。'}
特に受験期においては「質の高い集中」と「苦手分野への先行投資」が合否を分けます。

#### 2. 推奨科目バランス（${isScience ? '理系推奨' : '文系推奨'}）
- ${isScience ? '数学 (35%)' : '英語 (35%)'}: 最優先。毎日のルーティンとして朝〜午前に配置。
- ${isScience ? '英語 (25%)' : '国語・地歴 (30%)'}: 単語・熟語・構文精読のスピード維持。
- ${isScience ? '理科 (物理・化学・生物) (30%)' : '数学/選択科目 (25%)'}: 典型問題の解法パターンを網羅。
- その他・共通テスト対策 (10%): 情報I・リスニングのスキマ時間学習。

#### 3. 明日から実行できる3大アクション
1. **「間違えた問題専用の解き直しノート」の作成**:
   「${weak}」の定着には、模試や問題集で間違えた問題を翌日と1週間後に必ず再復習する仕組みが最重要です。
2. **タイムブロックの徹底**:
   放課後や休日の勉強時間を「90分1コマ」で区切り、開始前に解くページ数を宣言してからタイマーをスタートしましょう。
3. **基礎参考書の周回完了**:
   手持ちのコア参考書（例: 単語帳、青チャート、基礎問題精講等）を最低3周して瞬時に解法が浮かぶ状態を目指しましょう。

> 「今日積み上げた1問の理解が、入試本番の1点となり合否を決定づけます。自信を持って進みましょう！」`;
}

// Vite integration or static serve
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
