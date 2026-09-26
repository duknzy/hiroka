import React, { useState } from 'react';
import { TargetSchool, Subject } from '../types';
import { X, User as UserIcon, LogIn, LogOut, Download, Upload, AlertCircle, Settings } from 'lucide-react';
import { User } from 'firebase/auth';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: TargetSchool;
  subjects: Subject[];
  user: User | null;
  onUpdateTarget: (target: TargetSchool) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  target,
  subjects,
  user,
  onUpdateTarget,
  onOpenAuth,
  onLogout,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(target.name || '');
  const [faculty, setFaculty] = useState(target.faculty || '');
  const [type, setType] = useState(target.type || '国公立');
  const [stream, setStream] = useState(target.stream || '理系');
  const [grade, setGrade] = useState(target.grade || '高3');
  const [examDateKyotsu, setExamDateKyotsu] = useState(target.examDateKyotsu || '2027-01-16');
  const [examDateSecondary, setExamDateSecondary] = useState(target.examDateSecondary || '2027-02-25');
  const [targetDeviation, setTargetDeviation] = useState(target.targetDeviation || 65);
  const [targetTotalHours, setTargetTotalHours] = useState(target.targetTotalHours || 3000);
  const [weights, setWeights] = useState<Record<string, number>>(target.subjectWeightPercent || {});

  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTarget({
      name: name.trim(),
      faculty: faculty.trim(),
      type,
      stream,
      grade,
      examDateKyotsu,
      examDateSecondary,
      targetDeviation: Number(targetDeviation) || 65,
      targetTotalHours: Number(targetTotalHours) || 3000,
      subjectWeightPercent: weights,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0d1322] rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-white/15 text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">志望校設定 & アカウント</h2>
              <p className="text-xs text-slate-400">志望大学・入試日程・配点比率の編集</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account Status Card */}
        <div className="mt-4 p-3.5 bg-slate-900/80 rounded-2xl border border-white/10 flex items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">
                {user ? (user.isAnonymous ? 'ゲストアカウント' : user.email) : '未ログイン'}
              </span>
              <span className="text-[11px] text-slate-400">
                {user
                  ? user.isAnonymous
                    ? 'メールアドレス登録でデータを安全に永続化できます'
                    : 'Firebase クラウド同期中'
                  : 'ログインするとデータがクラウドに保存されます'}
              </span>
            </div>
          </div>

          <div>
            {user && !user.isAnonymous ? (
              <button
                type="button"
                onClick={onLogout}
                className="px-3.5 py-1.5 text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 rounded-xl font-bold cursor-pointer transition-colors"
              >
                ログアウト
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl font-bold cursor-pointer shadow-lg shadow-indigo-600/30 ring-1 ring-white/15"
              >
                ログイン / 登録
              </button>
            )}
          </div>
        </div>

        {/* Target Form */}
        <form onSubmit={handleSaveTarget} className="mt-5 space-y-4 text-xs">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            志望校情報
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">大学名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 東京大学、早稲田大学、京都大学..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">学部・学科・入試区分</label>
              <input
                type="text"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                placeholder="例: 理科一類、政治経済学部、法学部..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">大学種別</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="国公立">国公立大学</option>
                <option value="難関私立">難関私立 (早慶等)</option>
                <option value="私立">私立大学</option>
                <option value="医学部">医学部</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">文理区分</label>
              <select
                value={stream}
                onChange={(e) => setStream(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="理系">理系</option>
                <option value="文系">文系</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">学年</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="高1">高1</option>
                <option value="高2">高2</option>
                <option value="高3">高3</option>
                <option value="既卒">浪人・既卒</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">共通テスト本番日</label>
              <input
                type="date"
                value={examDateKyotsu}
                onChange={(e) => setExamDateKyotsu(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">個別・2次試験本番日</label>
              <input
                type="date"
                value={examDateSecondary}
                onChange={(e) => setExamDateSecondary(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">目標偏差値</label>
              <input
                type="number"
                step="0.5"
                min="35"
                max="85"
                value={targetDeviation}
                onChange={(e) => setTargetDeviation(parseFloat(e.target.value) || 60)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-cyan-400 font-mono font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">目標総学習時間 (時間)</label>
              <input
                type="number"
                min="100"
                max="6000"
                step="50"
                value={targetTotalHours}
                onChange={(e) => setTargetTotalHours(Number(e.target.value) || 3000)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Subject Weights Section */}
          {subjects.length > 0 && (
            <div className="border-t border-white/10 pt-3">
              <label className="block font-semibold text-white mb-2">
                志望校の科目配点比率 (%) <span className="text-slate-400 font-normal">合計が100%になるよう設定</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {subjects.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
                    <span className="text-slate-300 flex-1 truncate font-medium">{sub.name}:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={weights[sub.id] || 0}
                      onChange={(e) =>
                        setWeights({
                          ...weights,
                          [sub.id]: Number(e.target.value) || 0,
                        })
                      }
                      className="w-14 text-center bg-slate-950 border border-white/10 rounded-lg p-1 font-mono text-cyan-400 font-bold focus:outline-none focus:border-cyan-500"
                    />
                    <span className="text-slate-400">%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-6 py-2 font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 rounded-xl shadow-lg shadow-indigo-600/30 cursor-pointer ring-1 ring-white/15"
            >
              志望校設定を保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
