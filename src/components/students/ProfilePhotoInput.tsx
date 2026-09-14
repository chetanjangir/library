import React, { useEffect, useRef, useState } from 'react';
import { Camera, Upload, X, User } from 'lucide-react';

interface ProfilePhotoInputProps {
  value?: string;
  onChange: (dataUrl: string) => void;
}

function resizeImage(dataUrl: string, maxDim = 400, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > height && width > maxDim) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else if (height > maxDim) {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = dataUrl;
  });
}

function ProfilePhotoInput({ value, onChange }: ProfilePhotoInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    };
  }, []);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const resized = await resizeImage(reader.result as string);
        onChange(resized);
      } catch (err) {
        console.error('Failed to process image:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  const openCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      setCameraOpen(true);
      // Wait for the video element to mount before attaching the stream
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 0);
    } catch (err) {
      console.error('Failed to access camera:', err);
      setCameraError('Could not access camera. Please check permissions or upload a photo instead.');
    }
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 400;
    canvas.height = video.videoHeight || 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    try {
      const resized = await resizeImage(dataUrl);
      onChange(resized);
    } catch (err) {
      console.error('Failed to process captured photo:', err);
      onChange(dataUrl);
    }
    stopCamera();
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative">
        <div className="w-28 h-28 rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden flex items-center justify-center">
          {value ? (
            <img src={value} alt="Student" className="w-full h-full object-cover" />
          ) : (
            <User className="w-12 h-12 text-gray-300" />
          )}
        </div>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-1 -right-1 bg-white border border-gray-300 rounded-full p-1 text-gray-500 hover:text-red-600 hover:border-red-300 shadow-sm"
            title="Remove photo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
        >
          <Upload className="w-3.5 h-3.5 mr-1.5" />
          Upload
        </button>
        <button
          type="button"
          onClick={openCamera}
          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
        >
          <Camera className="w-3.5 h-3.5 mr-1.5" />
          Take Photo
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleFileChange}
      />

      {cameraError && <p className="text-xs text-red-600 text-center max-w-xs">{cameraError}</p>}

      {cameraOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 max-w-sm w-full">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Take a Photo</h4>
            <video ref={videoRef} autoPlay playsInline className="w-full rounded-md bg-black aspect-square object-cover" />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={stopCamera}
                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={capturePhoto}
                className="px-3 py-1.5 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Capture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePhotoInput;
