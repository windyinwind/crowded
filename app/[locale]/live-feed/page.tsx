'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import VideoAnalyzer from '@/components/VideoAnalyzer';

type CongestionStatus = 'empty' | 'few people' | 'moderate' | 'full';

interface FeedData {
  carriageNumber: number;
  status: CongestionStatus;
  capacity: number;
  timestamp: string;
  confidence?: number;
  reasoning?: string;
}

const statusConfig = {
  empty: { color: 'bg-green-500', dotColor: 'bg-green-400' },
  'few people': { color: 'bg-blue-500', dotColor: 'bg-blue-400' },
  moderate: { color: 'bg-yellow-500', dotColor: 'bg-yellow-400' },
  full: { color: 'bg-red-500', dotColor: 'bg-red-400' },
};

export default function LiveFeedScreen() {
  const t = useTranslations('liveFeed');

  const [feedData, setFeedData] = useState<FeedData>({
    carriageNumber: 4,
    status: 'moderate',
    capacity: 85,
    timestamp: new Date().toLocaleTimeString(),
  });
  const [useVideoAnalyzer, setUseVideoAnalyzer] = useState(true);

  // Handle real-time analysis results from video
  const handleAnalysis = (result: {
    status: CongestionStatus;
    capacity: number;
    confidence: number;
    reasoning: string;
  }) => {
    setFeedData({
      carriageNumber: feedData.carriageNumber,
      status: result.status,
      capacity: result.capacity,
      confidence: result.confidence,
      reasoning: result.reasoning,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

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
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Live Video Feed</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    {t('carriage')} #{feedData.carriageNumber} • {feedData.timestamp}
                  </p>
                </div>
              </div>
              <VideoAnalyzer
                onAnalysis={handleAnalysis}
                intervalMs={5000}
                autoStart={false}
              />
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

            {/* AI Analysis Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
              <h2 className="text-xl font-bold text-slate-800">AI Analysis</h2>

              <div className="space-y-3">
                {feedData.confidence !== undefined && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-600">Confidence</span>
                      <span className="font-semibold text-slate-800">
                        {feedData.confidence}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-purple-500 transition-all duration-500"
                        style={{ width: `${feedData.confidence}%` }}
                      />
                    </div>
                  </div>
                )}
                {feedData.reasoning && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-600 text-sm font-medium">Reasoning:</span>
                    <p className="text-slate-700 text-sm mt-1 leading-relaxed">
                      {feedData.reasoning}
                    </p>
                  </div>
                )}
                {!feedData.confidence && !feedData.reasoning && (
                  <div className="text-center py-8">
                    <div className="text-slate-400 text-4xl mb-3">🤖</div>
                    <p className="text-slate-500 text-sm">
                      Start video analysis to see AI insights
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
