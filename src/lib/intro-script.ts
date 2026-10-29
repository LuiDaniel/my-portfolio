// Script en línea de <head> (docs/05-robot-3d.md#integración-de-la-intro): antes del primer pintado
// decide si se reproduce la intro y pone <html data-intro="play">. Sin JS, con movimiento reducido,
// sin WebGL, en visitas repetidas de la sesión o fuera de la portada, el Home se ve desde el inicio.
// Los navegadores automatizados (pruebas, Lighthouse) no la ven salvo que la pidan: ?intro=play o
// ?intro=fast (más rápida, solo fuera de producción).
export function introScript(enabled: boolean) {
  const dev = process.env.NODE_ENV !== 'production';
  return `(function(){try{
var d=document.documentElement,q=new URLSearchParams(location.search).get('intro');
if(!/^\\/(en\\/?)?$/.test(location.pathname))return;
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
if(q==='play'||(${dev}&&q==='fast')){d.dataset.intro='play';if(q==='fast')d.dataset.introFast='1';return;}
if(!${enabled}||q==='off'||navigator.webdriver)return;
if(sessionStorage.getItem('intro-seen'))return;
var c=document.createElement('canvas');if(!(c.getContext('webgl2')||c.getContext('webgl')))return;
d.dataset.intro='play';
}catch(e){}})();`;
}
