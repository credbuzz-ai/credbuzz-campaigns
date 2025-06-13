import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { getCookie } from "./helper";
import {
  errorInterceptor,
  requestInterceptor,
  successInterceptor,
} from "./interceptors";

const extraHeaders = {
  source: "web app",
  "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
};

const extraHeadersNew = {
  source: "web app",
  "api-key": process.env.NEXT_PUBLIC_AUTHORIZATION_KEY,
};

const axiosRequestConfig: AxiosRequestConfig = {
  baseURL: process.env.NEXT_PUBLIC_BASE_API,
  responseType: "json",
  headers: {
    "Content-Type": "application/json",
    // 'Access-Control-Allow-Origin': '*',
    ...extraHeaders,
  },
};

const axiosRequestConfigNew: AxiosRequestConfig = {
  baseURL: process.env.NEXT_PUBLIC_BASE_API_NEW,
  responseType: "json",
  headers: {
    "Content-Type": "application/json",
    // 'Access-Control-Allow-Origin': '*',
    ...extraHeadersNew,
  },
};

const apiClient: AxiosInstance = axios.create(axiosRequestConfig);
const apiClientNew: AxiosInstance = axios.create(axiosRequestConfigNew);

apiClient.interceptors.request.use(async (config) => {
  let token = await getCookie("accessKey");
  // Retry logic: check if the token is undefined, then wait and retry fetching the cookie
  if (!token) {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait briefly
    token = await getCookie("accessKey"); // Retry fetching the token
  }

  // If token is available, add it to the Authorization header
  if (token) {
    config.headers.Authorization = token;
  }

  return config;
}, requestInterceptor);

apiClient.interceptors.response.use(successInterceptor, errorInterceptor);

apiClientNew.interceptors.request.use(async (config) => {
  let token = await getCookie("accessKey");
  // Retry logic: check if the token is undefined, then wait and retry fetching the cookie
  if (!token) {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait briefly
    token = await getCookie("accessKey"); // Retry fetching the token
  }

  // If token is available, add it to the Authorization header
  if (token) {
    config.headers.Authorization = token;
  }

  return config;
}, requestInterceptor);

apiClientNew.interceptors.response.use(successInterceptor, errorInterceptor);

export { apiClient, apiClientNew };
