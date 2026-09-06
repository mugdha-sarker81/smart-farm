import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Camera,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Sprout,
  X,
  Loader,
  ScanLine,
  Info
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const DetectDisease = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop camera when unmounting
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setError(null);
    setResult(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsCameraActive(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please check permissions or upload an image file instead.');
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          setSelectedFile(file);
          setPreviewUrl(URL.createObjectURL(blob));
          stopCamera();
        }
      },
      'image/jpeg',
      0.95
    );
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }
    stopCamera();
    setError(null);
    setResult(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const resetAll = () => {
    stopCamera();
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please upload or capture a leaf image first.');
      return;
    }

    setAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const endpoint = `${API_BASE_URL}/api/predict`;
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Server returned error (${response.status})`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Detection request failed:', err);
      setError(
        err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')
          ? 'Cannot connect to the inference server. Please ensure the backend is running (python backend/main.py).'
          : err.message || 'An error occurred while analyzing the image.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <ScanLine className="h-8 w-8 text-farm-green" />
            <h2 className="text-2xl font-bold text-gray-800">Detect Disease</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Capture or upload a crop leaf photo to identify diseases and health condition in real time.
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm">{error}</div>
        </div>
      )}

      {/* Main Detection Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        {/* Input Mode Selector */}
        {!previewUrl && !isCameraActive && (
          <div className="space-y-4">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 hover:border-farm-green rounded-xl p-8 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-green-50/20"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center text-farm-green">
                  <UploadCloud className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-700">
                    Click to browse or drag and drop a leaf image
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Supports JPEG, PNG, WEBP (Corn, Potato, Rice, Sugarcane, Wheat)</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <span className="text-xs text-gray-400 font-medium uppercase px-2">or</span>
            </div>

            <button
              onClick={startCamera}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 hover:border-farm-green text-gray-700 hover:text-farm-green py-3 px-4 rounded-xl font-medium transition-colors bg-white hover:bg-gray-50"
            >
              <Camera className="h-5 w-5" />
              Use Live Camera Snapshot
            </button>
          </div>
        )}

        {/* Live Camera Mode */}
        {isCameraActive && (
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-[420px] flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <button
                onClick={stopCamera}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black text-white p-2 rounded-full transition-colors"
                title="Cancel camera"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={capturePhoto}
                className="btn-primary flex items-center gap-2 px-6 py-2.5"
              >
                <Camera className="h-5 w-5" />
                Take Snapshot
              </button>
              <button
                onClick={stopCamera}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Image Preview & Action */}
        {previewUrl && (
          <div className="space-y-6">
            <div className="relative border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex justify-center items-center max-h-[380px]">
              <img
                src={previewUrl}
                alt="Selected crop leaf"
                className="max-h-[380px] w-auto object-contain"
              />
              <button
                onClick={resetAll}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black text-white p-2 rounded-full transition-colors"
                title="Remove photo"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-3 items-center justify-between">
              <button
                onClick={resetAll}
                disabled={analyzing}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Choose Another Image
              </button>

              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="btn-primary flex items-center gap-2 px-6 py-2.5 text-base shadow-sm"
              >
                {analyzing ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Analyzing Plant Leaf...
                  </>
                ) : (
                  <>
                    <ScanLine className="h-5 w-5" />
                    Detect Disease
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Diagnosis Result */}
        {result && (
          <div className="pt-6 border-t border-gray-100 space-y-6">
            <div
              className={`p-5 rounded-xl border flex items-start gap-4 ${
                result.is_healthy
                  ? 'bg-green-50 border-green-200 text-green-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div
                className={`p-3 rounded-full flex-shrink-0 ${
                  result.is_healthy ? 'bg-green-200 text-green-800' : 'bg-amber-200 text-amber-800'
                }`}
              >
                {result.is_healthy ? (
                  <CheckCircle className="h-7 w-7" />
                ) : (
                  <AlertTriangle className="h-7 w-7" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      result.is_healthy
                        ? 'bg-green-200 text-green-800'
                        : 'bg-red-200 text-red-800'
                    }`}
                  >
                    {result.is_healthy ? 'Healthy Crop' : 'Disease Detected'}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    Crop: <strong className="text-gray-700">{result.crop}</strong>
                  </span>
                </div>

                <h3 className="text-xl font-bold mt-1 text-gray-900">
                  {result.display_name}
                </h3>

                <p className="text-sm mt-1 opacity-90">
                  {result.is_healthy
                    ? 'The foliage appears healthy with no characteristic symptoms of disease detected.'
                    : `Identified symptom: ${result.condition}. Early mitigation is advised to prevent spread across the field.`}
                </p>
              </div>

              <div className="text-right flex-shrink-0 pl-2">
                <div className="text-2xl font-extrabold text-gray-900">
                  {result.percentage}%
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                  Confidence
                </div>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
              <div className="flex justify-between text-xs font-medium text-gray-600">
                <span>Model Confidence</span>
                <span>{result.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    result.is_healthy ? 'bg-farm-green' : result.percentage > 70 ? 'bg-amber-500' : 'bg-gray-500'
                  }`}
                  style={{ width: `${Math.min(result.percentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Top Predictions Breakdown */}
            {result.top_predictions && result.top_predictions.length > 1 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-gray-400" />
                  Top Classification Probabilities
                </h4>
                <div className="space-y-2">
                  {result.top_predictions.map((pred, i) => (
                    <div
                      key={pred.index}
                      className="flex items-center justify-between text-sm bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-xs font-semibold text-gray-400 w-4">#{i + 1}</span>
                        <span className="font-medium text-gray-800 truncate">{pred.display_name}</span>
                        {pred.is_healthy && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                            Healthy
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-gray-600 ml-3 flex-shrink-0">
                        {pred.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetectDisease;

