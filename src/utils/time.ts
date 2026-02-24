/**
 * 时间工具函数 - 统一处理时区转换
 */

const BEIJING_TIMEZONE = 'Asia/Shanghai';

/**
 * 将 UTC 时间字符串转换为北京时间
 * @param timestamp ISO 8601 格式的时间字符串
 * @returns 北京时间的 Date 对象
 */
export function toBeijingTime(timestamp: string): Date {
  const date = new Date(timestamp);
  // 如果时间字符串不包含时区信息，假设为 UTC 时间
  return new Date(date.toLocaleString('en-US', { timeZone: BEIJING_TIMEZONE }));
}

/**
 * 格式化时间为北京时间显示
 * @param timestamp ISO 8601 格式的时间字符串
 * @returns 格式化后的时间字符串
 */
export function formatBeijingTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();

  // 计算时间差（毫秒）- new Date 会自动处理时区，所以直接用 getTime() 比较是正确的
  const diff = now.getTime() - date.getTime();

  // 相对时间
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;

  // 绝对时间 - 北京时间
  return date.toLocaleString('zh-CN', {
    timeZone: BEIJING_TIMEZONE,
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 格式化会话列表时间
 * @param timestamp ISO 8601 格式的时间字符串
 * @returns 格式化后的时间字符串
 */
export function formatSessionTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    timeZone: BEIJING_TIMEZONE,
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
