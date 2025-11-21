'use client';

import { useRef, useState, useEffect } from 'react';
import { analyzeImage } from '@/lib/actions';

type CongestionStatus = 'empty' | 'few people' | 'moderate' | 'full';

interface AnalysisResult {
  status: CongestionStatus;
  capacity: number;
  confidence: number;
  reasoning: string;
}

interface VideoAnalyzerProps {
  onAnalysis: (result: AnalysisResult) => void;
  videoUrl?: string;
  intervalMs?: number;
  autoStart?: boolean;
}

export default function VideoAnalyzer({
  onAnalysis,
  videoUrl,
  intervalMs = 5000,
  autoStart = false,
}: VideoAnalyzerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [hasVideo, setHasVideo] = useState(false);
  const autoStartRef = useRef(autoStart);

  // Capture frame and convert to base64
  const captureFrame = (): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      return null;
    }

    const context = canvas.getContext('2d');
    if (!context) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg', 0.8);
  };

  // Analyze current frame
  const analyzeCurrentFrame = async () => {
    try {
      console.log('[VideoAnalyzer] Capturing frame for analysis...');
      const frameData = captureFrame();
      if (!frameData) {
        console.warn('[VideoAnalyzer] Failed to capture frame');
        return;
      }

      console.log('[VideoAnalyzer] Sending frame to AI for analysis...');
      const result = await analyzeImage(frameData);
      console.log('[VideoAnalyzer] *** Received analysis result:', result);
      console.log('[VideoAnalyzer] *** Calling onAnalysis callback with result');
      onAnalysis(result);
      console.log('[VideoAnalyzer] *** onAnalysis callback completed');
    } catch (error) {
      console.error('[VideoAnalyzer] Analysis error:', error);
    }
  };

  // Update autoStartRef when autoStart prop changes
  useEffect(() => {
    autoStartRef.current = autoStart;
  }, [autoStart]);

  // Load video when videoUrl changes
  useEffect(() => {
    const video = videoRef.current;

    if (videoUrl && video) {
      console.log('[VideoAnalyzer] Loading video:', videoUrl);

      // Reset state
      setHasVideo(false);
      setIsAnalyzing(false);

      video.src = videoUrl;
      video.load();

      // Wait for video to start playing before starting analysis
      const handlePlaying = () => {
        console.log('[VideoAnalyzer] Video is now playing');
        setHasVideo(true);

        // Auto-start analysis if enabled
        if (autoStartRef.current) {
          console.log('[VideoAnalyzer] Auto-starting analysis');
          setIsAnalyzing(true);
        }
      };

      video.addEventListener('playing', handlePlaying, { once: true });

      video.play().catch(error => {
        console.error('Error playing video:', error);
      });

      // Cleanup function
      return () => {
        video.removeEventListener('playing', handlePlaying);
      };
    } else {
      setHasVideo(false);
      setIsAnalyzing(false);
    }
  }, [videoUrl]);

  // Start/stop analysis
  useEffect(() => {
    if (isAnalyzing && hasVideo) {
      console.log('[VideoAnalyzer] Starting analysis with interval:', intervalMs);

      // Wait a bit for video to start playing, then analyze immediately
      const initialTimeout = setTimeout(() => {
        analyzeCurrentFrame();
      }, 1000);

      // Then set up interval
      intervalRef.current = setInterval(analyzeCurrentFrame, intervalMs);

      return () => {
        clearTimeout(initialTimeout);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [isAnalyzing, hasVideo, intervalMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Video Display */}
      <div className="relative bg-black rounded-2xl overflow-hidden aspect-video">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          playsInline
          muted
          loop
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Analysis Status Indicator */}
        {isAnalyzing && hasVideo && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/90 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-white text-sm font-medium">Analyzing</span>
          </div>
        )}

        {/* No Video Placeholder */}
        {!hasVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white/60">
              <div className="text-6xl mb-4">📹</div>
              <p className="text-lg">Select a carriage to view video</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {hasVideo && (
        <div className="flex flex-wrap gap-3">
          {/* Analysis Toggle */}
          <button
            onClick={() => setIsAnalyzing(!isAnalyzing)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isAnalyzing
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isAnalyzing ? 'Stop Analysis' : 'Start Analysis'}
          </button>

          {/* Manual Analysis */}
          <button
            onClick={analyzeCurrentFrame}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Analyze Now
          </button>
        </div>
      )}
    </div>
  );
}
