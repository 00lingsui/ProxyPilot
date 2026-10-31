import React, { useState } from 'react';
import { X, Server, Shuffle, FileCode, Layers } from 'lucide-react';
import { Profile, ProfileType, FixedProfile, SwitchProfile, PacProfile, VirtualProfile } from '../types/omega';

interface NewProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProfile: (profile: Profile) => void;
  existingProfiles: Profile[];
}

export const NewProfileModal: React.FC<NewProfileModalProps> = ({
  isOpen,
  onClose,
  onAddProfile,
  existingProfiles,
}) => {
  const [name, setName] = useState('');
  const [profileType, setProfileType] = useState<ProfileType>('FixedProfile');
  const [color, setColor] = useState('#2563eb');

  if (!isOpen) return null;

  const colorPalette = [
    '#2563eb', // Blue
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#ea580c', // Orange
    '#64748b', // Slate
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || '新建情景模式';
    const id = 'profile_' + Date.now().toString(36);

    let newProfile: Profile;

    if (profileType === 'FixedProfile') {
      newProfile = {
        id,
        name: finalName,
        profileType: 'FixedProfile',
        color,
        useSingleProxy: true,
        fallbackProxy: {
          scheme: 'socks5',
          host: '127.0.0.1',
          port: 7897,
        },
        bypassList: [
          { id: 'b1', pattern: '<local>', enabled: true },
          { id: 'b2', pattern: '127.0.0.1', enabled: true },
        ],
      } as FixedProfile;
    } else if (profileType === 'SwitchProfile') {
      newProfile = {
        id,
        name: finalName,
        profileType: 'SwitchProfile',
        color,
        defaultProfileId: 'direct',
        rules: [
          {
            id: 'r1',
            conditionType: 'HostWildcardCondition',
            pattern: '*.google.com',
            profileId: existingProfiles.find(p => p.profileType === 'FixedProfile')?.id || 'direct',
            enabled: true,
            note: 'Google 国际服务',
          },
        ],
      } as SwitchProfile;
    } else if (profileType === 'PacProfile') {
      newProfile = {
        id,
        name: finalName,
        profileType: 'PacProfile',
        color,
        pacUrl: 'http://127.0.0.1:7897/proxy.pac',
      } as PacProfile;
    } else {
      newProfile = {
        id,
        name: finalName,
        profileType: 'VirtualProfile',
        color,
        targetProfileId: existingProfiles[0]?.id || 'direct',
      } as VirtualProfile;
    }

    onAddProfile(newProfile);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <h2 className="text-sm font-bold tracking-tight">新建情景模式 (New Profile)</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCreate} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              情景模式名称 (Profile Name)
            </label>
            <input
              type="text"
              required
              placeholder="例如：Clash 节点 / 办公内网 / 自动分流"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Type Options */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              情景模式类型 (Profile Type)
            </label>
            <div className="space-y-2">
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  profileType === 'FixedProfile' ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  checked={profileType === 'FixedProfile'}
                  onChange={() => setProfileType('FixedProfile')}
                  className="mt-0.5 text-blue-600 focus:ring-0"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <Server className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>代理服务器 (Proxy Profile)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    通过固定的 HTTP / HTTPS / SOCKS 协议代理服务器转发请求，支持排除列表。
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  profileType === 'SwitchProfile' ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  checked={profileType === 'SwitchProfile'}
                  onChange={() => setProfileType('SwitchProfile')}
                  className="mt-0.5 text-blue-600 focus:ring-0"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <Shuffle className="w-3.5 h-3.5 text-amber-500" />
                    <span>自动切换模式 (Auto Switch)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    根据通配符、正则规则和在线规则列表 (GFWList) 自动为不同网站选择代理。
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  profileType === 'PacProfile' ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  checked={profileType === 'PacProfile'}
                  onChange={() => setProfileType('PacProfile')}
                  className="mt-0.5 text-blue-600 focus:ring-0"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <FileCode className="w-3.5 h-3.5 text-pink-500" />
                    <span>PAC 脚本模式 (PAC Profile)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    通过在线 PAC 网址或自定义 JavaScript FindProxyForURL 脚本动态指派。
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  profileType === 'VirtualProfile' ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  checked={profileType === 'VirtualProfile'}
                  onChange={() => setProfileType('VirtualProfile')}
                  className="mt-0.5 text-blue-600 focus:ring-0"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    <span>虚情景模式 (Virtual Profile)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    作为另一个情景模式的别名引用，便于在多规则下批量替换底层代理。
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              识别标记色
            </label>
            <div className="flex items-center gap-2">
              {colorPalette.map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-md transition-transform ${color === c ? 'scale-120 ring-2 ring-slate-900 dark:ring-white ring-offset-1' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors shadow-2xs"
            >
              创建情景模式
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
