// Animation.jsx
import React, { useEffect, useRef } from 'react'
const Canvas =({webcamRef, predictions, videoHeight}:any) => {
  const canvasRef = useRef<any>(null);

  useEffect(() => {
    // const canvas = canvasRef.current;

    // if(!canvas) return;

    // const context = canvas.getContext('2d');

    // if(!context) return;

    // // context.fillStyle = 'red';
    // context.strokeRect(17.73812770843506, 55.41585087776184, 37.67772316932678, 444.1483605802059);
    // context.fillRect(0, 0, 100, 100);

    predictionFunction();
  }, [predictions])

  async function predictionFunction() {
    const canvas = canvasRef?.current;
    var ctx = canvas?.getContext('2d');
    ctx?.clearRect(0,0, webcamRef.current.video.videoWidth,webcamRef.current.video.videoHeight);
    //Start prediction

    for (let n = 0; n < predictions.length; n++) {
      console.log(predictions);
      let bboxLeft = predictions[n].box.xMin * 2.5;
      let bboxTop = 0;
      let bboxWidth = predictions[n].box.width * 2.5;
      let bboxHeight = 140;
      console.log("bboxLeft: " + bboxLeft);
      console.log("bboxTop: " + bboxTop);
      console.log("bboxWidth: " + bboxWidth);
      console.log("bboxHeight: " + bboxHeight);
      //Drawing begin
      ctx?.beginPath();
      ctx.font = "28px Arial";
      ctx.fillStyle = "red";
      // ctx.rect(bboxLeft, bboxTop, bboxWidth, bboxHeight);
      // ctx.fillRect(0, 0, 100, 100);
      ctx.strokeRect(bboxLeft, bboxTop, bboxWidth, bboxHeight);
      ctx.strokeStyle = "#FF0000";
      ctx.lineWidth = 1;
      ctx.stroke();
      drawPoints(ctx, predictions[n].keypoints);
      console.log("detected");
      //Rerun prediction by timeout
      // setTimeout(() => predictionFunction(), 500);
    }
  }

  function drawPoints(ctx:any, keyPoints:any){
    keyPoints?.forEach((el:any) => {
      ctx.beginPath();
      ctx.arc(el.x, el.y, 1, 0, 2 * Math.PI, true);
      ctx.stroke();
    });
  }


  return <canvas style={{ height: videoHeight, width: '100%', backgroundColor: "transparent", position: 'absolute' }} ref={canvasRef} />;
}
export default Canvas