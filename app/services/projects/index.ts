import axios from 'axios';
import Jsona from 'jsona';

const dataFormatter = new Jsona();

const PROJECTS = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || process.env.STORYBOOK_API_URL}/api/v1/projects`,
  headers: { 'Content-Type': 'application/json' },
  transformResponse: (data) => {
    try {
      const parsedData = JSON.parse(data);
      return dataFormatter.deserialize(parsedData);
    } catch (error) {
      return data;
    }
  },
});

export default PROJECTS;
