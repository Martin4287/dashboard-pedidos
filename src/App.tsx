import { useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import Papa from 'papaparse';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { format, parse, isValid, getYear, differenceInWeeks, getDay, getMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { Filter, RefreshCw, LayoutDashboard, ShoppingCart, Package, Truck, TrendingUp, Check, ChevronDown, Search, X, Calendar, Tag, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function KpiCard({ title, value, icon, color, trend, onClick }: { title: string, value: string | number, icon: ReactNode, color: string, trend?: number, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group",
        onClick && "cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</p>
          <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h4>
          {trend !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-[10px] font-black uppercase mt-2",
              trend > 0 ? "text-emerald-500" : trend < 0 ? "text-rose-500" : "text-slate-400"
            )}>
              {trend > 0 ? '↑' : trend < 0 ? '↓' : '•'} {Math.abs(trend)}% <span className="text-slate-300 ml-1">vs mes ant.</span>
            </div>
          )}
        </div>
        <div className={cn("p-4 rounded-2xl text-white shadow-2xl transition-transform group-hover:scale-110 group-hover:rotate-3", color)}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function MultiSelect({ label, options, selected, onChange, icon }: { 
  label: string, 
  options: string[], 
  selected: string[], 
  onChange: (val: string[]) => void,
  icon: ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const toggleOption = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  const isAllSelected = selected.length === options.length && options.length > 0;

  const toggleAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange(options);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 bg-white rounded-xl text-xs font-bold transition-all border border-transparent shadow-sm hover:border-slate-200",
          selected.length > 0 && "text-indigo-600 border-indigo-100 bg-indigo-50/30"
        )}
      >
        {icon}
        <span>{label}: {selected.length === 0 ? 'Todos' : selected.length === 1 ? selected[0] : `${selected.length} selec.`}</span>
        <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
        )}
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-slate-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={`Buscar ${label.toLowerCase()}...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              <button 
                onClick={toggleAll}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-xl transition-colors text-left"
              >
                <div className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                  isAllSelected ? "bg-indigo-600 border-indigo-600" : "border-slate-300"
                )}>
                  {isAllSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-xs font-bold text-slate-900">Seleccionar Todos</span>
              </button>

              <div className="h-px bg-slate-50 my-1" />

              {filteredOptions.map(opt => (
                <button 
                  key={`opt-${opt}`}
                  onClick={() => toggleOption(opt)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-xl transition-colors text-left"
                >
                  <div className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                    selected.includes(opt) ? "bg-indigo-600 border-indigo-600" : "border-slate-300"
                  )}>
                    {selected.includes(opt) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={cn(
                    "text-xs transition-colors",
                    selected.includes(opt) ? "text-indigo-600 font-bold" : "text-slate-600 font-medium"
                  )}>
                    {opt}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface Order {
  date: Date;
  article: string;
  provider: string;
  category: string;
  quantity: number;
  unit: string;
  year: number;
}

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1zzLEw9THJdniOduHHfm8v0bjfTVN1I7drV9NUPTt-iU/export?format=csv&gid=0';

const COLORS = ['#0F172A', '#334155', '#475569', '#64748B', '#94A3B8', '#CBD5E1', '#E2E8F0', '#F1F5F9'];

export default function App() {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Filters
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedArticleDetail, setSelectedArticleDetail] = useState<{ article: string, provider: string } | null>(null);
  const [selectedProviderDetail, setSelectedProviderDetail] = useState<string | null>(null);
  const [selectedKpi, setSelectedKpi] = useState<string | null>(null);
  const [showFrequencyAlerts, setShowFrequencyAlerts] = useState(false);

  const frequencyAlerts = useMemo(() => {
    const alerts: {
      article: string;
      provider: string;
      avgInterval: number;
      daysSinceLast: number;
      status: 'delayed' | 'critical';
      lastDate: Date;
    }[] = [];

    const now = new Date();
    // Group by article only to avoid repeating the same article in the table
    const articleGroups: Record<string, { 
      article: string, 
      lastProvider: string, 
      maxTime: number,
      dates: Date[] 
    }> = {};

    // Use the full dataset to establish the baseline
    data.forEach(item => {
      const cleanArticle = item.article.trim();
      const key = cleanArticle.toLowerCase();
      const itemTime = item.date.getTime();
      
      if (!articleGroups[key]) {
        articleGroups[key] = { 
          article: cleanArticle, 
          lastProvider: item.provider.trim(), 
          maxTime: itemTime,
          dates: [] 
        };
      }
      
      articleGroups[key].dates.push(item.date);
      
      // Track the absolute most recent order to show the correct "Last Date" and "Provider"
      if (itemTime > articleGroups[key].maxTime) {
        articleGroups[key].maxTime = itemTime;
        articleGroups[key].lastProvider = item.provider.trim();
      }
    });

    Object.values(articleGroups).forEach(({ article, lastProvider, dates }) => {
      // We need at least 2 orders to calculate an interval
      if (dates.length < 2) return;

      // Sort dates to calculate intervals accurately
      const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
      
      const intervals: number[] = [];
      for (let i = 1; i < sortedDates.length; i++) {
        const diff = Math.max(1, Math.ceil((sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24)));
        intervals.push(diff);
      }

      // Average interval between orders for this specific article
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      
      // The last date is the most recent one we found
      const lastDate = new Date(Math.max(...dates.map(d => d.getTime())));
      
      // Calculate days since last order relative to TODAY
      const daysSinceLast = Math.max(0, Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)));

      // Thresholds for alerts:
      // Critical: More than 2x the average interval
      // Delayed: More than 1.3x the average interval
      const isDelayed = daysSinceLast > avgInterval * 1.3;
      const isCritical = daysSinceLast > avgInterval * 2;

      // User Request: Only show alerts where the last order was in 2026
      if ((isDelayed || isCritical) && lastDate.getFullYear() === 2026) {
        alerts.push({
          article,
          provider: lastProvider,
          avgInterval: Math.round(avgInterval),
          daysSinceLast,
          status: isCritical ? 'critical' : 'delayed',
          lastDate
        });
      }
    });

    // Sort alerts by the most recent order date (as requested)
    return alerts.sort((a, b) => b.lastDate.getTime() - a.lastDate.getTime());
  }, [data]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      Papa.parse(SHEET_URL, {
        download: true,
        header: false,
        skipEmptyLines: 'greedy',
        complete: (results) => {
          const rows = results.data as string[][];
          if (!rows || rows.length === 0) {
            setError('La hoja de cálculo parece estar vacía o no se pudo leer correctamente.');
            setLoading(false);
            return;
          }

          // Helper to normalize strings for comparison
          const normalize = (s: any) => 
            (s || '')
             .toString()
             .toLowerCase()
             .normalize('NFD')
             .replace(/[\u0300-\u036f]/g, "") // Remove accents
             .replace(/[^a-z0-9]/g, '')      // Remove non-alphanumeric
             .trim();

          // 1. Find the header row dynamically
          let headerIndex = -1;
          const expectedHeaders = ['articulo', 'fecha', 'columna1', 'cantidad', 'proveedor', 'rubro', 'categoria'];
          
          for (let i = 0; i < Math.min(rows.length, 50); i++) {
            const row = rows[i];
            const matchCount = row.filter(cell => {
              const normCell = normalize(cell);
              return expectedHeaders.some(eh => normCell.includes(eh));
            }).length;
            
            if (matchCount >= 2) {
              headerIndex = i;
              break;
            }
          }

          if (headerIndex === -1) {
            const sample = rows.slice(0, 5).map(r => r.join(' | ')).join('\n');
            setError(`No se pudo identificar la fila de encabezados. 
              - Filas leídas: ${rows.length}
              - Primeras 5 filas detectadas:
              ${sample}
              
              Asegúrate de que tu hoja tenga columnas con nombres como "Fecha", "Artículo", "Proveedor" y "Cantidad".`);
            setLoading(false);
            return;
          }

          const headerRow = rows[headerIndex];
          const dataRows = rows.slice(headerIndex + 1);

          const colMap: Record<string, number> = {};
          headerRow.forEach((name, idx) => {
            colMap[normalize(name)] = idx;
          });

          const getValByIndex = (row: string[], ...possibleNames: string[]) => {
            for (const name of possibleNames) {
              const normName = normalize(name);
              const foundKey = Object.keys(colMap).find(k => k === normName || k.includes(normName));
              if (foundKey !== undefined) {
                return row[colMap[foundKey]];
              }
            }
            return null;
          };

          const parsedData: Order[] = dataRows
            .map((row: string[]) => {
              const dateStr = getValByIndex(row, 'Columna 1', 'Fecha', 'Date', 'Columna1');
              const article = getValByIndex(row, 'Artículo', 'Articulo', 'Item', 'Product', 'Art');
              
              if (!dateStr || !article || article.toString().trim() === '') return null;

              let date = new Date();
              let dateParsed = false;
              const cleanDateStr = dateStr.toString().trim();
              
              if (cleanDateStr !== '') {
                const serial = Number(cleanDateStr);
                // Excel serials: 43831 (2020-01-01) to 47482 (2029-12-31)
                if (!isNaN(serial) && serial >= 43831 && serial <= 47482) {
                  date = new Date((serial - 25569) * 86400 * 1000);
                  if (isValid(date)) dateParsed = true;
                }

                if (!dateParsed) {
                  const formats = [
                    'dd/MM/yyyy', 'd/M/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd', 
                    'dd-MM-yyyy', 'd/M/yy', 'dd/MM/yy', 'M/d/yyyy', 'M/d/yy',
                    'dd/MMM/yyyy', 'dd/MMM/yy', 'd/MMM/yy', 'MMM dd, yyyy',
                    'dd/MM', 'd/M', 'dd-MM' // Fallback for dates without year
                  ];
                  // Use 2026 as reference year for dates that don't specify one
                  const refDate = new Date(2026, 0, 1);
                  for (const f of formats) {
                    try {
                      const p = parse(cleanDateStr, f, refDate, { locale: es });
                      if (isValid(p) && getYear(p) >= 2020 && getYear(p) <= 2030) {
                        date = p;
                        dateParsed = true;
                        break;
                      }
                    } catch (e) {}
                  }
                }
              }

              if (!dateParsed) return null;

              const rawQty = getValByIndex(row, 'Cantidad', 'Quantity', 'Amount', 'Cant');
              let quantity = 0;
              if (rawQty !== null && rawQty !== undefined) {
                let qtyStr = rawQty.toString().trim();
                if (qtyStr.includes(',') && qtyStr.includes('.')) {
                  if (qtyStr.indexOf('.') < qtyStr.indexOf(',')) {
                    qtyStr = qtyStr.replace(/\./g, '').replace(',', '.');
                  } else {
                    qtyStr = qtyStr.replace(/,/g, '');
                  }
                } else if (qtyStr.includes(',')) {
                  qtyStr = qtyStr.replace(',', '.');
                }
                const parsedQty = parseFloat(qtyStr.replace(/[^0-9.-]/g, ''));
                quantity = isNaN(parsedQty) ? 0 : parsedQty;
              }

              return {
                date,
                article: article.toString().trim(),
                provider: (getValByIndex(row, 'Proveedor', 'Provider', 'Vendor', 'Prov') || 'Sin Proveedor').toString().trim(),
                category: (getValByIndex(row, 'Rubro', 'Categoría', 'Categoria', 'Tipo', 'Rubros') || 'Sin Rubro').toString().trim(),
                quantity,
                unit: (getValByIndex(row, 'Unidad med', 'Unidad', 'Unit', 'Medida') || '').toString().trim(),
                year: getYear(date),
              };
            })
            .filter((item): item is Order => 
              item !== null && 
              item.article !== '' && 
              item.year >= 2020 && 
              item.year <= 2030
            );

          if (parsedData.length === 0) {
            const firstRows = dataRows.slice(0, 5).map(r => JSON.stringify(r)).join('\n');
            setError(`No se encontraron pedidos válidos. 
              - Filas totales: ${rows.length}
              - Encabezados: ${headerRow.join(', ')}
              - Muestra de datos:
              ${firstRows}
              
              Verifica que la columna de fecha sea válida y que haya datos entre 2020-2030.`);
          } else {
            setData(parsedData);
            setError(null);
          }
          setLoading(false);
          setLastUpdate(new Date());
        },
        error: (err) => {
          setError('Error al descargar el CSV. Detalle: ' + err.message);
          setLoading(false);
        }
      });
    } catch (err) {
      setError('Error de conexión con Google Sheets.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const yearMatch = selectedYears.length === 0 || selectedYears.includes(item.year.toString());
      const providerMatch = selectedProviders.length === 0 || selectedProviders.includes(item.provider);
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(item.category);
      const articleMatch = selectedArticles.length === 0 || selectedArticles.includes(item.article);
      return yearMatch && providerMatch && categoryMatch && articleMatch;
    });
  }, [data, selectedYears, selectedProviders, selectedCategories, selectedArticles]);

  // Stats for charts
  const providerStats = useMemo(() => {
    const stats: Record<string, number> = {};
    filteredData.forEach(item => {
      stats[item.provider] = (stats[item.provider] || 0) + 1;
    });
    return Object.entries(stats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredData]);

  const monthlyStats = useMemo(() => {
    const stats: Record<string, { count: number, volume: number }> = {};
    filteredData.forEach(item => {
      const monthYear = format(item.date, 'MMM yyyy', { locale: es });
      if (!stats[monthYear]) stats[monthYear] = { count: 0, volume: 0 };
      stats[monthYear].count += 1;
      stats[monthYear].volume += item.quantity;
    });
    
    const sortedStats = Object.entries(stats)
      .map(([name, data]) => ({ 
        name, 
        pedidos: data.count, 
        volumen: Math.round(data.volume),
        date: parse(name, 'MMM yyyy', new Date(), { locale: es }) 
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate RSI (Relative Strength Index) based on Volume
    // Period: 6 months
    const period = 6;
    return sortedStats.map((curr, idx, arr) => {
      if (idx === 0) return { ...curr, rsi: 50 };

      let avgGain = 0;
      let avgLoss = 0;

      const lookback = arr.slice(Math.max(0, idx - period + 1), idx + 1);
      
      for (let i = 1; i < lookback.length; i++) {
        const change = lookback[i].volumen - lookback[i - 1].volumen;
        if (change > 0) avgGain += change;
        else avgLoss += Math.abs(change);
      }

      avgGain /= lookback.length;
      avgLoss /= lookback.length;

      let rsi = 50;
      if (avgLoss === 0) {
        rsi = avgGain === 0 ? 50 : 100;
      } else {
        const rs = avgGain / avgLoss;
        rsi = 100 - (100 / (1 + rs));
      }

      return { ...curr, rsi: Math.round(rsi) };
    });
  }, [filteredData]);

  const kpiStats = useMemo(() => {
    if (monthlyStats.length < 2) return { pedidosGrowth: 0, volumenGrowth: 0 };
    const current = monthlyStats[monthlyStats.length - 1];
    const previous = monthlyStats[monthlyStats.length - 2];
    
    const pedidosGrowth = previous.pedidos === 0 ? 0 : ((current.pedidos - previous.pedidos) / previous.pedidos) * 100;
    const volumenGrowth = previous.volumen === 0 ? 0 : ((current.volumen - previous.volumen) / previous.volumen) * 100;
    
    return { 
      pedidosGrowth: Math.round(pedidosGrowth), 
      volumenGrowth: Math.round(volumenGrowth) 
    };
  }, [monthlyStats]);

  const articleStats = useMemo(() => {
    const stats: Record<string, number> = {};
    filteredData.forEach(item => {
      stats[item.article] = (stats[item.article] || 0) + 1;
    });
    return Object.entries(stats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filteredData]);

  const uniqueProviders = useMemo(() => [...new Set(data.map(item => item.provider))].sort(), [data]);
  const uniqueYears = useMemo(() => [...new Set(data.map(item => item.year.toString()))].sort(), [data]);
  const uniqueArticles = useMemo(() => [...new Set(data.map(item => item.article))].sort(), [data]);
  const uniqueCategories = useMemo(() => [...new Set(data.map(item => item.category))].sort(), [data]);

  const groupedData = useMemo(() => {
    const groups: Record<string, { 
      article: string; 
      provider: string; 
      category: string; 
      totalQuantity: number; 
      unit: string;
      lastDate: Date;
      count: number;
    }> = {};

    filteredData.forEach(item => {
      const key = `${item.article}:::${item.provider}`;
      if (!groups[key]) {
        groups[key] = {
          article: item.article,
          provider: item.provider,
          category: item.category,
          totalQuantity: 0,
          unit: item.unit,
          lastDate: item.date,
          count: 0
        };
      }
      groups[key].totalQuantity += item.quantity;
      groups[key].count += 1;
      if (item.date > groups[key].lastDate) {
        groups[key].lastDate = item.date;
      }
    });

    return Object.values(groups).sort((a, b) => b.totalQuantity - a.totalQuantity);
  }, [filteredData]);

  const topArticlePerProvider = useMemo(() => {
    const providerGroups: Record<string, Record<string, { volume: number, unit: string }>> = {};
    
    filteredData.forEach(item => {
      if (!providerGroups[item.provider]) {
        providerGroups[item.provider] = {};
      }
      if (!providerGroups[item.provider][item.article]) {
        providerGroups[item.provider][item.article] = { volume: 0, unit: item.unit };
      }
      providerGroups[item.provider][item.article].volume += item.quantity;
    });

    return Object.entries(providerGroups).map(([provider, articles]) => {
      const topArticle = Object.entries(articles)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.volume - a.volume)[0];
      
      return {
        provider,
        topArticle: topArticle?.name || 'N/A',
        volume: topArticle?.volume || 0,
        unit: topArticle?.unit || ''
      };
    }).sort((a, b) => b.volume - a.volume);
  }, [filteredData]);

  const providerDetailStats = useMemo(() => {
    if (!selectedProviderDetail) return null;

    const providerData = filteredData.filter(d => d.provider === selectedProviderDetail);
    
    // Top 10 Articles (Calculate this first to find the star product)
    const articleVolume: Record<string, { volume: number, unit: string }> = {};
    providerData.forEach(d => {
      if (!articleVolume[d.article]) {
        articleVolume[d.article] = { volume: 0, unit: d.unit };
      }
      articleVolume[d.article].volume += d.quantity;
    });

    const topArticles = Object.entries(articleVolume)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.volume - a.volume);

    const starProduct = topArticles[0]?.name;
    const starProductUnit = topArticles[0]?.unit || '';

    // Monthly Evolution for the STAR PRODUCT
    const monthlyVolume: Record<number, number> = {};
    providerData
      .filter(d => d.article === starProduct)
      .forEach(d => {
        const monthIndex = getMonth(d.date); // 0-11
        monthlyVolume[monthIndex] = (monthlyVolume[monthIndex] || 0) + d.quantity;
      });
    
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const evolutionData = monthNames.map((name, index) => ({
      name,
      volumen: Math.round(monthlyVolume[index] || 0)
    }));

    return {
      evolutionData,
      topArticles: topArticles.slice(0, 10),
      starProduct,
      starProductUnit
    };
  }, [filteredData, selectedProviderDetail]);

  const kpiSummaryStats = useMemo(() => {
    if (filteredData.length === 0) return null;

    const dates = filteredData.map(d => d.date.getTime());
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    const weeks = Math.max(1, differenceInWeeks(maxDate, minDate));
    
    // Total Pedidos Stats
    const weeklyFrequency = filteredData.length / weeks;
    const dayCounts: Record<number, number> = {};
    filteredData.forEach(d => {
      const day = getDay(d.date);
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const weekdayDistribution = dayNames.map((name, i) => ({ name, value: dayCounts[i] || 0 }));

    // Proveedores Stats
    const providerVolume: Record<string, number> = {};
    filteredData.forEach(d => {
      providerVolume[d.provider] = (providerVolume[d.provider] || 0) + d.quantity;
    });
    const topProvidersByVolume = Object.entries(providerVolume)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Artículos Stats
    const categoryCounts: Record<string, number> = {};
    const uniqueArticlesPerCategory: Record<string, Set<string>> = {};
    filteredData.forEach(d => {
      categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
      if (!uniqueArticlesPerCategory[d.category]) uniqueArticlesPerCategory[d.category] = new Set();
      uniqueArticlesPerCategory[d.category].add(d.article);
    });
    const articlesByCategory = Object.entries(uniqueArticlesPerCategory)
      .map(([name, set]) => ({ name, value: set.size }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Volumen Stats
    const avgVolumePerOrder = filteredData.reduce((acc, curr) => acc + curr.quantity, 0) / filteredData.length;
    const volumeByMonth: Record<string, number> = {};
    filteredData.forEach(d => {
      const m = format(d.date, 'MMM yy', { locale: es });
      volumeByMonth[m] = (volumeByMonth[m] || 0) + d.quantity;
    });
    const peakVolumeMonth = Object.entries(volumeByMonth).sort((a, b) => b[1] - a[1])[0];

    return {
      weeklyFrequency: weeklyFrequency.toFixed(1),
      weekdayDistribution,
      topProvidersByVolume,
      articlesByCategory,
      avgVolumePerOrder: Math.round(avgVolumePerOrder),
      peakVolumeMonth: peakVolumeMonth ? { name: peakVolumeMonth[0], value: Math.round(peakVolumeMonth[1]) } : null
    };
  }, [filteredData]);

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8FAFC]">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 text-slate-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Cargando datos del dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="p-8 bg-white rounded-2xl shadow-xl border border-red-100 text-center max-w-2xl">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <RefreshCw className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Error de Sincronización</h2>
          <div className="text-slate-600 mb-8 text-left bg-slate-50 p-4 rounded-xl font-mono text-sm whitespace-pre-wrap border border-slate-100 max-h-[300px] overflow-y-auto">
            {error}
          </div>
          <button 
            onClick={fetchData}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
          >
            Reintentar Sincronización
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200 rotate-3">
              <LayoutDashboard className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase italic">Dashboard <span className="text-slate-400 text-lg">v1.3</span></h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sincronizado: {format(lastUpdate, 'HH:mm:ss')}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Filter className="w-3 h-3" /> Filtros
              </div>
              
              <MultiSelect
                label="Año"
                options={uniqueYears}
                selected={selectedYears}
                onChange={setSelectedYears}
                icon={<Calendar className="w-3.5 h-3.5" />}
              />

              <MultiSelect
                label="Rubro"
                options={uniqueCategories}
                selected={selectedCategories}
                onChange={setSelectedCategories}
                icon={<Tag className="w-3.5 h-3.5" />}
              />

              <MultiSelect
                label="Proveedor"
                options={uniqueProviders}
                selected={selectedProviders}
                onChange={setSelectedProviders}
                icon={<Truck className="w-3.5 h-3.5" />}
              />

              <MultiSelect
                label="Artículo"
                options={uniqueArticles}
                selected={selectedArticles}
                onChange={setSelectedArticles}
                icon={<Box className="w-3.5 h-3.5" />}
              />
            </div>

            <button 
              onClick={fetchData}
              disabled={loading}
              className={cn(
                "p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm active:scale-95",
                loading && "animate-spin"
              )}
              title="Actualizar datos"
            >
              <RefreshCw className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 pt-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard 
            title="Total Pedidos" 
            value={filteredData.length.toLocaleString()} 
            icon={<ShoppingCart className="w-6 h-6" />}
            color="bg-indigo-600"
            trend={kpiStats.pedidosGrowth}
            onClick={() => setSelectedKpi('Total Pedidos')}
          />
          <KpiCard 
            title="Proveedores" 
            value={new Set(filteredData.map(i => i.provider)).size} 
            icon={<Truck className="w-6 h-6" />}
            color="bg-emerald-600"
            onClick={() => setSelectedKpi('Proveedores')}
          />
          <KpiCard 
            title="Artículos Únicos" 
            value={new Set(filteredData.map(i => i.article)).size} 
            icon={<Package className="w-6 h-6" />}
            color="bg-orange-500"
            onClick={() => setSelectedKpi('Artículos Únicos')}
          />
          <KpiCard 
            title="Volumen Total" 
            value={Math.round(filteredData.reduce((acc, curr) => acc + curr.quantity, 0)).toLocaleString()} 
            icon={<BarChart className="w-6 h-6" />}
            color="bg-slate-800"
            trend={kpiStats.volumenGrowth}
            onClick={() => setSelectedKpi('Volumen Total')}
          />
        </div>

        {/* Top Article per Provider Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Top Producto por Proveedor</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Artículo con mayor volumen de pedido por cada proveedor en el rango seleccionado</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {topArticlePerProvider.map((item, idx) => (
              <motion.div 
                key={`top-prov-${item.provider}-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedProviderDetail(item.provider)}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg uppercase tracking-widest border border-indigo-100">
                      Proveedor
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Truck className="w-4 h-4" />
                    </div>
                  </div>
                  
                  <h4 className="text-sm font-black text-slate-900 mb-1 truncate" title={item.provider}>
                    {item.provider}
                  </h4>
                  
                  <div className="mt-auto pt-4 border-t border-slate-50">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Producto Estrella</p>
                    <h5 className="text-xs font-bold text-slate-700 mb-3 line-clamp-2 min-h-[2.5rem]">
                      {item.topArticle}
                    </h5>
                    
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900">{Math.round(item.volume).toLocaleString()}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{item.unit}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {topArticlePerProvider.length === 0 && (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
              <p className="text-slate-400 font-medium">No hay datos suficientes para mostrar el top por proveedor.</p>
            </div>
          )}
        </div>

        {/* Alerts Section */}
        {frequencyAlerts.length > 0 && (
          <div className="mb-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-rose-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Alertas de Frecuencia de Pedidos</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Artículos que han superado su intervalo habitual de compra</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-rose-100 text-rose-700 text-[10px] font-black rounded-full uppercase tracking-widest">
                  {frequencyAlerts.length} Alertas Detectadas
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Artículo</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Proveedor</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Frecuencia Habitual</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Días desde último</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {frequencyAlerts.slice(0, showFrequencyAlerts ? undefined : 5).map((alert) => (
                    <tr key={`alert-${alert.article}-${alert.provider}`} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-900">{alert.article}</p>
                        <p className="text-[10px] text-slate-400 font-medium italic">Último: {format(alert.lastDate, 'dd MMM yyyy', { locale: es })}</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-600">{alert.provider}</td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-600 text-center">Cada {alert.avgInterval} días</td>
                      <td className="px-6 py-4 text-xs font-black text-rose-600 text-center">{alert.daysSinceLast} días</td>
                      <td className="px-6 py-4 text-right">
                        <span className={cn(
                          "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                          alert.status === 'critical' ? "bg-rose-100 text-rose-700" : "bg-orange-100 text-orange-700"
                        )}>
                          {alert.status === 'critical' ? 'Crítico' : 'Retrasado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {frequencyAlerts.length > 5 && (
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
                <button 
                  onClick={() => setShowFrequencyAlerts(!showFrequencyAlerts)}
                  className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors"
                >
                  {showFrequencyAlerts ? 'Ver menos alertas' : `Ver las ${frequencyAlerts.length - 5} alertas restantes`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Main Trend Chart */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">
                Flujo Mensual (Pedidos vs Volumen)
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Pedidos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-300" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Volumen</span>
                </div>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 600}}
                    dy={10}
                  />
                  <YAxis 
                    yAxisId="left"
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 600}}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#CBD5E1', fontSize: 10, fontWeight: 600}}
                  />
                  <Tooltip 
                    cursor={{fill: '#F8FAFC'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px'}}
                  />
                  <Bar yAxisId="left" dataKey="pedidos" name="Pedidos" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={24} />
                  <Bar yAxisId="right" dataKey="volumen" name="Volumen" fill="#E2E8F0" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RSI Growth Indicator Chart */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">
                  Indicador de Crecimiento (RSI)
                </h3>
                <div className="flex items-center gap-2">
                  <TrendingUp className={cn("w-4 h-4", monthlyStats[monthlyStats.length-1]?.rsi > 50 ? "text-emerald-500" : "text-slate-400")} />
                  <span className={cn("text-[10px] font-bold uppercase", monthlyStats[monthlyStats.length-1]?.rsi > 50 ? "text-emerald-500" : "text-slate-400")}>
                    Momentum: {monthlyStats[monthlyStats.length-1]?.rsi > 70 ? 'Fuerte' : monthlyStats[monthlyStats.length-1]?.rsi < 30 ? 'Débil' : 'Estable'}
                  </span>
                </div>
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border",
                monthlyStats[monthlyStats.length-1]?.rsi > 70 ? "bg-rose-50 text-rose-600 border-rose-100" : 
                monthlyStats[monthlyStats.length-1]?.rsi < 30 ? "bg-blue-50 text-blue-600 border-blue-100" : 
                "bg-emerald-50 text-emerald-600 border-emerald-100"
              )}>
                RSI: {monthlyStats[monthlyStats.length-1]?.rsi}
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 600}}
                    dy={10}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 600}}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px'}}
                  />
                  {/* RSI Zones */}
                  <ReferenceArea {...({ y1: 30, y2: 70, fill: '#F8FAFC', fillOpacity: 0.5 } as any)} />
                  <ReferenceLine y={70} stroke="#FDA4AF" strokeDasharray="3 3" label={{ position: 'right', value: '70', fill: '#FDA4AF', fontSize: 10 }} />
                  <ReferenceLine y={30} stroke="#93C5FD" strokeDasharray="3 3" label={{ position: 'right', value: '30', fill: '#93C5FD', fontSize: 10 }} />
                  <ReferenceLine y={50} stroke="#E2E8F0" strokeWidth={1} />
                  
                  <Line 
                    type="monotone" 
                    dataKey="rsi" 
                    stroke="#10B981" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 6, strokeWidth: 0 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Articles Chart */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm lg:col-span-1">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Top 10 Artículos</h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={articleStats} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748B', fontSize: 9, fontWeight: 700}}
                    width={100}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}}
                  />
                  <Bar dataKey="value" name="Pedidos" fill="#6366F1" radius={[0, 6, 6, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm lg:col-span-2 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Resumen por Artículo</h3>
                <p className="text-[10px] text-slate-400 font-bold">Cantidades acumuladas en el periodo</p>
              </div>
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100">
                {groupedData.length} Artículos
              </span>
            </div>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {groupedData.slice(0, 50).map((group) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={`group-${group.article}:::${group.provider}`} 
                  onClick={() => setSelectedArticleDetail({ article: group.article, provider: group.provider })}
                  className="group flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:shadow-slate-100 border border-transparent hover:border-slate-100 rounded-2xl transition-all duration-300 gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex flex-col items-center justify-center shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300">
                      <span className="text-[10px] font-black uppercase leading-none opacity-60">{format(group.lastDate, 'MMM', { locale: es })}</span>
                      <span className="text-lg font-black leading-none">{format(group.lastDate, 'dd')}</span>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{group.article}</h5>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <Truck className="w-3 h-3" /> {group.provider}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <Tag className="w-3 h-3" /> {group.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Acumulado</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-slate-900">{group.totalQuantity.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{group.unit}</span>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                      {group.count} Pedidos
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {groupedData.length === 0 && (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="w-10 h-10 text-slate-200" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">Sin resultados</h4>
                  <p className="text-slate-400 text-sm max-w-[250px] mx-auto">No hay pedidos que coincidan con los filtros seleccionados.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {selectedKpi && kpiSummaryStats && (
          <div key="modal-kpi-overlay" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-xl text-white shadow-lg",
                    selectedKpi === 'Total Pedidos' ? "bg-indigo-600" :
                    selectedKpi === 'Proveedores' ? "bg-emerald-600" :
                    selectedKpi === 'Artículos Únicos' ? "bg-orange-500" : "bg-slate-800"
                  )}>
                    {selectedKpi === 'Total Pedidos' ? <ShoppingCart className="w-5 h-5" /> :
                     selectedKpi === 'Proveedores' ? <Truck className="w-5 h-5" /> :
                     selectedKpi === 'Artículos Únicos' ? <Package className="w-5 h-5" /> : <BarChart className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase italic">{selectedKpi}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Resumen Analítico</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedKpi(null)}
                  className="p-2 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                {selectedKpi === 'Total Pedidos' && (
                  <motion.div key="kpi-pedidos" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex items-center justify-between p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                      <div>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Frecuencia Semanal</p>
                        <h4 className="text-4xl font-black text-indigo-600 tracking-tighter">{kpiSummaryStats.weeklyFrequency}</h4>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase mt-1">Pedidos por semana</p>
                      </div>
                      <TrendingUp className="w-12 h-12 text-indigo-200" />
                    </div>
                    <div className="mt-8">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Distribución por Día</h5>
                      <div className="h-40 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={kpiSummaryStats.weekdayDistribution}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94A3B8'}} />
                            <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                            <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </motion.div>
                )}

                {selectedKpi === 'Proveedores' && (
                  <motion.div key="kpi-proveedores" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top 5 Proveedores por Volumen</h5>
                    {kpiSummaryStats.topProvidersByVolume.map((p, idx) => (
                      <div key={`provider-${p.name}-${idx}`} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-xs font-bold text-slate-700">{p.name}</span>
                        <span className="text-sm font-black text-slate-900">{p.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </motion.div>
                )}

                {selectedKpi === 'Artículos Únicos' && (
                  <motion.div key="kpi-articulos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Artículos Únicos por Rubro</h5>
                    {kpiSummaryStats.articlesByCategory.map((c, idx) => (
                      <div key={`category-${c.name}-${idx}`} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-xs font-bold text-slate-700">{c.name}</span>
                        <span className="text-sm font-black text-slate-900">{c.value} Art.</span>
                      </div>
                    ))}
                  </motion.div>
                )}

                {selectedKpi === 'Volumen Total' && (
                  <motion.div key="kpi-volumen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Promedio / Pedido</p>
                      <h4 className="text-2xl font-black text-slate-900">{kpiSummaryStats.avgVolumePerOrder}</h4>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mes Pico</p>
                      <h4 className="text-2xl font-black text-slate-900">{kpiSummaryStats.peakVolumeMonth?.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{kpiSummaryStats.peakVolumeMonth?.value.toLocaleString()}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {selectedProviderDetail && providerDetailStats && (
          <div key="modal-provider-overlay" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              key={`provider-detail-${selectedProviderDetail}`}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-600">
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight uppercase italic">{selectedProviderDetail}</h3>
                  <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-widest mt-1">Análisis de Volumen por Mes y Productos Top</p>
                </div>
                <button 
                  onClick={() => setSelectedProviderDetail(null)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {/* Chart Section */}
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evolución Mensual: Producto Estrella</h4>
                      <p className="text-xs font-bold text-slate-900 mt-1">{providerDetailStats.starProduct}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg uppercase tracking-widest border border-indigo-100">
                        {providerDetailStats.starProductUnit}
                      </span>
                    </div>
                  </div>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={providerDetailStats.evolutionData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                        />
                        <Tooltip 
                          cursor={{ fill: '#F1F5F9' }}
                          contentStyle={{ 
                            borderRadius: '16px', 
                            border: 'none', 
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        />
                        <Bar 
                          dataKey="volumen" 
                          fill="#4F46E5" 
                          radius={[6, 6, 0, 0]} 
                          barSize={30}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Table Section */}
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Top 10 Productos con Mayor Volumen</h4>
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">
                      <span className="col-span-8">Artículo</span>
                      <span className="col-span-4 text-right">Volumen Total</span>
                    </div>
                    {providerDetailStats.topArticles.map((art, i) => (
                      <div key={art.name} className="grid grid-cols-12 items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                        <div className="col-span-8 flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400">
                            {i + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-700 truncate">{art.name}</span>
                        </div>
                        <div className="col-span-4 text-right flex items-baseline justify-end gap-1">
                          <span className="text-sm font-black text-slate-900">{Math.round(art.volume).toLocaleString()}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{art.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

                {selectedArticleDetail && (
                  <div key="modal-article-overlay" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <motion.div 
                      key={`detail-${selectedArticleDetail.article}:::${selectedArticleDetail.provider}`}
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">{selectedArticleDetail.article}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Proveedor: {selectedArticleDetail.provider}</p>
                </div>
                <button 
                  onClick={() => setSelectedArticleDetail(null)}
                  className="p-2 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                <div className="grid grid-cols-3 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                  <span>Fecha</span>
                  <span className="text-center">Cantidad</span>
                  <span className="text-right">Rubro</span>
                </div>
                
                {filteredData
                  .filter(o => o.article === selectedArticleDetail.article && o.provider === selectedArticleDetail.provider)
                  .sort((a, b) => b.date.getTime() - a.date.getTime())
                  .map((order, i) => (
                    <div key={`${order.date.getTime()}-${order.quantity}-${i}`} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex flex-col items-center justify-center">
                           <span className="text-[8px] font-black uppercase leading-none opacity-60">{format(order.date, 'MMM', { locale: es })}</span>
                           <span className="text-sm font-black leading-none">{format(order.date, 'dd')}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-600">{format(order.date, 'yyyy')}</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-slate-900">{order.quantity.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{order.unit}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-white px-2 py-1 rounded-lg border border-slate-100">
                        {order.category}
                      </span>
                    </div>
                  ))}
              </div>
              
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Acumulado</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-indigo-600">
                      {filteredData
                        .filter(o => o.article === selectedArticleDetail.article && o.provider === selectedArticleDetail.provider)
                        .reduce((acc, curr) => acc + curr.quantity, 0).toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      {filteredData.find(o => o.article === selectedArticleDetail.article && o.provider === selectedArticleDetail.provider)?.unit}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registros</span>
                  <p className="text-lg font-black text-slate-900">
                    {filteredData.filter(o => o.article === selectedArticleDetail.article && o.provider === selectedArticleDetail.provider).length}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
