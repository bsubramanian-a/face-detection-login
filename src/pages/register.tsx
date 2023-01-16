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
import Webcam from 'react-webcam';
import { useRouter } from 'next/navigation';

const WebcamComponent = () => <Webcam />
const videoConstraints = {
  width: 600,
  height: 400,
  facingMode: 'user',
}

export default function Home() {
  const router = useRouter();
  const size = useWindowSize();
  const [picture, setPicture] = useState('')
  const webcamRef = useRef<any>(null);
  const [subject, setSubject] = useState('');
  const [error, setError] = useState('');
  const [detector, setDetector] = useState<any>();
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Hook
  function useWindowSize() {
    // Initialize state with undefined width/height so server and client renders match
    // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
    const [windowSize, setWindowSize] = useState<any>({
      width: undefined,
      height: undefined,
    });

    useEffect(() => {
      // only execute all the code below in client side
      // Handler to call on window resize
      function handleResize() {
        // Set window width/height to state
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
      
      // Add event listener
      window.addEventListener("resize", handleResize);
      
      // Call handler right away so state gets updated with initial window size
      handleResize();
      
      // Remove event listener on cleanup
      return () => window.removeEventListener("resize", handleResize);
    }, []); // Empty array ensures that effect is only run on mount
    return windowSize;
  }

  const capture = React.useCallback(() => {
    const pictureSrc = webcamRef.current.getScreenshot()
    setPicture(pictureSrc);
    // submit(pictureSrc);
    // console.log("pictureSrc", pictureSrc);
  }, []);

//   useEffect(()=> {
//     window.addEventListener('resize', ()=> {
//         // console.log('resize', window.innerHeight, window.innerWidth)
//     })
//  }, [])

  const runFaceDetect = async () => {
    console.log("runFaceDetect")
    const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
    const detectorConfig:any = {
      runtime: 'tfjs',
      solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection',
      maxFaces: 1
    };
    const detector = await faceDetection.createDetector(model, detectorConfig);

    // console.log("detector", detector);
    setDetector(detector);

    // const faces = await detector.estimateFaces(webcamRef?.current);
    // console.log("faces", faces);
  };

  const detect = async () => {
    console.log("detect")
    if (webcamRef.current) {
      const webcamCurrent = webcamRef.current as any;
      // go next step only when the video is completely uploaded.
      if (webcamCurrent.video.readyState === 4) {
        const video = webcamCurrent.video;
        // console.log("before prediction");
        const predictions = await detector.estimateFaces(video);
        // console.log("predictions", predictions)
        if (predictions.length > 0) {
          console.log('predictions', predictions);
          if(predictions?.length == 1){
            setError("");
            capture();
          }else{
            setError("Multiple face detected");
            // runFaceDetect();
            setTimeout(() => {
              detect();
            }, 2000)
          }
        }else{
          // runFaceDetect();
          setError("No face found");
          setTimeout(() => {
            detect();
          }, 2000)
        }
      }
    };
  };

  useEffect(() => {
    console.log("useeffect")
    if(count == 0){
      setCount(1);
      runFaceDetect();
    }
    // if(webcamRef.current?.video?.readyState === 4){
    //   console.log("webcamRef.current?.video?.readyState",webcamRef.current?.video?.readyState);
    // }

    detect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webcamRef.current?.video?.readyState])

  const submit = async () => {
    setIsLoading(true);
    const file = DataURIToBlob(picture)
    const formData = new FormData();
    formData.append('face', file);
    formData.append('subject', subject);

    const res = await fetch("https://api.eyeota.ai/api/add_face", {
        method: "POST",
        body: formData,
    }).then((res) => res.json());
    // console.log("res", res);
    setIsLoading(false);
    if(res?.image_id){
      router.push('/');
      // router.push(`dashboard?image_id=${res?.image_id}&subject=${res?.subject}`);
    }else{
      setError(res?.detail?.msg || 'Scanning failed, please try again');
      detect();
    }
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
    <div className='d-flex justify-content-end p-3 pr-5'>
      <Link className='btn btn-primary px-3 p-2 ms-auto' href="/">Login</Link>
    </div>

     {/* <button onClick={runFaceDetect}>scan</button> */}

     <div>
      <h2 className="mb-5 text-center">
        Face recognition system
      </h2>
      <div className='row flex flex-row justify-content-around align-items-start'>
        <div className='col-12 col-lg-7'>
          <Webcam
            audio={false}
            height={size.height - ((size.height / 10) * 3)}
            ref={webcamRef}
            width={'100%'}
            videoConstraints={videoConstraints}
          />
        </div>
        <div className='col-12 col-lg-4'>
          {error && <h2 className='errorMsg'>{error}</h2>}
          {picture != '' && (
            <div className='row flex-column flex-wrap'>
              <img src={picture} alt="" className='preview mb-5' width={'auto'}/>
              <h3>Subject</h3>
              <input type="text" name="subject" onChange={(ev:any) => setSubject(ev.target.value)} className="form_el"/>
              {
                subject && <button onClick={() => !isLoading ? submit() : undefined } className="btn btn-danger form_el mt-3"> {isLoading ? 'Loading...' : 'Submit'} </button> 
              }
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}