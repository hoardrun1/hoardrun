'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { Camera, CheckCircle2, Loader2, RefreshCw } from 'lucide-react'

export function FaceVerificationPageComponent() {
  const [isLoading, setIsLoading] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [verificationComplete, setVerificationComplete] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()

  useEffect(() => {
    const currentVideoRef = videoRef.current;
    return () => {
      if (currentVideoRef && currentVideoRef.srcObject) {
        const tracks = (currentVideoRef.srcObject as MediaStream).getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
      }
    } catch (err) {
      console.error("Error accessing the camera:", err)
    }
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)
        // Here you would typically send the image data to your backend for verification
        simulateVerification()
      }
    }
  }

  const simulateVerification = () => {
    setIsLoading(true)
    // Simulate API call for face verification
    setTimeout(() => {
      setIsLoading(false)
      setVerificationComplete(true)
    }, 2000)
  }

  const handleSkip = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await router.push('/home');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleContinue = async () => {
    try {
      await router.push('/home');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-[95%] sm:max-w-[440px] md:max-w-[480px] lg:max-w-[520px] overflow-hidden">
        <CardHeader className="text-center p-4 sm:p-6">
          <a href="/" className="inline-block mb-4 sm:mb-6 md:mb-8">
            <span className="text-xl sm:text-2xl font-bold">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">Hoard</span>
              <span className="text-gray-900">run</span>
            </span>
          </a>
          <CardTitle className="text-xl sm:text-2xl font-semibold">Face Verification</CardTitle>
          <CardDescription className="text-sm sm:text-base mt-2">
            Please position your face within the frame and take a clear photo
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {!verificationComplete ? (
            <>
              <div className="relative aspect-square mb-4 sm:mb-6 w-full max-w-[280px] sm:max-w-[320px] mx-auto">
                <div className="absolute inset-0 rounded-full overflow-hidden border-4 border-blue-500">
                  {cameraActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                      <Camera className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <canvas ref={canvasRef} className="hidden" width="300" height="300" />
              </div>
              {!cameraActive ? (
                <Button 
                  onClick={(e) => { e.preventDefault(); startCamera(); }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-sm sm:text-base py-2 sm:py-3"
                >
                  Start Camera
                </Button>
              ) : (
                <Button 
                  onClick={(e) => { e.preventDefault(); captureImage(); }}
                  disabled={isLoading} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-sm sm:text-base py-2 sm:py-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Capture & Verify'
                  )}
                </Button>
              )}
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <p className="text-base sm:text-lg font-medium">Face Verification Successful</p>
              <Button 
                onClick={handleContinue}
                className="w-full bg-blue-600 hover:bg-blue-700 text-sm sm:text-base py-2 sm:py-3"
              >
                Continue to Profile
              </Button>
            </div>
          )}
        </CardContent>
        <div className="text-center space-y-2 pb-4 sm:pb-6">
          <div className="mt-2 sm:mt-4">
            <a 
              href="/create-profile" 
              className="text-xs sm:text-sm text-gray-600 hover:text-blue-500 transition-colors duration-300"
            >
              Back to Profile Setup
            </a>
          </div>
          <div>
            <Button 
              variant="ghost"
              onClick={handleSkip}
              className="text-xs sm:text-sm text-gray-400 hover:text-blue-500 transition-colors duration-300"
            >
              Skip verification for now
            </Button>
          </div>
        </div>
      </Card>
      {cameraActive && !verificationComplete && (
        <Button 
          variant="ghost" 
          onClick={startCamera} 
          className="mt-4 text-blue-600 hover:text-blue-700 text-sm sm:text-base"
        >
          <RefreshCw className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Retake Photo
        </Button>
      )}
    </div>
  )
}