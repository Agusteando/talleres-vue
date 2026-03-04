import axios from 'axios'
import { logger } from './logger'

export async function exportToExcel(data, filename) {
  try {
    logger.info(`Exporting data to Excel: ${filename}`, { rows: data.length });
    const response = await axios.post('https://bot.casitaapps.com/exportToExcel', data);
    
    const base64Excel = response.data;
    const blob = base64ToBlob(base64Excel, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logger.info(`Export successful: ${filename}`);
  } catch (error) {
    logger.error('Failed to export Excel', error);
    throw error;
  }
}

export function base64ToBlob(b64Data, contentType = '', sliceSize = 512) {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }
  return new Blob(byteArrays, { type: contentType });
}

export function base64ToFile(base64, fileName, mimeType) {
  const blob = base64ToBlob(base64, mimeType);
  return new File([blob], fileName, { type: mimeType });
}