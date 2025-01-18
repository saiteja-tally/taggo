const hostIp = '127.0.0.1';
const port = 8000

const BACKEND_URLS = {
  get_annotations: `http://${hostIp}:${port}/get_annotations`,
  upload_document: `http://${hostIp}:${port}/upload_document/`,
  uploadGTJsonUrl: `http://${hostIp}:${port}/db_connect/upload/json/gt`,
  getJsonUrl: `http://${hostIp}:${port}/db_connect/get/json`,
  get_document: `http://${hostIp}:${port}/get_document`,
  getOCRText: `http://${hostIp}:${port}/db_connect/get/ocr_text`,
  getNextDocID: `http://${hostIp}:${port}/db_connect/get/next-doc-id`,
  fetchAccessToken: `http://${hostIp}:${port}/token/`,
  refreshAccessToken: `http://${hostIp}:${port}/token/refresh/`,
  getUser: `http://${hostIp}:${port}/users`,
  base: `http://${hostIp}:${port}/`,
};

export default BACKEND_URLS;
