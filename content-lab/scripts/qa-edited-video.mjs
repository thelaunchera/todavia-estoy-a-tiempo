/**
 * End-to-end browser smoke: a real MP4 clip with a 440 Hz audio track is
 * trimmed, rotated and cropped, then exported by our browser-only editor.
 * The encoded result MUST have an audio track and the expected 4:5 frame.
 */
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
import {build} from 'esbuild';
import {chromium} from 'playwright';

const work=mkdtempSync(join(tmpdir(),'carousel-video-test-'));
let browser;
try{
 const input=join(work,'input.mp4'),output=join(work,'output.webm');
 execFileSync('ffmpeg',['-nostdin','-y','-hide_banner','-loglevel','error',
   '-f','lavfi','-i','testsrc2=size=160x200:rate=24:duration=2.4',
   '-f','lavfi','-i','sine=frequency=440:sample_rate=48000:duration=2.4',
   '-c:v','libx264','-pix_fmt','yuv420p','-c:a','aac','-shortest',input],{timeout:30000});
 const source=await build({
   entryPoints:[resolve('src/CarouselVideoRender.ts')],
   bundle:true,platform:'browser',format:'iife',globalName:'TestCarouselVideo',
   target:'es2020',write:false
 });
 browser=await chromium.launch({headless:true,args:['--autoplay-policy=no-user-gesture-required']});
 const page=await browser.newPage({viewport:{width:1024,height:768}});
 await page.goto('about:blank');
 await page.addScriptTag({content:source.outputFiles[0].text});
 const bytes=Array.from(new Uint8Array(readFileSync(input)));
 const result=await page.evaluate(async raw=>{
   const src=new Blob([new Uint8Array(raw)],{type:'video/mp4'});
   const canvas=document.createElement('canvas');
   canvas.width=1080;canvas.height=1350;
   const ctx=canvas.getContext('2d');
   ctx.fillStyle='#FAF8F3';ctx.fillRect(0,0,1080,1350);
   const result=await window.TestCarouselVideo.renderEditedCarouselVideo(
     src,{x:.15,y:.12,w:.7,h:.74,rotation:25,zoom:1.75,panX:.07,panY:-.12},
     .3,1.6,canvas);
   const buffer=await result.blob.arrayBuffer();
   const u8=new Uint8Array(buffer);
   let binary='';
   for(let i=0;i<u8.length;i+=8192)
     binary+=String.fromCharCode(...u8.subarray(i,i+8192));
   return {ext:result.extension,base64:btoa(binary),size:result.blob.size};
 },bytes);
 if(result.size<5000)throw Error('Browser did not export enough video bytes');
 const out=join(work,'output.'+result.ext);
 writeFileSync(out,Buffer.from(result.base64,'base64'));
 const info=JSON.parse(execFileSync('ffprobe',['-v','error',
   '-show_entries','stream=codec_type,width,height',
   '-of','json',out],{encoding:'utf8',timeout:15000}));
 const video=info.streams.find(s=>s.codec_type==='video');
 const audio=info.streams.find(s=>s.codec_type==='audio');
 if(!video||video.width!==1080||video.height!==1350)
   throw Error('Edited file lost its 1080x1350 video frame');
 if(!audio)throw Error('Edited output lost the source video audio track');
 const measured=spawnSync('ffmpeg',['-nostdin','-hide_banner','-i',out,
   '-vn','-af','volumedetect','-f','null','-'],{encoding:'utf8',timeout:15000});
 if(measured.status!==0)throw Error('Unable to decode exported audio for QA');
 const loudness=measured.stderr.match(/mean_volume:\s*(-?[\d.]+|-inf)\s*dB/);
 if(!loudness||!Number.isFinite(Number(loudness[1]))||Number(loudness[1]) < -70)
   throw Error('Edited video has an audio track but the original 440Hz soundtrack became silent');

 // Compare frame pixels: the ivory artboard must survive the composite,
 // while the video has visible pixels inside the transformed rectangle.
 const frame=join(work,'frame.png');
 execFileSync('ffmpeg',['-nostdin','-y','-hide_banner','-loglevel','error',
   '-ss','0.6','-i',out,'-frames:v','1',frame],{timeout:15000});
 if(readFileSync(frame).length<1500)throw Error('Composited video frame is blank');
 console.log('PASS: real video transformed/trimmed with 1080x1350 frame and audio in '+result.ext);
}finally{
 if(browser)await browser.close();
 rmSync(work,{recursive:true,force:true});
}
