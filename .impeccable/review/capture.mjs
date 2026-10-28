import { spawn } from 'node:child_process';
import { mkdtemp, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const stage = process.argv[2] || 'final';
const profile = await mkdtemp(path.join(tmpdir(), 'charlotte-browser-'));
const browser = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'
], { windowsHide: true, stdio: 'ignore' });
let socket;
try {
  let port;
  for (let n = 0; n < 100; n++) {
    try { port = (await readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; }
    catch { await new Promise(r => setTimeout(r, 100)); }
  }
  if (!port) throw new Error('Chrome did not start');
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let serial = 0;
  const pending = new Map();
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result);
    }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++serial;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  await send('Page.enable');
  await send('Runtime.enable');
  const reports = [];
  for (const [name, width, height] of [['desktop',1440,1000],['mobile',390,844],['tablet',768,1024],['small',320,740]]) {
    if (stage === 'original' && !['desktop','mobile'].includes(name)) continue;
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await send('Page.navigate', { url: 'http://127.0.0.1:4321/' });
    await evaluate(`new Promise((resolve,reject) => { let ticks=0; const check=setInterval(async()=>{ if(document.querySelector('main h1')){ clearInterval(check); await document.fonts.ready; setTimeout(resolve,300); } else if(++ticks>100){ clearInterval(check); reject(new Error('Page did not render a main heading')); } },100); })`);
    const report = await evaluate(`(() => ({
      title: document.title,
      width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
      h1: [...document.querySelectorAll('h1')].map(e => e.textContent.trim()),
      headings: [...document.querySelectorAll('h2')].map(e => e.textContent.trim()),
      fonts: [...document.fonts].map(f => ({ family: f.family, status: f.status })),
      overflow: [...document.querySelectorAll('body *')].filter(e => { const r=e.getBoundingClientRect(); return r.width > 0 && (r.right > innerWidth+1 || r.left < -1) && getComputedStyle(e).position !== 'absolute'; }).map(e => e.tagName+'.'+e.className).slice(0,15),
      bookingLinks: [...document.querySelectorAll('a')].filter(a => /rendez-vous/i.test(a.textContent)).map(a => ({text:a.textContent.trim(),href:a.getAttribute('href')})),
      brokenImages: [...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i=>i.src)
    }))()`);
    if (stage !== 'original') {
      report.interaction = await evaluate(`(() => {
        const visio=document.querySelector('#mode-visio');
        if(visio) visio.click();
        const visioVisible=document.querySelector('#visio-info') && getComputedStyle(document.querySelector('#visio-info')).display !== 'none';
        const cabinetHidden=document.querySelector('#cabinet-info') && getComputedStyle(document.querySelector('#cabinet-info')).display === 'none';
        document.querySelector('#mode-cabinet')?.click();
        const cabinetVisible=document.querySelector('#cabinet-info') && getComputedStyle(document.querySelector('#cabinet-info')).display !== 'none';
        const faq=document.querySelector('.home-faq details');
        faq?.querySelector('summary')?.click();
        const faqOpens=faq?.open;
        if(faq) faq.open=false;
        return { visioVisible,cabinetHidden,cabinetVisible,faqOpens };
      })()`);
      if (width < 900) report.mobileMenu = await evaluate(`(() => { const menu=document.querySelector('.home-menu'); menu?.querySelector('summary')?.click(); const open=menu?.open; if(menu)menu.open=false; return open; })()`);
    }
    await evaluate("document.querySelector('astro-dev-toolbar')?.remove(); scrollTo(0,0)");
    const metrics = await send('Page.getLayoutMetrics');
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x:0,y:0,width,height:Math.ceil(metrics.cssContentSize.height),scale:1 } });
    await mkdir('.impeccable/review', { recursive:true });
    const filename = stage === 'original' ? `original-${name}` : name;
    await writeFile(`.impeccable/review/${filename}.png`, Buffer.from(shot.data,'base64'));
    reports.push({ name, ...report });
  }
  await writeFile(`.impeccable/review/${stage}-checks.json`, JSON.stringify(reports,null,2));
  console.log(JSON.stringify(reports,null,2));
} finally {
  socket?.close();
  browser.kill();
  await new Promise(r=>setTimeout(r,500));
  // The profile is the exact temporary directory created for this browser.
  await rm(profile,{recursive:true,force:true,maxRetries:5,retryDelay:200}).catch(()=>{});
}
