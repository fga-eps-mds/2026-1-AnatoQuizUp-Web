export const trimTrailingSlash = (url:string): string => {
  
  let url_length = url.length;
  while( url_length > 0 && url[url_length-1] === '/'){
    url_length--;
  }
  return url.slice(0, url_length);
}