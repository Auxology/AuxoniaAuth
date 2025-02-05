// Code to create an axios instance with the base URL and headers
import axios from 'axios'

export const axiosInstance = axios.create({
    baseURL: 'http://localhost:5001/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
})

