import React, {useEffect, useState, useRef } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import Link from 'next/link'
import '@mediapipe/face_detection';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as faceDetection from '@tensorflow-models/face-detection';
import Webcam from 'react-webcam'
const WebcamComponent = () => <Webcam />
const videoConstraints = {
  width: 600,
  height: 400,
  facingMode: 'user',
}

export default function Home() {
  // useEffect(() => {
  //   faceDetect();
  // }, [])

  const [picture, setPicture] = useState('')
  const webcamRef = useRef<any>(null);
  const [subject, setSubject] = useState('');
  const [error, setError] = useState('');

  const capture = React.useCallback(() => {
    const pictureSrc = webcamRef.current.getScreenshot()
    setPicture(pictureSrc);
    submit();
    // console.log("pictureSrc", pictureSrc);
  }, [])

  const runFaceDetect = async () => {
    console.log("runFaceDetect")
    const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
    const detectorConfig:any = {
      runtime: 'tfjs',
      solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection',
      maxFaces: 2
    };
    const detector = await faceDetection.createDetector(model, detectorConfig);

    console.log("detector", detector);
    detect(detector);

    // const faces = await detector.estimateFaces(webcamRef?.current);
    // console.log("faces", faces);
  };

  const detect = async (detector:any) => {
    console.log("detect")
    if (webcamRef.current) {
      const webcamCurrent = webcamRef.current as any;
      // go next step only when the video is completely uploaded.
      if (webcamCurrent.video.readyState === 4) {
        const video = webcamCurrent.video;
        console.log("before prediction");
        const predictions = await detector.estimateFaces(video);
        console.log("predictions", predictions)
        if (predictions.length > 0) {
          console.log('predictions', predictions);
          if(predictions?.length == 1){
            capture();
          }else{
            setError("Multiple face detected");
            runFaceDetect();
          }
        }else{
          runFaceDetect();
        }
      }
    };
  };

  useEffect(() => {
    console.log("webcamRef.current?.video?.readyState",webcamRef.current?.video?.readyState);
    runFaceDetect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webcamRef.current?.video?.readyState])

  const submit = async () => {
    const file = DataURIToBlob(picture)
    const formData = new FormData();
    formData.append('face', file);
    formData.append('subject', 'test');

    const res = await fetch("https://eyeota.ai/api/add_face", {
        method: "POST",
        body: formData,
    }).then((res) => res.json());
    console.log("res", res);
  }
    
  const DataURIToBlob = (dataURI: string) => {
      const splitDataURI = dataURI.split(',')
      const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1])
      const mimeString = splitDataURI[0].split(':')[1].split(';')[0]

      const ia = new Uint8Array(byteString.length)
      for (let i = 0; i < byteString.length; i++)
          ia[i] = byteString.charCodeAt(i)

      return new Blob([ia], { type: mimeString })
    }

  return (
    <>
     <Link href="/">Login</Link>
     <button onClick={runFaceDetect}>scan</button>

     <div>
      <h2 className="mb-5 text-center">
        React Photo Capture using Webcam Examle
      </h2>
        <Webcam
          audio={false}
          height={600}
          ref={webcamRef}
          width={600}
          videoConstraints={videoConstraints}
        />
      <div>
        {picture != '' ? (
          <form>
            <img src={picture} alt="" />
          </form>
        ) : (
          <button
            onClick={(e) => {
              e.preventDefault()
              capture()
            }}
            className="btn btn-danger"
          >
            Capture
          </button>
        )}
      </div>
    </div>
    </>
  )
}