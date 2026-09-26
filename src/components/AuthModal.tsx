import React, { useState } from 'react';
import {
  loginWithEmail,
  registerWithEmail,
  loginAsGuest,
} from '../firebase/service';
import { X, LogIn, UserPlus, Sparkles, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('メールアドレスまたはパスワードが正しくありません。');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('このメールアドレスは既に登録されています。ログインしてください。');
      } else if (err.code === 'auth/weak-password') {
        setError('パスワードは6文字以上で設定してください。');
      } else {
        setError('認証エラーが発生しました。入力内容を確認してください。');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginAsGuest();
      onClose();
    } catch (err) {
      console.error(err);
      setError('ゲストログインに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0d1322] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-white/15 text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            {mode === 'login' ? (
              <LogIn className="w-5 h-5 text-indigo-400" />
            ) : (
              <UserPlus className="w-5 h-5 text-cyan-400" />
            )}
            <h2 className="text-base font-bold text-white">
              {mode === 'login' ? 'PassRoute にログイン' : '新規アカウント登録'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-2 mb-4">
          クラウド（Firebase）上にあなたの学習時間・教材進捗を安全に保存し、どの端末からでも同期できます。
        </p>

        {error && (
          <div className="mb-4 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">メールアドレス</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@student.com"
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">パスワード</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6文字以上のパスワード"
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 rounded-xl transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-indigo-600/30 ring-1 ring-white/15"
          >
            {loading ? '処理中...' : mode === 'login' ? 'ログインする' : 'アカウントを作成'}
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-[11px] text-slate-500">
            <span className="bg-[#0d1322] px-2">または</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGuestLogin}
          disabled={loading}
          className="w-full py-2.5 px-3 text-xs font-semibold text-slate-300 bg-slate-900/80 hover:bg-slate-800 hover:text-white border border-white/10 rounded-xl transition-colors cursor-pointer"
        >
          ゲストとして利用開始（登録なし）
        </button>

        <div className="mt-4 pt-3 border-t border-white/10 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <span>
              アカウントをお持ちでないですか？{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-bold text-cyan-400 hover:underline cursor-pointer ml-1"
              >
                新規登録
              </button>
            </span>
          ) : (
            <span>
              すでにアカウントをお持ちですか？{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-cyan-400 hover:underline cursor-pointer ml-1"
              >
                ログイン
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
