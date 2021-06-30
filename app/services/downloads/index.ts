import axios from 'axios';

const DOWNLOADS = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || process.env.STORYBOOK_API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

export default DOWNLOADS;
