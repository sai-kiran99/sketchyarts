import axios from "axios";

const instance = axios.create({
  baseURL: "https://sketchyarts-backend.onrender.com",
});

export default instance;
