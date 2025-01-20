import { get } from "http";

const hostIp = '127.0.0.1';
const port = 8000

const BACKEND_URLS = {
  get_annotations: `http://${hostIp}:${port}/get_annotations`,
  get_users: `http://${hostIp}:${port}/get_users`,
  assign_annotation: `http://${hostIp}:${port}/assign_annotation`,
  upload_document: `http://${hostIp}:${port}/upload_document/`,
  save_json: `http://${hostIp}:${port}/save_json`,
  get_pre_label_json: `http://${hostIp}:${port}/get_pre_label_json/`,
  get_json: `http://${hostIp}:${port}/get_json`,
  get_document: `http://${hostIp}:${port}/get_document`,
  get_ocr_text: `http://${hostIp}:${port}/get_ocr_text/`,
  getNextDocID: `http://${hostIp}:${port}/db_connect/get/next-doc-id`,
  fetchAccessToken: `http://${hostIp}:${port}/token/`,
  refreshAccessToken: `http://${hostIp}:${port}/token/refresh/`,
  getUser: `http://${hostIp}:${port}/users`,
  base: `http://${hostIp}:${port}/`,
  set_password: `http://${hostIp}:${port}/set-password/`,
  smart_assign: `http://${hostIp}:${port}/smart_assign/`,
  reject_annotation: `http://${hostIp}:${port}/reject_annotation/`,
};

export default BACKEND_URLS;
