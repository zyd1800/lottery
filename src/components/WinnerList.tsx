import React, { useState } from 'react';
import { Download, Trash2, Award, ExternalLink, Check, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Winner } from '../types';

interface WinnerListProps {
  winners: Winner[];
  onClear: () => void;
}

export const WinnerList: React.FC<WinnerListProps> = ({ winners, onClear }) => {
  const [showExportModal, setShowExportModal] = useState(false);

  const exportToExcel = () => {
    if (winners.length === 0) return;
    
    const headers = ['中奖轮次', '姓名', '部门', '奖品名称'];
    const rows = winners.map((w, index) => [
      index + 1,
      w.employee.name,
      w.employee.department || '-',
      w.prize.title
    ]);
    
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '中奖名单');
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const fileName = `公司年会中奖名单${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
    saveAs(dataBlob, `${fileName}.xlsx`);
    
    setShowExportModal(false);
    alert('导出成功！');
  };

  const exportToPDF = () => {
    if (winners.length === 0) return;
    
    // 简单的 PDF 导出实现，实际项目中可以使用更专业的库如 jsPDF
    const headers = ['中奖轮次', '姓名', '部门', '奖品名称'];
    const rows = winners.map((w, index) => [
      index + 1,
      w.employee.name,
      w.employee.department || '-',
      w.prize.title
    ]);
    
    let htmlContent = `
      <html>
      <head>
        <meta charset="utf-8">
        <title>公司年会中奖名单</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <h1>公司年会中奖名单</h1>
        <table>
          <thead>
            <tr>
              ${headers.map(header => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                ${row.map(cell => `<td>${cell}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const fileName = `公司年会中奖名单${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
    saveAs(blob, `${fileName}.html`);
    
    setShowExportModal(false);
    alert('导出成功！（注：PDF 格式暂以 HTML 形式导出，可在浏览器中打印为 PDF）');
  };

  return (
    <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 dark:border-white/10 h-full flex flex-col shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <Award className="text-red-500 w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold dark:text-white text-gray-800">中奖记录</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowExportModal(true)}
            disabled={winners.length === 0}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-green-600 disabled:opacity-30 flex items-center gap-2 text-sm font-bold transition-all transform hover:scale-105 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">导出</span>
          </button>
          <button
            onClick={onClear}
            disabled={winners.length === 0}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-red-500 disabled:opacity-30 transition-all transform hover:scale-105 active:scale-95"
            title="清空记录"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[800px] pr-2 space-y-3 custom-scrollbar">
        {winners.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center dark:text-white text-gray-400 opacity-20 py-20">
            <Award className="w-12 h-12 mb-2" />
            <p>暂无中奖数据</p>
          </div>
        ) : (
          winners.map((winner, idx) => (
            <div 
              key={winner.timestamp + idx}
              className="bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-right duration-500"
            >
              <div>
                <div className="dark:text-white text-gray-800 font-bold text-lg">{winner.employee.name}</div>
                <div className="text-gray-400 dark:text-white/40 text-xs">{winner.employee.department}</div>
              </div>
              <div className="text-right">
                <div className="text-yellow-600 dark:text-yellow-400 text-sm font-bold">{winner.prize.title}</div>
                <div className="text-gray-400 dark:text-white/20 text-[10px] uppercase">{new Date(winner.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 导出格式选择弹窗 */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all scale-100">
            <h3 className="text-xl font-bold dark:text-white text-gray-800 mb-4">选择导出格式</h3>
            <div className="space-y-3">
              <button
                onClick={exportToExcel}
                className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95"
              >
                <Check className="w-4 h-4" />
                Excel (.xlsx)
              </button>
              <button
                onClick={exportToPDF}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95"
              >
                <Check className="w-4 h-4" />
                PDF (.pdf)
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95"
              >
                <X className="w-4 h-4" />
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
