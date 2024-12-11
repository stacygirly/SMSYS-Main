// src/axiosConfig.js
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'https://114a-129-173-66-71.ngrok-free.app/';

export default axios;
