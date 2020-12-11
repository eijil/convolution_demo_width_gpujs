
import React, { useRef, useEffect, useState } from "react";
import './App.css';
import img from './test.jpeg'
import {GPU} from 'gpu.js'
const gpu = new GPU()
const Sharpen = [
  [0, -1, 0],
  [-1, 5, -1],
  [0, -1, 0]
];
const edge = [
  [0, -1, 0],
  [-1, 4, -1],
  [0, -1, 0]
];
const edgee = [
  [-1, -1, -1],
  [-1, 8, -1],
  [-1, -1, -1]
];

const convolution = function (image, width, height, kernel ,container) {
  const render = gpu
    .createKernel(function (image, kernel) {
      let r = 0,
          g = 0,
          b = 0;
          for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
              const pixel = image[this.thread.y + j][this.thread.x + i];
              r += pixel.r * kernel[j][i];
              g += pixel.g * kernel[j][i];
              b += pixel.b * kernel[j][i];
            }
          }
      this.color(r, g, b);
    })
    .setOutput([width, height])
    .setGraphical(true);
  render(image, kernel);
  container.appendChild(render.canvas)
  
};
/**
 * 
 * @param {canvas getImageData} imageData 
 * @param {kernel} kernel
 * @param {canvas getContext} ctx
 */
const cpuConvolution = function (imageData,kernel,ctx){
  
 const { data,width,height} = imageData
 const result = ctx.createImageData(width, height);
 const outData = result.data
 const kernelSize = kernel.length
 const half = Math.floor(kernelSize / 2)

  for(let x = 0;x < width;x ++){
    for(let y= 0;y < height;y ++){
      const px = (y * width + x) * 4; 
      let r = 0,g = 0,b = 0;
      for (let i = 0; i < kernelSize; i++) {
        for (let j = 0; j < kernelSize; j++) {
          const cpx = ((y + (i - half)) * width + (x + (j - half))) * 4;
          r += data[cpx + 0] * kernel[j][i];
          g += data[cpx + 1] * kernel[j][i];
          b += data[cpx + 2] * kernel[j][i];
        }
      }
      outData[px + 0] = r ;
      outData[px + 1] = g ;
      outData[px + 2] = b ;
      outData[px + 3] = data[px + 3];
      
    }
  }
  ctx.putImageData(result,0,0)
}




function App() {

  const [loading,setLoading] = useState(false)
  const [ready,setReady] = useState(false)
  const [image,setImage] = useState(null)
  

  const gpuRef = useRef(null)
  const cpuRef = useRef(null)


  const testCpu = (image)=>{
    const { width, height } = image
    const canvas = document.createElement("canvas")
    const context = canvas.getContext('2d');
    canvas.width = width
    canvas.height = height
    context.drawImage(image, 0, 0)
    const imageData = context.getImageData(0, 0, width, height)
    cpuConvolution(imageData, edgee, context)
    cpuRef.current.appendChild(canvas) 
  } 

  const handler =()=>{

      const {width,height} = image
      //convolution(image, width, height, Sharpen, gpuRef.current);
      
      testCpu(image)
     
      
       
    //   //}
    //   // const canvas = convolution(image, image.width, image.height);
    //   // console.log(canvas);
    //   // resultRef.current.innerHTML = "";
    //   // resultRef.current.appendChild(canvas);


  }

  useEffect(() => {
    const image = document.createElement("img");
    image.crossOrigin = "anonymous";
    image.src = img;
    image.onload = function () {
        setImage(image)

    }


  }, []);
  return (
    <div className="App">
      <div className="container">
        <div className="raw">
          <img src={img} alt="" />
          {image &&
            <button onClick={handler}>click</button>
          }
          </div>
     
        </div>
        <div className="canvas-result">
          <div className="gpu" ref={gpuRef}></div>
          <div className="cpu" ref={cpuRef}></div>
        </div>
    </div>
  );
}

export default App;
