'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import VideoAnalyzer from '@/components/VideoAnalyzer';

type CongestionStatus = 'empty' | 'few people' | 'moderate' | 'full';

interface CarriageData {
  carriageNumber: number;
  status: CongestionStatus;
  capacity: number;
}

const statusConfig = {
  empty: {
    color: 'bg-green-500',
    textColor: 'text-green-600',
    bgLight: 'bg-green-100',
    border: 'border-green-500',
  },
  'few people': {
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
    bgLight: 'bg-blue-100',
    border: 'border-blue-500',
  },
  moderate: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-600',
    bgLight: 'bg-yellow-100',
    border: 'border-yellow-500',
  },
  full: {
    color: 'bg-red-500',
    textColor: 'text-red-600',
    bgLight: 'bg-red-100',
    border: 'border-red-500',
  },
};

export default function CarriageStatusScreen() {
  const t = useTranslations('status');

  const [currentCarriage, setCurrentCarriage] = useState<number>(3);
  const [allCarriages, setAllCarriages] = useState<CarriageData[]>([
    { carriageNumber: 1, status: 'few people', capacity: 45 },
    { carriageNumber: 2, status: 'moderate', capacity: 75 },
    { carriageNumber: 3, status: 'moderate', capacity: 85 },
    { carriageNumber: 4, status: 'full', capacity: 95 },
    { carriageNumber: 5, status: 'empty', capacity: 30 },
  ]);

  // Handle real-time analysis results from video
  const handleAnalysis = (result: { status: CongestionStatus; capacity: number }) => {
    setAllCarriages(prev =>
      prev.map(carriage =>
        carriage.carriageNumber === currentCarriage
          ? { ...carriage, status: result.status, capacity: result.capacity }
          : carriage
      )
    );
  };

  const currentCarriageData = allCarriages.find(c => c.carriageNumber === currentCarriage);
  const config = currentCarriageData ? statusConfig[currentCarriageData.status] : statusConfig.moderate;

  const getStatusLabel = (status: CongestionStatus) => {
    const statusMap = {
      empty: t('empty'),
      'few people': t('fewPeople'),
      moderate: t('moderate'),
      full: t('full'),
    };
    return statusMap[status];
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-slate-900 to-slate-800 p-6">
      <LanguageSwitcher />
      <div className="w-full max-w-[1800px]">
        {/* Main Content - Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">
                  {t('title')}
                </h1>
                <p className="text-blue-100 text-lg">{t('subtitle')}</p>
              </div>
              <div className="text-right">
                <div className="text-blue-100 text-sm">{t('nextTrain', { minutes: 3 })}</div>
                <div className="text-white text-2xl font-bold mt-1">下北沢</div>
              </div>
            </div>
          </div>

          {/* Train Information Bar */}
          <div className="bg-slate-100 px-8 py-4 border-b-2 border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-slate-600 text-sm">{t('trainInfo')}</span>
                  <div className="text-slate-800 font-bold text-xl">急行 新宿ゆき</div>
                </div>
                <div className="h-8 w-px bg-slate-300"></div>
                <div className="text-slate-600 text-sm">{t('selectCarriage')}</div>
              </div>
            </div>
          </div>

          {/* Carriage Display Section */}
          <div className="px-8 py-12">
            {/* Carriage Number Labels */}
            <div className="flex items-end justify-center gap-3 mb-6">
              {allCarriages.map((carriage) => {
                const isCurrentCarriage = carriage.carriageNumber === currentCarriage;
                const carriageConfig = statusConfig[carriage.status];

                return (
                  <div
                    key={carriage.carriageNumber}
                    className={`flex flex-col items-center transition-all duration-300 ${
                      isCurrentCarriage ? 'scale-110' : ''
                    }`}
                  >
                    {/* Carriage Box */}
                    <div
                      className={`
                        ${isCurrentCarriage ? 'w-24 h-32' : 'w-16 h-20'}
                        ${carriageConfig.bgLight}
                        ${isCurrentCarriage ? `border-4 ${carriageConfig.border}` : 'border-2 border-slate-300'}
                        rounded-2xl
                        flex flex-col items-center justify-center
                        transition-all duration-300
                        relative
                        overflow-hidden
                      `}
                    >
                      {/* Background pattern for current carriage */}
                      {isCurrentCarriage && (
                        <div className={`absolute inset-0 ${carriageConfig.color} opacity-10`}>
                          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent"></div>
                        </div>
                      )}

                      {/* Carriage Number */}
                      <div
                        className={`
                          ${isCurrentCarriage ? 'text-4xl' : 'text-2xl'}
                          ${carriageConfig.textColor}
                          font-black
                          relative z-10
                        `}
                      >
                        {carriage.carriageNumber}
                      </div>

                      {/* Status Indicator Dot */}
                      {!isCurrentCarriage && (
                        <div
                          className={`
                            ${carriageConfig.color}
                            w-2 h-2
                            rounded-full
                            mt-1
                            relative z-10
                          `}
                        />
                      )}
                    </div>

                    {/* Carriage Label */}
                    <div className={`
                      mt-2
                      ${isCurrentCarriage ? 'text-base font-bold' : 'text-xs'}
                      text-slate-600
                    `}>
                      {t('car')}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Current Carriage Status Display */}
            {currentCarriageData && (
              <div className="mt-12 space-y-8">
                {/* Large Status Badge */}
                <div className="flex justify-center">
                  <div className={`
                    ${config.bgLight}
                    ${config.border}
                    border-4
                    px-16 py-8
                    rounded-3xl
                    relative overflow-hidden
                  `}>
                    <div className={`absolute inset-0 ${config.color} opacity-5`}></div>
                    <div className="text-center relative z-10">
                      <div className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">
                        {t('status')}
                      </div>
                      <div className={`text-5xl font-black ${config.textColor}`}>
                        {getStatusLabel(currentCarriageData.status)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Capacity Display */}
                <div className="max-w-2xl mx-auto space-y-4">
                  <div className="text-center">
                    <div className="text-xl font-semibold text-slate-600 mb-3">
                      {t('currentCapacity')}
                    </div>
                    <div className={`text-8xl font-black ${config.textColor}`}>
                      {currentCarriageData.capacity}%
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-10 overflow-hidden shadow-inner">
                    <div
                      className={`h-full ${config.color} transition-all duration-500 rounded-full flex items-center justify-end pr-6 relative overflow-hidden`}
                      style={{ width: `${Math.min(currentCarriageData.capacity, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                      {currentCarriageData.capacity > 20 && (
                        <span className="text-white font-bold text-lg relative z-10 drop-shadow">
                          {currentCarriageData.capacity}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Legend Footer */}
          <div className="bg-slate-50 px-8 py-6 border-t-2 border-slate-200">
            <div className="flex items-center justify-center gap-8">
              {Object.entries(statusConfig).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <div className={`w-6 h-6 ${value.color} rounded-lg shadow-sm`} />
                  <span className="text-slate-700 font-medium">
                    {getStatusLabel(key as CongestionStatus)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

          {/* Video Input Section */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 h-fit">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Live Video Analysis
              </h2>
              <p className="text-slate-600">
                Upload a video or use your webcam to analyze carriage {currentCarriage} in real-time
              </p>
            </div>
            <VideoAnalyzer
              onAnalysis={handleAnalysis}
              intervalMs={5000}
              autoStart={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
