// Cloudflare 环境类型定义

// D1 数据库类型
interface D1Database {
  prepare(query: string): D1PreparedStatement;
  exec(query: string): Promise<D1ExecResult>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run(): Promise<D1Result>;
  all<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown>(): Promise<T[]>;
}

interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  meta: {
    duration: number;
    rows_read: number;
    rows_written: number;
    last_row_id: number;
    changed_db: boolean;
    changes: number;
  };
}

interface D1ExecResult {
  count: number;
  duration: number;
}

// R2 存储桶类型
interface R2Bucket {
  put(key: string, value: ReadableStream | ArrayBuffer | ArrayBufferView | string, options?: R2PutOptions): Promise<R2Object>;
  get(key: string, options?: R2GetOptions): Promise<R2Object | null>;
  delete(keys: string | string[]): Promise<void>;
  list(options?: R2ListOptions): Promise<R2Objects>;
  head(key: string): Promise<R2Object | null>;
}

interface R2PutOptions {
  httpMetadata?: {
    contentType?: string;
    cacheControl?: string;
    contentDisposition?: string;
    contentLanguage?: string;
    contentEncoding?: string;
    contentLength?: number;
  };
  customMetadata?: Record<string, string>;
  onlyIf?: R2Conditional;
}

interface R2GetOptions {
  onlyIf?: R2Conditional;
  range?: R2Range;
}

interface R2ListOptions {
  limit?: number;
  prefix?: string;
  cursor?: string;
  delimiter?: string;
  include?: ("httpMetadata" | "customMetadata")[];
}

interface R2Conditional {
  etagMatches?: string;
  etagDoesNotMatch?: string;
  uploadedBefore?: Date;
  uploadedAfter?: Date;
}

interface R2Range {
  offset?: number;
  length?: number;
  suffix?: number;
}

interface R2Object {
  key: string;
  version: string;
  size: number;
  etag: string;
  httpEtag: string;
  uploaded: Date;
  checksums: {
    md5?: ArrayBuffer;
    sha256?: ArrayBuffer;
  };
  httpMetadata?: {
    contentType?: string;
    cacheControl?: string;
    contentDisposition?: string;
    contentLanguage?: string;
    contentEncoding?: string;
    cacheExpiry?: Date;
  };
  customMetadata?: Record<string, string>;
  body?: ReadableStream;
  bodyUsed?: boolean;
  arrayBuffer(): Promise<ArrayBuffer>;
  text(): Promise<string>;
  json<T = unknown>(): Promise<T>;
  blob(): Promise<Blob>;
}

interface R2Objects {
  objects: R2Object[];
  truncated: boolean;
  cursor?: string;
  delimitedPrefixes?: string[];
}

// 全局类型扩展
declare global {
  // Cloudflare Pages/Workers 环境中的绑定
  const DB: D1Database | undefined;
  const UPLOADS_BUCKET: R2Bucket | undefined;
  const VIDEOS_BUCKET: R2Bucket | undefined;
  const REPORTS_BUCKET: R2Bucket | undefined;
}

export {};






