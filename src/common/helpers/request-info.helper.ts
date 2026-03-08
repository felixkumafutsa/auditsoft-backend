/*
 * Copyright (c) 2026 Auditsoft
 * All rights reserved.
 */

export interface RequestInfo {
  ipAddress?: string;
  deviceInfo?: string;
}

export function extractRequestInfo(req: any): RequestInfo {
  const requestInfo: RequestInfo = {};

  // Extract IP Address
  if (req) {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0] : req.connection?.remoteAddress || req.socket?.remoteAddress;
    requestInfo.ipAddress = ip ? ip.replace('::ffff:', '') : undefined;

    // Extract Device Info
    const userAgent = req.headers['user-agent'];
    if (userAgent) {
      requestInfo.deviceInfo = userAgent;
    }
  }

  return requestInfo;
}
