import { BACKEND_DOMAIN } from '../config/global'


const failureCallback = data => { console.error(data); }

async function fetchBackend(method = '', url = '', data = {}, successCallback = null, files = {}) {
  let response;

  if(!successCallback) {
    successCallback = console.log;
  }

  url = BACKEND_DOMAIN + url;

  if(method !== 'GET') {

    // aggregate form data in one place
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      formData.append(key, value);
    }
    // for (const [key, value] of Object.entries(files)) {
    //   formData.append(key, value);
    // }

    // authenticate request if possible
    let requestOptions = {headers: {}}
    const token = localStorage.getItem('accessToken');
    if(token) {
      requestOptions.headers.Authorization = `Bearer ${token}`;
    }
    const request = new Request(url, requestOptions);

    // make the request
    response = await fetch(request, {
      method: method,
      mode: 'cors',
      body: formData,
    });
  } else {

    // translate form data for GET
    let searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(data)) {
      searchParams.set(key, value);
    }
    const getUrl = url + '/?' + searchParams.toString();

    // authenticate request if possible
    let requestOptions = {headers: {'Content-Type': 'application/json'}}
    const token = localStorage.getItem('accessToken');
    if(token) {
      requestOptions.headers.Authorization = `Bearer ${token}`;
    }
    const request = new Request(getUrl, requestOptions);

    // make the request
    response = await fetch(request, {
      method: method,
      mode: 'cors',
    });
  }
  return response;
}

export { fetchBackend }
