import React, { useState } from 'react';
import { TargetSchool, Subject } from '../types';
import { X, User as UserIcon, LogIn, LogOut, Download, Upload, AlertCircle } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">志望校設定 & アカウント</h2>
            <p className="text-xs text-slate-500">志望大学・入試日程・配点比率の編集</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account Status Card */}
        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-slate-800 block">
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
                className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg font-medium cursor-pointer"
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
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                ログイン / 登録
              </button>
            )}
          </div>
        </div>

        {/* Target Form */}
        <form onSubmit={handleSaveTarget} className="mt-5 space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm">志望校情報</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">大学名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 東京大学、早稲田大学、京都大学..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">学部・学科・入試区分</label>
              <input
                type="text"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                placeholder="例: 理科一類、政治経済学部、法学部..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">大学種別</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
              >
                <option value="国公立">国公立大学</option>
                <option value="難関私立">難関私立 (早慶等)</option>
                <option value="私立">私立大学</option>
                <option value="医学部">医学部</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">文理区分</label>
              <select
                value={stream}
                onChange={(e) => setStream(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
              >
                <option value="理系">理系</option>
                <option value="文系">文系</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">学年</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
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
              <label className="block font-semibold text-slate-700 mb-1">共通テスト本番日</label>
              <input
                type="date"
                value={examDateKyotsu}
                onChange={(e) => setExamDateKyotsu(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">個別・2次試験本番日</label>
              <input
                type="date"
                value={examDateSecondary}
                onChange={(e) => setExamDateSecondary(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">目標偏差値</label>
              <input
                type="number"
                step="0.5"
                min="35"
                max="85"
                value={targetDeviation}
                onChange={(e) => setTargetDeviation(parseFloat(e.target.value) || 60)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">目標総学習時間 (時間)</label>
              <input
                type="number"
                min="100"
                max="6000"
                step="50"
                value={targetTotalHours}
                onChange={(e) => setTargetTotalHours(Number(e.target.value) || 3000)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-mono"
              />
            </div>
          </div>

          {/* Subject Weights Section */}
          {subjects.length > 0 && (
            <div className="border-t border-slate-100 pt-3">
              <label className="block font-semibold text-slate-800 mb-2">
                志望校の科目配点比率 (%) <span className="text-slate-400 font-normal">合計が100%になるよう設定</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {subjects.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-700 flex-1 truncate font-medium">{sub.name}:</span>
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
                      className="w-12 text-center bg-white border border-slate-200 rounded p-1 font-mono tabular-nums"
                    />
                    <span className="text-slate-400">%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
            >
              志望校設定を保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
