import axios from 'axios';

const TEST = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com/posts',
  headers: { 'Content-Type': 'application/json' },
});

export default TEST;
