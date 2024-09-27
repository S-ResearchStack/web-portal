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

const sizeList = ['B', 'KB', 'MB', 'GB', 'TB']

export const humanFileSize = (size: number, fractionDigits = 2, delimiter = ' ') => {
  const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return [(size / 1024 ** i).toFixed(fractionDigits), sizeList[i]].join(
    delimiter
  );
};

export const humanFileProgressSize = (responded: number, total: number, fractionDigits = 2, delimiter = ' '): string => {
  const i = total === 0 ? 0 : Math.floor(Math.log(total) / Math.log(1024));
  return [
    `${(responded / 1024 ** i).toFixed(fractionDigits)} / ${(total / 1024 ** i).toFixed(fractionDigits)}`,
    sizeList[i]
  ].join(delimiter)
}
