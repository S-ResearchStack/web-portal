export function downloadFile(filename: string, blob: Blob) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const downloadFileByUrl = async (fileUrl: string, fileName: string): Promise<void> => {
  const fileResponse = await fetch(fileUrl, { method: 'GET' });
  const blob = await fileResponse.blob();
  downloadFile(fileName, blob);
};

export const humanFileSize = (size: number, fractionDigits = 2, delimiter = '') => {
  const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return [(size / 1024 ** i).toFixed(fractionDigits), ['B', 'KB', 'MB', 'GB', 'TB'][i]].join(
    delimiter
  );
};
