import React from 'react';
import { Layers, Trash2 } from 'lucide-react';
import { VirtualProfile, Profile } from '../types/omega';

interface ProfileVirtualEditorProps {
  profile: VirtualProfile;
  allProfiles: Profile[];
  onChange: (updated: VirtualProfile) => void;
  onDeleteProfile: (id: string) => void;
}

export const ProfileVirtualEditor: React.FC<ProfileVirtualEditorProps> = ({
  profile,
  allProfiles,
  onChange,
  onDeleteProfile,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <span
              className="w-4 h-4 rounded-sm shrink-0"
              style={{ backgroundColor: profile.color || '#6366f1' }}
            />
            <input
              type="text"
              value={profile.name}
              onChange={(e) => onChange({ ...profile, name: e.target.value })}
              className="text-lg font-bold text-slate-900 dark:text-white border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:outline-hidden px-1 py-0.5 rounded transition-colors bg-transparent"
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            虚情景模式 (Virtual Profile) 是一个动态别名，指向另一个情景模式。修改指向即可无缝更改所有引用它的规则。
          </p>
        </div>

        <button
          onClick={() => onDeleteProfile(profile.id)}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>删除</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg p-5 space-y-4 shadow-2xs">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            映射指向的目标情景模式 (Target Profile)
          </label>
          <select
            value={profile.targetProfileId}
            onChange={(e) => onChange({ ...profile, targetProfileId: e.target.value })}
            className="w-full max-w-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            {allProfiles
              .filter(p => p.id !== profile.id)
              .map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.profileType})
                </option>
              ))}
          </select>
        </div>
      </div>
    </div>
  );
};
