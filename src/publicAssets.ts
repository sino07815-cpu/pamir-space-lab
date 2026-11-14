// Resolve bundled assets under both localhost and /repository/ GitHub Pages URLs.
export function publicAssetPath(file:string,base='/'){
  return base.replace(/\/?$/,'/')+file.replace(/^\/+/, '');
}
export function publicAssetUrl(file:string){
  return publicAssetPath(file,typeof document==='undefined'?'/':new URL('./',document.baseURI).pathname);
}
