'use client'


import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { Camera, CheckCircle2, Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Link from 'next/link'
import * as faceapi from 'face-api.js'

export function FaceVerificationPageComponent() {
  const [isLoading, setIsLoading] = useState(false)
  const [isModelLoading, setIsModelLoading] = useState(true)
  const [cameraActive, setCameraActive] = useState(false)
  const [verificationComplete, setVerificationComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [faceDetected, setFaceDetected] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  // Load face detection models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsModelLoading(true)
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        ])
        setIsModelLoading(false)
      } catch (err) {
        console.error('Error loading face detection models:', err)
        setError('Failed to load face detection models. Please refresh the page.')
      }
    }
    loadModels()
  }, [])

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin')
    }
  }, [isAuthenticated, router])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current)
      }
    }
  }, [])

  // Handle countdown
  useEffect(() => {
    if (countdown === null) return
    if (countdown === 0) {
      captureImage()
      return
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [countdown])

  const startFaceDetection = () => {
    if (!videoRef.current || detectionIntervalRef.current) return

    detectionIntervalRef.current = setInterval(async () => {
      if (!videoRef.current) return

      try {
        const detections = await faceapi.detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )

        setFaceDetected(!!detections)

        if (!detections) {
          setError('No face detected. Please position your face within the frame.')
        } else if (detections.score < 0.5) {
          setError('Face not clear. Please ensure good lighting and clear view.')
        } else {
          setError(null)
        }
      } catch (err) {
        console.error('Face detection error:', err)
      }
    }, 500)
  }

  const startCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setCameraActive(true)
        startFaceDetection()
      }
    } catch (err) {
      console.error("Error accessing the camera:", err)
      setError('Unable to access camera. Please ensure camera permissions are granted.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current)
      detectionIntervalRef.current = null
    }
    setCameraActive(false)
    setFaceDetected(false)
  }

  const startVerification = () => {
    if (!faceDetected) {
      setError('Please ensure your face is clearly visible')
      return
    }
    setError(null)
    setCountdown(3)
  }

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return

    try {
      setIsLoading(true)
      setError(null)

      const context = canvasRef.current.getContext('2d')
      if (!context) return

      // Capture the frame
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)
      const imageData = canvasRef.current.toDataURL('image/jpeg')

      // Send to backend for verification
      const response = await fetch('/api/verify-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          image: imageData,
          userId: user?.id
        }),
      })

      if (!response.ok) {
        throw new Error(await response.text() || 'Face verification failed')
      }

      setVerificationComplete(true)
      stopCamera()
    } catch (err) {
      console.error('Verification error:', err)
      setError(err instanceof Error ? err.message : 'Face verification failed. Please try again.')
    } finally {
      setIsLoading(false)
      setCountdown(null)
    }
  }

  const handleSkip = async () => {
    try {
      stopCamera()
      await router.push('/home')
    } catch (error) {
      console.error('Navigation error:', error)
      setError('Failed to navigate to home page')
    }
  }

  const handleContinue = async () => {
    try {
      await router.push('/home')
    } catch (error) {
      console.error('Navigation error:', error)
      setError('Failed to navigate to home page')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    )
  }

  if (isModelLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        <p className="text-sm text-gray-600">Loading face detection models...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-[95%] sm:max-w-[440px] md:max-w-[480px] lg:max-w-[520px] overflow-hidden">
        <CardHeader className="text-center p-4 sm:p-6">
          <Link href="/home" className="inline-block mb-4 sm:mb-6 md:mb-8">
            <span className="text-xl sm:text-2xl font-bold">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">Hoard</span>
              <span className="text-gray-900">run</span>
            </span>
          </Link>
          <CardTitle className="text-xl sm:text-2xl font-semibold">Face Verification</CardTitle>
          <CardDescription className="text-sm sm:text-base mt-2">
            Please position your face within the frame and take a clear photo
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {error && (
            <div className="mb-4 p-3 text-sm text-gray-600 bg-gray-50 rounded-lg flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!verificationComplete ? (
            <>
              <div className="relative aspect-square mb-4 sm:mb-6 w-full max-w-[280px] sm:max-w-[320px] mx-auto">
                <div className={`absolute inset-0 rounded-full overflow-hidden border-4 ${faceDetected ? 'border-green-500' : 'border-blue-500'} transition-colors duration-300`}>
                  {cameraActive ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {countdown !== null && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <span className="text-6xl font-bold text-white">{countdown}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                      <Camera className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <canvas 
                  ref={canvasRef} 
                  className="hidden" 
                  width="1280" 
                  height="720" 
                />
              </div>

              {!cameraActive ? (
                <Button 
                  onClick={startCamera}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-sm sm:text-base py-2 sm:py-3"
                >
                  Start Camera
                </Button>
              ) : (
                <Button 
                  onClick={startVerification}
                  disabled={isLoading || !faceDetected || countdown !== null} 
                  className="w-full bg-gray-600 hover:bg-gray-700 text-sm sm:text-base py-2 sm:py-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : countdown !== null ? (
                    'Taking photo...'
                  ) : (
                    'Capture & Verify'
                  )}
                </Button>
              )}
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100">
                <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600" />
              </div>
              <p className="text-base sm:text-lg font-medium">Face Verification Successful</p>
              <Button 
                onClick={handleContinue}
                className="w-full bg-gray-600 hover:bg-gray-700 text-sm sm:text-base py-2 sm:py-3"
              >
                Continue to Home
              </Button>
            </div>
          )}
        </CardContent>

        <div className="text-center space-y-2 pb-4 sm:pb-6">
          <Button 
            variant="ghost"
            onClick={handleSkip}
            className="text-sm text-gray-600 hover:text-gray-500 transition-colors duration-300"
          >
            Skip verification for now
          </Button>
        </div>
      </Card>

      {cameraActive && !verificationComplete && !isLoading && countdown === null && (
        <Button 
          variant="ghost" 
          onClick={startCamera} 
          className="mt-4 text-gray-600 hover:text-gray-700 text-sm sm:text-base"
        >
          <RefreshCw className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Retake Photo
        </Button>
      )}
    </div>
  )
}
