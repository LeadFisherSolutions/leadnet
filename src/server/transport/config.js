'use strict';

const MIME_TYPES = {
  bin: 'application/octet-stream',
  htm: 'text/html',
  html: 'text/html',
  shtml: 'text/html',
  json: 'application/json',
  xml: 'text/xml',
  js: 'application/javascript',
  mjs: 'application/javascript',
  css: 'text/css',
  txt: 'text/plain',
  csv: 'text/csv',
  ics: 'text/calendar',
  avif: 'image/avif',
  bmp: 'image/x-ms-bmp',
  gif: 'image/gif',
  ico: 'image/x-icon',
  jng: 'image/x-jng',
  jpg: 'image/jpg',
  png: 'image/png',
  svg: 'image/svg+xml',
  svgz: 'image/svg+xml',
  tiff: 'image/tiff',
  tif: 'image/tiff',
  wbmp: 'image/vnd.wap.wbmp',
  webp: 'image/webp',
  '3gpp': 'video/3gpp',
  '3gp': 'video/3gpp',
  aac: 'audio/aac',
  asf: 'video/x-ms-asf',
  avi: 'video/x-msvideo',
  m4a: 'audio/x-m4a',
  mid: 'audio/midi',
  midi: 'audio/midi',
  mov: 'video/quicktime',
  mp3: 'audio/mpeg',
  mp4: 'video/mp4',
  mpega: 'video/mpeg',
  mpeg: 'video/mpeg',
  mpg: 'video/mpeg',
  oga: 'audio/ogg',
  ogv: 'video/ogg',
  ra: 'audio/x-realaudio',
  wav: 'audio/wav',
  weba: 'audio/webm',
  webm: 'video/webm',
  otf: 'font/otf',
  ttf: 'font/ttf',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ai: 'application/postscript',
  eps: 'application/postscript',
  jar: 'application/java-archive',
  pdf: 'application/pdf',
  ps: 'application/postscript',
  wasm: 'application/wasm',
  '7z': 'application/x-7z-compressed',
  gz: 'application/gzip',
  rar: 'application/x-rar-compressed',
  tar: 'application/x-tar',
  tgz: 'application/gzip',
  zip: 'application/zip',
};

const HEADERS = {
  'X-XSS-Protection': '1; mode=block',
  'X-Content-Type-Options': 'nosniff',
  'Strict-Transport-Security': 'max-age=31536000; includeSubdomains; preload',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const TOKEN = 'token';
const EPOCH = 'Thu, 01 Jan 1970 00:00:00 GMT';
const FUTURE = 'Fri, 01 Jan 2100 00:00:00 GMT';
const LOCATION = 'Path=/; Domain';
const COOKIE_DELETE = `${TOKEN}=deleted; Expires=${EPOCH}; ${LOCATION}=`;
const COOKIE_HOST = `Expires=${FUTURE}; ${LOCATION}`;

module.exports = { MIME_TYPES, HEADERS, COOKIE_DELETE, COOKIE_HOST, TOKEN };
