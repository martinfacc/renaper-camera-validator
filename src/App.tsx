import { useState, useRef, useEffect, type FC } from 'react'
import './App.css'

const Camera: FC = () => {
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      setPermissionGranted(true)
      stream.getTracks().forEach((track: MediaStreamTrack) => track.stop()) // Stop the initial stream just to get permission
    } catch (err) {
      console.error('Error requesting camera permission:', err)
      setPermissionGranted(false)
    }
  }

  useEffect(() => {
    // Check for camera permission on component mount
    navigator.permissions.query({ name: 'camera' as PermissionName }).then((result) => {
      if (result.state === 'granted') {
        setPermissionGranted(true)
      }
    })
  }, [])

  useEffect(() => {
    if (permissionGranted) {
      startCamera()
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop())
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionGranted, facingMode])

  const startCamera = async () => {
    if (stream) {
      stream.getTracks().forEach((track: MediaStreamTrack) => track.stop())
    }
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode }
      })
      setStream(newStream)
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
      }
    } catch (err) {
      console.error('Error starting camera:', err)
    }
  }

  const switchCamera = () => {
    setFacingMode((prevMode: 'user' | 'environment') =>
      prevMode === 'user' ? 'environment' : 'user'
    )
  }

  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const context = canvas.getContext('2d')
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/png')
        console.log('Picture taken:', dataUrl)
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = 'capture.png'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }
  }

  if (!permissionGranted) {
    return (
      <div className="permission-container">
        <h1>Permiso de Cámara</h1>
        <p>Necesitamos tu permiso para usar la cámara.</p>
        <button onClick={requestPermission}>Dar Permiso</button>
      </div>
    )
  }

  return (
    <div className="camera-container">
      <div className="video-wrapper">
        <video ref={videoRef} autoPlay playsInline className="video-feed"></video>
        <div className="ring"></div>
      </div>
      <div className="controls">
        <button onClick={switchCamera}>Cambiar Cámara</button>
        <button onClick={takePicture} className="capture-btn">
          Tomar Foto
        </button>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
    </div>
  )
}

const App: FC = () => {
  return (
    <div className="App">
      <Camera />
    </div>
  )
}

export default App
