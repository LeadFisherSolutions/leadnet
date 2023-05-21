import HTTPTransport from './http';
import WSTransport from './ws';
import Net from './net';

Net.transport = { http: HTTPTransport, ws: WSTransport };
export default Net;
