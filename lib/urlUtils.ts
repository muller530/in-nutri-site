/**
 * 自动为 URL 添加协议前缀
 * 如果 URL 没有协议（http:// 或 https://），则自动添加 http://
 * @param url 输入的 URL
 * @returns 处理后的 URL
 */
export function ensureUrlProtocol(url: string): string {
  if (!url || url.trim() === "") {
    return url;
  }

  const trimmedUrl = url.trim();
  
  // 如果已经有协议，直接返回
  if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
    return trimmedUrl;
  }

  // 如果以 // 开头，添加 http:
  if (trimmedUrl.startsWith("//")) {
    return `http:${trimmedUrl}`;
  }

  // 如果以 / 开头（相对路径），不添加协议
  if (trimmedUrl.startsWith("/")) {
    return trimmedUrl;
  }

  // 其他情况，添加 http://
  return `http://${trimmedUrl}`;
}

/**
 * 处理 URL 输入框的 onChange 事件
 * 在用户输入时自动添加协议前缀
 * @param value 输入的值
 * @param callback 回调函数，用于更新状态
 */
export function handleUrlInputChange(
  value: string,
  callback: (value: string) => void
): void {
  // 在用户输入时，如果输入的是纯域名（没有协议），自动添加 http://
  // 但只在失去焦点时处理，避免在输入过程中干扰
  callback(value);
}

/**
 * 处理 URL 输入框的 onBlur 事件
 * 在失去焦点时自动添加协议前缀
 * @param value 输入的值
 * @param callback 回调函数，用于更新状态
 */
export function handleUrlInputBlur(
  value: string,
  callback: (value: string) => void
): void {
  if (value && value.trim() !== "") {
    const processedUrl = ensureUrlProtocol(value);
    if (processedUrl !== value) {
      callback(processedUrl);
    }
  }
}

