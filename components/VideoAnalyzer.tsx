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
  intervalMs?: number;
  autoStart?: boolean;
}

export default function VideoAnalyzer({
  onAnalysis,
  intervalMs = 5000,
  autoStart = false,
}: VideoAnalyzerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(autoStart);
  const [useWebcam, setUseWebcam] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

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
      const frameData = captureFrame();
      if (!frameData) return;

      const result = await analyzeImage(frameData);
      onAnalysis(result);
    } catch (error) {
      console.error('Analysis error:', error);
    }
  };

  // Start webcam
  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      setStream(mediaStream);
      setUseWebcam(true);
    } catch (error) {
      console.error('Error accessing webcam:', error);
      alert('Could not access webcam. Please check permissions.');
    }
  };

  // Stop webcam
  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setUseWebcam(false);
  };

  // Handle video file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    stopWebcam();

    const url = URL.createObjectURL(file);
    if (videoRef.current) {
      videoRef.current.src = url;
      videoRef.current.load();
      videoRef.current.play();
    }
  };

  // Start/stop analysis
  useEffect(() => {
    if (isAnalyzing) {
      // Analyze immediately
      analyzeCurrentFrame();

      // Then set up interval
      intervalRef.current = setInterval(analyzeCurrentFrame, intervalMs);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAnalyzing, intervalMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
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
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Analysis Status Indicator */}
        {isAnalyzing && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/90 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-white text-sm font-medium">Analyzing</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        {/* Video Upload */}
        <label className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer">
          Upload Video
          <input
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {/* Webcam Toggle */}
        {!useWebcam ? (
          <button
            onClick={startWebcam}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Start Webcam
          </button>
        ) : (
          <button
            onClick={stopWebcam}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Stop Webcam
          </button>
        )}

        {/* Analysis Toggle */}
        <button
          onClick={() => setIsAnalyzing(!isAnalyzing)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isAnalyzing
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-slate-600 text-white hover:bg-slate-700'
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
    </div>
  );
}
