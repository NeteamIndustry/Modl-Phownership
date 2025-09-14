import axios from "axios";
import http from "../utils/http";

export const verifyService = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("screenshot_mode", "true");

  const res = await http.post("/verify/upload", formData);

  return res.data;
};

export const findUser = async (id) => {
  const res = await axios.post("https://api.modl.app/user/find", { userId: id });
  return res.data;
};
