import axios, { AxiosResponse, CreateAxiosDefaults, isAxiosError } from 'axios';
import Jsona from 'jsona';
import { signOut } from 'next-auth/react';

const dataFormatter = new Jsona();

const APIConfig: CreateAxiosDefaults<unknown> = {
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
} satisfies CreateAxiosDefaults;

export const JSONAPI = axios.create({
  ...APIConfig,
  transformResponse: (data) => {
    try {
      const parsedData = JSON.parse(data);
      return {
        data: dataFormatter.deserialize(parsedData),
        meta: parsedData.meta,
      };
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        throw new Error(error.response.statusText);
      }
      throw error;
    }
  },
});

const onResponseSuccess = (response: AxiosResponse<unknown>) => response;

const onResponseError = async (error) => {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  if (isAxiosError(error)) {
    if (error.response.status === 401) {
      await signOut();
    }
  }
  // Do something with response error
  return Promise.reject(error as Error);
};

JSONAPI.interceptors.response.use(onResponseSuccess, onResponseError);

export const API = axios.create({
  ...APIConfig,
});

API.interceptors.response.use(onResponseSuccess, onResponseError);

const APIInstances = {
  JSONAPI,
  API,
};

export default APIInstances;
