import axios from 'axios';
import Jsona from 'jsona';

const dataFormatter = new Jsona();

const ADMINISTRATIVE_AREAS = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/administrative-areas`,
  headers: { 'Content-Type': 'application/json' },
  transformResponse: (data) => {
    try {
      const parsedData = JSON.parse(data);
      return {
        data: dataFormatter.deserialize(parsedData),
        meta: parsedData.meta,
      };
    } catch (error) {
      return data;
    }
  },
});

export default ADMINISTRATIVE_AREAS;
