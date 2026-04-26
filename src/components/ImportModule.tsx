import React, { useCallback, useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Upload, Users, Info, PlusCircle, ClipboardList, Check, X, RefreshCw } from 'lucide-react';
import { Employee } from '../types';
import { generateId } from '../lib/utils';
import { cn } from '../lib/utils';

interface ImportModuleProps {
  onImport: (employees: Employee[]) => void;
  count: number;
}

export const ImportModule: React.FC<ImportModuleProps> = ({ onImport, count }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
  const [manualText, setManualText] = useState('');
  const [previewData, setPreviewData] = useState<Employee[]>([]);
  const [isPreviewing, setIsPreviewing] = useState(false);

  // 数据校验函数
  const validateData = (employees: Employee[]): { valid: boolean; message: string; validEmployees: Employee[] } => {
    if (employees.length === 0) {
      return { valid: false, message: '没有可导入的数据', validEmployees: [] };
    }

    // 检查空值
    const invalidRows = employees.filter(emp => !emp.name.trim());
    if (invalidRows.length > 0) {
      return { valid: false, message: `存在 ${invalidRows.length} 行数据不完整，请检查后重新导入`, validEmployees: [] };
    }

    // 去重
    const uniqueEmployees = [];
    const seen = new Set<string>();
    employees.forEach(emp => {
      const key = `${emp.name.trim()}-${emp.department.trim()}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueEmployees.push(emp);
      }
    });

    if (uniqueEmployees.length < employees.length) {
      return { 
        valid: true, 
        message: `存在重复数据，已自动去重，实际导入 ${uniqueEmployees.length} 人`, 
        validEmployees: uniqueEmployees 
      };
    }

    return { valid: true, message: `成功解析 ${employees.length} 人数据`, validEmployees: employees };
  };

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件格式
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.txt')) {
      alert('请选择正确格式的文件（.xlsx/.csv/.txt）');
      return;
    }

    if (fileName.endsWith('.csv')) {
      Papa.parse(file, {
        complete: (results) => {
          const employees: Employee[] = results.data
            .filter((row: any) => row[0])
            .map((row: any) => ({
              id: generateId(),
              name: row[0].toString().trim(),
              department: row[1]?.toString().trim() || '',
            }));
          
          const validation = validateData(employees);
          if (validation.valid) {
            setPreviewData(validation.validEmployees);
            setIsPreviewing(true);
            if (validation.message.includes('去重')) {
              alert(validation.message);
            }
          } else {
            alert(validation.message);
          }
        },
        header: false,
      });
    } else if (fileName.endsWith('.xlsx')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const employees: Employee[] = jsonData
          .filter((row: any) => row[0])
          .map((row: any) => ({
            id: generateId(),
            name: row[0].toString().trim(),
            department: row[1]?.toString().trim() || '',
          }));
        
        const validation = validateData(employees);
        if (validation.valid) {
          setPreviewData(validation.validEmployees);
          setIsPreviewing(true);
          if (validation.message.includes('去重')) {
            alert(validation.message);
          }
        } else {
          alert(validation.message);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const employees: Employee[] = lines.map(line => {
          const [name, dept] = line.split(/[,\t ]+/);
          return {
            id: generateId(),
            name: name.trim(),
            department: dept?.trim() || '',
          };
        });
        
        const validation = validateData(employees);
        if (validation.valid) {
          setPreviewData(validation.validEmployees);
          setIsPreviewing(true);
          if (validation.message.includes('去重')) {
            alert(validation.message);
          }
        } else {
          alert(validation.message);
        }
      };
      reader.readAsText(file);
    }
  }, []);

  const handleManualImport = () => {
    const lines = manualText.split('\n').filter(line => line.trim());
    const employees: Employee[] = lines.map(line => {
      // Split by common separators: space, comma, tab
      const parts = line.split(/[,\s\t]+/);
      return {
        id: generateId(),
        name: parts[0].trim(),
        department: parts.slice(1).join(' ').trim() || '',
      };
    });
    
    const validation = validateData(employees);
    if (validation.valid) {
      setPreviewData(validation.validEmployees);
      setIsPreviewing(true);
      if (validation.message.includes('去重')) {
        alert(validation.message);
      }
    } else {
      alert(validation.message);
    }
  };

  const handleConfirmImport = () => {
    onImport(previewData);
    setIsPreviewing(false);
    setPreviewData([]);
    setManualText('');
    alert(`成功导入 ${previewData.length} 位员工！`);
  };

  const handleReImport = () => {
    setIsPreviewing(false);
    setPreviewData([]);
  };

  return (
    <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/20 rounded-lg">
            <Users className="text-yellow-500 w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold dark:text-white text-gray-800">员工名单</h3>
            <p className="dark:text-white/40 text-gray-400 text-xs text-nowrap">支持批量导入与手动录入</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-3xl font-black text-yellow-500">{count}</span>
          <span className="dark:text-white/40 text-gray-400 text-sm ml-1">人</span>
        </div>
      </div>

      {isPreviewing ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold dark:text-white text-gray-800">名单预览</h4>
            <span className="text-sm dark:text-white/60 text-gray-500">共 {previewData.length} 人</span>
          </div>
          
          <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-white/20 rounded-xl p-2">
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-gray-300 dark:border-white/20 mb-2">
              <div className="font-bold dark:text-white text-gray-800">姓名</div>
              <div className="font-bold dark:text-white text-gray-800">部门</div>
            </div>
            {previewData.map((emp, index) => (
              <div key={emp.id} className="grid grid-cols-2 gap-2 py-2 border-b border-gray-200 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <div className="dark:text-white text-gray-800">{emp.name}</div>
                <div className="dark:text-white/60 text-gray-500">{emp.department || '-'}</div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleConfirmImport}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95"
            >
              <Check className="w-4 h-4" />
              确认导入
            </button>
            <button
              onClick={handleReImport}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              重新导入
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex p-1 bg-black/10 dark:bg-white/5 rounded-xl mb-4">
            <button
              onClick={() => setActiveTab('upload')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === 'upload' 
                  ? "bg-white text-black shadow-sm" 
                  : "text-gray-500 dark:text-white/40 hover:text-white"
              )}
            >
              <Upload className="w-4 h-4" /> 文件上传
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === 'manual' 
                  ? "bg-white text-black shadow-sm" 
                  : "text-gray-500 dark:text-white/40 hover:text-white"
              )}
            >
              <PlusCircle className="w-4 h-4" /> 手动录入
            </button>
          </div>

          {activeTab === 'upload' ? (
            <label className="relative group flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-white/20 rounded-xl cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 hover:border-yellow-500/50 transition-all transform hover:scale-[1.02]">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 text-gray-400 dark:text-white/40 group-hover:text-yellow-500 mb-2 transition-colors" />
                <p className="text-sm text-gray-500 dark:text-white/60 text-center px-4">点击或拖拽 Excel/CSV/TXT 文件导入</p>
                <p className="text-xs text-gray-400 dark:text-white/40 mt-2">支持 .xlsx, .csv, .txt 格式</p>
              </div>
              <input type="file" className="hidden" accept=".xlsx,.csv,.txt" onChange={handleFileUpload} />
            </label>
          ) : (
            <div className="space-y-3">
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="每行一个: 姓名 部门"
                className="w-full h-32 bg-white/5 dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-xl p-3 text-sm dark:text-white text-gray-800 outline-none focus:border-yellow-500/50 resize-none font-mono"
              />
              <button
                onClick={handleManualImport}
                disabled={!manualText.trim()}
                className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:grayscale transform hover:scale-105 active:scale-95"
              >
                确认添加
              </button>
            </div>
          )}

          <div className="mt-4 flex items-start gap-2 text-[10px] text-gray-400 dark:text-white/30 uppercase tracking-wider">
            <Info className="w-3 h-3 flex-shrink-0" />
            <p>适合多规模场景，支持 1k+ 名单流畅加载</p>
          </div>
        </>
      )}
    </div>
  );
};
