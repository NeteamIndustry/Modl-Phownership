import axios from "axios";

const http = axios.create({
  baseURL: "https://api-verify.modl.app",
});

export default http;
