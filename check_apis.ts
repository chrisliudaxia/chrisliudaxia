// API 检查脚本
export function logApiAvailability() {
  console.log('检查外部 API 配置：', {
    dashscope: Boolean(process.env.DASHSCOPE_API_KEY),
    minimax: Boolean(process.env.MINIMAX_API_KEY && process.env.MINIMAX_GROUP_ID),
    storageProvider: process.env.STORAGE_PROVIDER || 'local',
  });
}
