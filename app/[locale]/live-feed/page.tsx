'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';

type CongestionStatus = 'empty' | 'few people' | 'moderate' | 'full';

interface FeedData {
  carriageNumber: number;
  status: CongestionStatus;
  capacity: number;
  timestamp: string;
}

const statusConfig = {
  empty: { color: 'bg-green-500', dotColor: 'bg-green-400' },
  'few people': { color: 'bg-blue-500', dotColor: 'bg-blue-400' },
  moderate: { color: 'bg-yellow-500', dotColor: 'bg-yellow-400' },
  full: { color: 'bg-red-500', dotColor: 'bg-red-400' },
};

export default function LiveFeedScreen() {
  const t = useTranslations('liveFeed');

  // Mock data - in production, this would come from your backend
  const [feedData] = useState<FeedData>({
    carriageNumber: 4,
    status: 'moderate',
    capacity: 85,
    timestamp: new Date().toLocaleTimeString(),
  });

  const config = statusConfig[feedData.status];

  const getStatusLabel = (status: CongestionStatus) => {
    const statusMap = {
      empty: t('legend'),
      'few people': t('legend'),
      moderate: t('legend'),
      full: t('legend'),
    };
    return statusMap[status];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <LanguageSwitcher />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-800">
                {t('title')}
              </h1>
              <p className="text-slate-600 mt-1">{t('carriage')} #{feedData.carriageNumber}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex items-center">
                <div className={`${config.dotColor} w-3 h-3 rounded-full animate-pulse`} />
                <div className={`${config.dotColor} w-3 h-3 rounded-full absolute animate-ping`} />
              </div>
              <span className="text-lg font-semibold text-slate-700">{t('live')}</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Feed - Takes up 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Container */}
            <div className="bg-black rounded-2xl shadow-2xl overflow-hidden aspect-video relative">
              {/* Video placeholder - Replace with actual video stream */}
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
                <div className="text-center space-y-4">
                  <div className="text-white/40 text-6xl">📹</div>
                  <div className="text-white/60 text-xl font-medium">
                    {t('cameraFeed')}
                  </div>
                  <div className="text-white/40 text-sm">
                    {t('videoPlaceholder')}
                  </div>
                </div>
              </div>

              {/* Overlay Info */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
                  <div className="text-sm opacity-75">{t('carriage')}</div>
                  <div className="text-3xl font-bold">#{feedData.carriageNumber}</div>
                </div>
                <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-sm">
                  {feedData.timestamp}
                </div>
              </div>
            </div>

            {/* Video Controls */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <button className="px-6 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors">
                    {t('pause')}
                  </button>
                  <button className="px-6 py-3 bg-slate-200 text-slate-800 rounded-lg font-medium hover:bg-slate-300 transition-colors">
                    {t('snapshot')}
                  </button>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="text-sm font-medium">{t('quality')}:</span>
                  <select className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
                    <option>1080p</option>
                    <option>720p</option>
                    <option>480p</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Status Panel */}
          <div className="space-y-4">
            {/* Current Status Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
              <h2 className="text-2xl font-bold text-slate-800">{t('currentStatus')}</h2>

              {/* Status Badge */}
              <div className={`${config.color} text-white rounded-xl p-4 text-center`}>
                <div className="text-sm font-semibold uppercase tracking-wider opacity-90">
                  {t('currentStatus')}
                </div>
                <div className="text-3xl font-bold mt-1">{feedData.status}</div>
              </div>

              {/* Capacity */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-600 font-medium">{t('capacity')}</span>
                  <span className="text-2xl font-bold text-slate-800">
                    {feedData.capacity}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full ${config.color} transition-all duration-500`}
                    style={{ width: `${Math.min(feedData.capacity, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Statistics Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
              <h2 className="text-xl font-bold text-slate-800">{t('statistics')}</h2>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">{t('peakTime')}</span>
                  <span className="font-semibold text-slate-800">8:00 AM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">{t('averageToday')}</span>
                  <span className="font-semibold text-slate-800">67%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">{t('passengers')}</span>
                  <span className="font-semibold text-slate-800">~42</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
