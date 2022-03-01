import axios from 'axios';

const WDPA = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/scenarios`,
  headers: { 'Content-Type': 'application/json' },
  transformResponse: (data) => {
    try {
      const parsedData = JSON.parse(data);
      return {
        data: parsedData,
        meta: {},
      };
    } catch (error) {
      return data;
    }
  },
});

export default WDPA;
