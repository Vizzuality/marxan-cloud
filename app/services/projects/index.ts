import axios from 'axios';

const PROJECTS = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || process.env.STORYBOOK_API_URL}/posts`,
  headers: { 'Content-Type': 'application/json' },
});

export default PROJECTS;
