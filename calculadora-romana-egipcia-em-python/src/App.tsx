import React, { useState } from 'react';
import {
  Calculator,
  Code,
  Play,
  Copy,
  Check,
  Download,
  ArrowRightLeft,
  BookOpen,
  Terminal,
  Delete,
  Sparkles,
} from 'lucide-react';
import PYTHON_SOURCE_CODE from '../calculadora_romana.py?raw';

export type NumeralSystem = 'romano' | 'egipcio';

// Mapas de conversão
const ROMAN_MAP: [number, string][] = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

const ROMAN_VALUES: Record<string, number> = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
};

const EGYPTIAN_MAP: [number, string, string][] = [
  [1000000, '𓁨', 'Deus Heh'],
  [100000, '𓆐', 'Girino'],
  [10000, '𓂭', 'Dedo'],
  [1000, '𓆼', 'Flor de Lótus'],
  [100, '𓍢', 'Corda'],
  [10, '𓎆', 'Calcanhar'],
  [1, '𓏺', 'Bastão'],
];

const EGYPTIAN_VALUES: Record<string, number> = Object.fromEntries(
  EGYPTIAN_MAP.map(([val, sym]) => [sym, val])
);

// Função única reutilizável para converter inteiro em qualquer sistema de símbolos
function convertIntToSymbols(
  num: number,
  map: [number, string][],
  maxLimit: number
): string {
  const nInt = Math.trunc(num);
  if (nInt === 0) return 'NULLA';
  if (nInt < 0) return '-' + convertIntToSymbols(Math.abs(nInt), map, maxLimit);
  if (nInt > maxLimit) return `LIMITE EXCEDIDO (>${maxLimit})`;

  let result = '';
  let remainder = nInt;
  for (const [val, symbol] of map) {
    while (remainder >= val) {
      result += symbol;
      remainder -= val;
    }
  }
  return result;
}

export function intToRoman(num: number): string {
  return convertIntToSymbols(num, ROMAN_MAP, 3999);
}

export function intToEgyptian(num: number): string {
  const simpleMap: [number, string][] = EGYPTIAN_MAP.map(([v, s]) => [v, s]);
  return convertIntToSymbols(num, simpleMap, 9999999);
}

export function romanToInt(romanStr: string): number {
  const clean = romanStr.trim().toUpperCase();
  if (!clean || clean === 'NULLA') return 0;

  const pattern = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
  if (!pattern.test(clean)) {
    throw new Error(`Numeral romano inválido: '${clean}'`);
  }

  let total = 0;
  for (let i = 0; i < clean.length; i++) {
    const curVal = ROMAN_VALUES[clean[i]];
    const nextVal = ROMAN_VALUES[clean[i + 1]] || 0;
    total += curVal < nextVal ? -curVal : curVal;
  }
  return total;
}

export function egyptianToInt(egyptianStr: string): number {
  const clean = egyptianStr.trim();
  if (!clean || clean.toUpperCase() === 'NULLA') return 0;

  const chars = Array.from(clean);
  const counts: Record<string, number> = {};
  let total = 0;

  for (const ch of chars) {
    const val = EGYPTIAN_VALUES[ch];
    if (!val) {
      throw new Error(`Símbolo egípcio inválido: '${ch}'`);
    }
    counts[ch] = (counts[ch] || 0) + 1;
    if (counts[ch] > 9) {
      throw new Error(`O símbolo '${ch}' não pode se repetir mais de 9 vezes.`);
    }
    total += val;
  }
  return total;
}

function tokenToInt(token: string): number {
  const upper = token.toUpperCase();
  if (upper === 'NULLA') return 0;
  if (/^\d+$/.test(token)) return parseInt(token, 10);
  if (Array.from(token).every((c) => c in EGYPTIAN_VALUES)) {
    return egyptianToInt(token);
  }
  if (/^[IVXLCDM]+$/.test(upper)) {
    return romanToInt(upper);
  }
  throw new Error(`Símbolo desconhecido: '${token}'`);
}

// Avalia expressão matemática apenas com números inteiros e as 4 operações básicas (+, -, *, /)
function evaluateMultiExpr(expr: string): {
  arabicResult: number;
  romanResult: string;
  egyptianResult: string;
  steps: string;
} {
  const trimmed = expr.trim();
  if (!trimmed) {
    return {
      arabicResult: 0,
      romanResult: 'NULLA',
      egyptianResult: 'NULLA',
      steps: 'Expressão vazia',
    };
  }

  if (/[^IVXLCDMivxlcdm\u{133FA}\u{13386}\u{13362}\u{131BC}\u{130AD}\u{13190}\u{13068}0-9+\-*/()\sNULLAnulla]/u.test(trimmed)) {
    throw new Error('Use apenas números inteiros e as 4 operações básicas (+, -, *, /).');
  }

  const tokens =
    trimmed.match(
      /([\u{133FA}\u{13386}\u{13362}\u{131BC}\u{130AD}\u{13190}\u{13068}]+|[IVXLCDM]+|NULLA|\d+|[+\-*/()])/giu
    ) || [];

  if (tokens.length === 0) {
    throw new Error('Expressão inválida.');
  }

  // Parser simples de precedência para garantir divisão inteira exata em cada operação '/'
  let pos = 0;

  function parseExpression(): number {
    let left = parseTerm();
    while (pos < tokens.length && (tokens[pos] === '+' || tokens[pos] === '-')) {
      const op = tokens[pos++];
      const right = parseTerm();
      left = op === '+' ? left + right : left - right;
    }
    return left;
  }

  function parseTerm(): number {
    let left = parseFactor();
    while (pos < tokens.length && (tokens[pos] === '*' || tokens[pos] === '/')) {
      const op = tokens[pos++];
      const right = parseFactor();
      if (op === '*') {
        left = left * right;
      } else {
        if (right === 0) throw new Error('Divisão por zero não é permitida.');
        left = Math.trunc(left / right); // Divisão estritamente inteira
      }
    }
    return left;
  }

  function parseFactor(): number {
    if (pos >= tokens.length) throw new Error('Expressão incompleta.');
    const t = tokens[pos++];
    if (t === '+') return parseFactor();
    if (t === '-') return -parseFactor();
    if (t === '(') {
      const val = parseExpression();
      if (tokens[pos++] !== ')') throw new Error('Parênteses não fechados.');
      return val;
    }
    if (['+', '-', '*', '/', ')'].includes(t)) {
      throw new Error(`Operador inesperado: '${t}'`);
    }
    return tokenToInt(t);
  }

  const arabicExprParts = tokens.map((t) =>
    ['+', '-', '*', '/', '(', ')'].includes(t) ? t : String(tokenToInt(t))
  );

  const finalInt = parseExpression();
  if (pos < tokens.length) {
    throw new Error('Expressão mal formada.');
  }

  const romanRes = intToRoman(finalInt);
  const egyptianRes = intToEgyptian(finalInt);
  const steps = `${trimmed} ➔ ${arabicExprParts.join(' ')} = ${finalInt} ➔ Romano: ${romanRes} | Egípcio: ${egyptianRes}`;

  return {
    arabicResult: finalInt,
    romanResult: romanRes,
    egyptianResult: egyptianRes,
    steps,
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'calc' | 'converter' | 'python' | 'rules'>('calc');
  const [keypadMode, setKeypadMode] = useState<NumeralSystem>('romano');
  const [expression, setExpression] = useState<string>('XIV + IX');
  const [romanResult, setRomanResult] = useState<string>('XXIII');
  const [egyptianResult, setEgyptianResult] = useState<string>('𓎆𓎆𓏺𓏺𓏺');
  const [arabicResult, setArabicResult] = useState<number | null>(23);
  const [stepsInfo, setStepsInfo] = useState<string>(
    'XIV + IX ➔ 14 + 9 = 23 ➔ Romano: XXIII | Egípcio: 𓎆𓎆𓏺𓏺𓏺'
  );
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [history, setHistory] = useState<
    Array<{ expr: string; roman: string; egyptian: string; arabic: number }>
  >([
    { expr: 'XIV + IX', roman: 'XXIII', egyptian: '𓎆𓎆𓏺𓏺𓏺', arabic: 23 },
    { expr: '𓎆𓎆 + 𓏺𓏺𓏺𓏺𓏺', roman: 'XXV', egyptian: '𓎆𓎆𓏺𓏺𓏺𓏺𓏺', arabic: 25 },
    { expr: 'XII * V', roman: 'LX', egyptian: '𓎆𓎆𓎆𓎆𓎆𓎆', arabic: 60 },
  ]);

  // Estado da aba Conversor
  const [convInputRoman, setConvInputRoman] = useState<string>('MMXXV');
  const [convInputEgyptian, setConvInputEgyptian] = useState<string>('𓆼𓆼𓎆𓎆𓏺𓏺𓏺𓏺𓏺');
  const [convInputArabic, setConvInputArabic] = useState<string>('2025');
  const [convError, setConvError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Estado da aba Simulador Python
  const [pyCode, setPyCode] = useState<string>(
    `# Teste da Calculadora Multi-Funções (Romana e Egípcia)
expressao = "𓎆𓏺𓏺 + XIV"
resultado = calc(expressao, sistema="romano")
print(f"Expressão: {expressao}")
print(f"Resultado: {resultado}")`
  );
  const [pyOutput, setPyOutput] = useState<string>(
    `>>> Executando script de teste...
Expressão: 𓎆𓏺𓏺 + XIV
Passo Inteiro: 12 + 14 = 26
Resultado Romano: XXVI
Resultado Egípcio: 𓎆𓎆𓏺𓏺𓏺𓏺𓏺𓏺`
  );
  const [isRunningPy, setIsRunningPy] = useState<boolean>(false);

  // Função centralizada para atualizar a expressão sem repetição de código
  const updateExpression = (newExpr: string, saveToHistory = false) => {
    setExpression(newExpr);
    setErrorMsg('');

    if (!newExpr.trim()) {
      setRomanResult('');
      setEgyptianResult('');
      setArabicResult(null);
      setStepsInfo('');
      return;
    }

    try {
      const evaluated = evaluateMultiExpr(newExpr);
      setRomanResult(evaluated.romanResult);
      setEgyptianResult(evaluated.egyptianResult);
      setArabicResult(evaluated.arabicResult);
      setStepsInfo(evaluated.steps);

      if (saveToHistory) {
        setHistory((prev) =>
          [
            {
              expr: newExpr,
              roman: evaluated.romanResult,
              egyptian: evaluated.egyptianResult,
              arabic: evaluated.arabicResult,
            },
            ...prev.filter((h) => h.expr !== newExpr),
          ].slice(0, 8)
        );
      }
    } catch (err: any) {
      if (saveToHistory) {
        setErrorMsg(err.message || 'Erro na expressão.');
        setRomanResult('ERRO');
        setEgyptianResult('ERRO');
      }
    }
  };

  const appendSymbol = (sym: string) => {
    const isOperator = ['+', '-', '*', '/'].includes(sym);
    const nextExpr = expression + (isOperator ? ` ${sym} ` : sym);
    updateExpression(nextExpr, false);
  };

  const handleBackspace = () => {
    const trimmed = expression.trimEnd();
    if (!trimmed) return;
    // Usa Array.from para remover corretamente caracteres Unicode egípcios de 4 bytes
    const chars = Array.from(trimmed);
    chars.pop();
    updateExpression(chars.join('').trimEnd(), false);
  };

  const syncConverterFromInt = (num: number) => {
    setConvError('');
    setConvInputArabic(String(num));
    setConvInputRoman(intToRoman(num));
    setConvInputEgyptian(intToEgyptian(num));
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(PYTHON_SOURCE_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPy = () => {
    const blob = new Blob([PYTHON_SOURCE_CODE], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calculadora_romana.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  const runPySimulation = () => {
    setIsRunningPy(true);
    setPyOutput('>>> Executando simulador Python...');
    setTimeout(() => {
      try {
        const match = pyCode.match(/expressao\s*=\s*["']([^"']+)["']/);
        const expr = match ? match[1] : 'XIV + IX';
        const { arabicResult: a, romanResult: r, egyptianResult: e } = evaluateMultiExpr(expr);
        setPyOutput(
          `>>> Python 3 (Calculadora Multi-Funções)\nExpressão: ${expr}\nValor Inteiro: ${a}\nResultado Romano: ${r}\nResultado Egípcio: ${e}\n[Processo finalizado com código 0]`
        );
      } catch (err: any) {
        setPyOutput(`>>> Erro na execução:\nValueError: ${err?.message || 'Expressão inválida'}`);
      }
      setIsRunningPy(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Cabeçalho */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-serif font-black tracking-wider text-lg shadow-sm">
            Ⅹ𓎆
          </div>
          <div>
            <h1 className="text-base md:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Calculadora Multi-Funções
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-medium border border-amber-500/30">
                Romana & Egípcia
              </span>
            </h1>
          </div>
        </div>

        <nav className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 text-xs md:text-sm font-medium">
          {[
            { id: 'calc', label: 'Calculadora', icon: Calculator },
            { id: 'converter', label: 'Conversor', icon: ArrowRightLeft },
            { id: 'python', label: 'Código Python', icon: Code },
            { id: 'rules', label: 'Regras', icon: BookOpen },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === id
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </nav>

        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={handleDownloadPy}
            className="px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Baixar .py
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 lg:p-8">
        {activeTab === 'calc' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Painel da Calculadora (7 colunas) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-mono font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Visor Multi-Sistemas (Apenas Inteiros)
                </span>

                {/* Seletor de Teclado */}
                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
                  <button
                    onClick={() => setKeypadMode('romano')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      keypadMode === 'romano'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Teclado Romano
                  </button>
                  <button
                    onClick={() => setKeypadMode('egipcio')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      keypadMode === 'egipcio'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Teclado Egípcio
                  </button>
                </div>
              </div>

              {/* Visor de Resultados */}
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 md:p-5 mb-5 shadow-inner space-y-3">
                <input
                  type="text"
                  value={expression}
                  onChange={(e) => updateExpression(e.target.value, false)}
                  placeholder="Digite ou use os botões (ex: XIV + 𓎆)..."
                  className="w-full bg-transparent text-right text-slate-300 font-mono text-base md:text-lg focus:outline-none border-b border-slate-800/60 pb-2"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                    <span className="text-[11px] font-mono uppercase text-slate-400 block">
                      Resultado Romano:
                    </span>
                    <div className="font-serif text-2xl md:text-3xl font-black text-amber-400 tracking-wider truncate mt-0.5">
                      {romanResult || 'NULLA'}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                    <span className="text-[11px] font-mono uppercase text-slate-400 block">
                      Resultado Egípcio:
                    </span>
                    <div className="text-2xl md:text-3xl font-bold text-emerald-400 tracking-wider truncate mt-0.5">
                      {egyptianResult || 'NULLA'}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Valor Inteiro Equivalente:</span>
                  <span className="font-bold text-slate-200">
                    {arabicResult !== null ? `${arabicResult}` : '—'}
                  </span>
                </div>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-xs text-red-300 font-mono flex items-center gap-2">
                  <span>⚠</span> {errorMsg}
                </div>
              )}

              {/* Teclado de Algarismos e 4 Operações Básicas */}
              <div className="space-y-3">
                {keypadMode === 'romano' ? (
                  <div className="grid grid-cols-7 gap-1.5 md:gap-2">
                    {ROMAN_MAP.filter(([, s]) => s.length === 1)
                      .reverse()
                      .map(([val, sym]) => (
                        <button
                          key={sym}
                          onClick={() => appendSymbol(sym)}
                          className="py-3 bg-slate-800/90 hover:bg-slate-700 active:scale-95 border border-slate-700/80 rounded-xl font-serif text-lg font-bold text-amber-300 transition-all flex flex-col items-center justify-center"
                        >
                          <span>{sym}</span>
                          <span className="text-[10px] font-mono text-slate-400 font-normal">
                            {val}
                          </span>
                        </button>
                      ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-1.5 md:gap-2">
                    {[...EGYPTIAN_MAP].reverse().map(([val, sym, label]) => (
                      <button
                        key={sym}
                        onClick={() => appendSymbol(sym)}
                        title={label}
                        className="py-2.5 bg-slate-800/90 hover:bg-slate-700 active:scale-95 border border-slate-700/80 rounded-xl text-xl font-bold text-emerald-300 transition-all flex flex-col items-center justify-center"
                      >
                        <span>{sym}</span>
                        <span className="text-[9px] font-mono text-slate-400 font-normal">
                          {val >= 1000 ? `${val / 1000}k` : val}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* 4 Operações Básicas */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { sym: '+', label: '+ Adição' },
                    { sym: '-', label: '- Subtração' },
                    { sym: '*', label: '× Multiplicação' },
                    { sym: '/', label: '÷ Divisão Inteira' },
                  ].map(({ sym, label }) => (
                    <button
                      key={sym}
                      onClick={() => appendSymbol(sym)}
                      className="py-3.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl font-mono text-xs md:text-sm font-bold transition-all active:scale-95"
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Controles e Calcular */}
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => updateExpression('', false)}
                    className="py-3 bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/40 rounded-xl font-mono text-xs md:text-sm font-semibold transition-all active:scale-95"
                  >
                    AC (Limpar)
                  </button>
                  <button
                    onClick={handleBackspace}
                    className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl font-mono text-xs md:text-sm flex items-center justify-center gap-1 transition-all active:scale-95"
                  >
                    <Delete className="w-4 h-4" />
                    Apagar
                  </button>
                  <button
                    onClick={() => appendSymbol('NULLA')}
                    className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl font-mono text-xs font-semibold transition-all active:scale-95"
                  >
                    NULLA (0)
                  </button>
                  <button
                    onClick={() => updateExpression(expression, true)}
                    className="py-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 rounded-xl font-mono text-sm font-black shadow-lg shadow-amber-500/20 transition-all"
                  >
                    = CALCULAR
                  </button>
                </div>
              </div>

              {stepsInfo && (
                <div className="mt-5 p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Passo a passo (4 Operações Inteiros):
                  </span>
                  <p className="text-xs font-mono text-amber-300/90 break-words">{stepsInfo}</p>
                </div>
              )}
            </div>

            {/* Painel Lateral: Exemplos e Histórico (5 colunas) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center justify-between">
                  <span>Exemplos Multi-Funções</span>
                  <span className="text-[11px] text-slate-400 font-mono">Clique para testar</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { expr: 'XIV + IX', label: 'Romano: 14 + 9 = 23' },
                    { expr: '𓎆𓎆 + 𓏺𓏺𓏺𓏺', label: 'Egípcio: 20 + 4 = 24' },
                    { expr: 'C - 𓎆𓎆𓎆', label: 'Misto: 100 - 30 = 70' },
                    { expr: 'XII * V', label: 'Multiplicação: 12 × 5 = 60' },
                    { expr: '𓍢 / 𓎆', label: 'Divisão: 100 ÷ 10 = 10' },
                    { expr: 'XV / II', label: 'Divisão Inteira: 15 ÷ 2 = 7' },
                  ].map((ex) => (
                    <button
                      key={ex.expr}
                      onClick={() => updateExpression(ex.expr, true)}
                      className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-all group"
                    >
                      <div className="font-serif font-bold text-amber-300 group-hover:text-amber-200 text-sm">
                        {ex.expr}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {ex.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">Histórico de Cálculos</h3>
                  <button
                    onClick={() => setHistory([])}
                    className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Limpar
                  </button>
                </div>
                {history.length === 0 ? (
                  <div className="text-xs text-slate-500 font-mono py-4 text-center">
                    Nenhum cálculo recente
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => updateExpression(item.expr, false)}
                        className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-500/40 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div>
                          <div className="font-serif text-sm font-semibold text-slate-200">
                            {item.expr}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Inteiro: {item.arabic}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-serif text-sm font-bold text-amber-400">
                            {item.roman}
                          </div>
                          <div className="text-sm font-bold text-emerald-400">
                            {item.egyptian}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Aba Conversor Triplo */}
        {activeTab === 'converter' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-amber-400" />
                Conversor Simultâneo: Romano ↔ Egípcio ↔ Inteiro
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Altere qualquer um dos campos abaixo para converter automaticamente entre os três sistemas numéricos.
              </p>

              {convError && (
                <div className="mb-4 p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-xs text-red-300 font-mono">
                  ⚠ {convError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="block text-xs font-mono uppercase text-amber-400 mb-1.5 font-semibold">
                    Algarismo Romano
                  </label>
                  <input
                    type="text"
                    value={convInputRoman}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setConvInputRoman(val);
                      try {
                        const n = romanToInt(val);
                        setConvError('');
                        setConvInputArabic(String(n));
                        setConvInputEgyptian(intToEgyptian(n));
                      } catch (err: any) {
                        setConvError(err.message);
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 font-serif text-lg text-amber-300 uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="block text-xs font-mono uppercase text-emerald-400 mb-1.5 font-semibold">
                    Algarismo Egípcio
                  </label>
                  <input
                    type="text"
                    value={convInputEgyptian}
                    onChange={(e) => {
                      const val = e.target.value;
                      setConvInputEgyptian(val);
                      try {
                        const n = egyptianToInt(val);
                        setConvError('');
                        setConvInputArabic(String(n));
                        setConvInputRoman(intToRoman(n));
                      } catch (err: any) {
                        setConvError(err.message);
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-lg text-emerald-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5 font-semibold">
                    Inteiro Decimal
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="9999999"
                    step="1"
                    value={convInputArabic}
                    onChange={(e) => {
                      const val = e.target.value;
                      setConvInputArabic(val);
                      const num = parseInt(val, 10);
                      if (!isNaN(num)) {
                        syncConverterFromInt(num);
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 font-mono text-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Aba Código Python */}
        {activeTab === 'python' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-amber-400" />
                    Código Python (calculadora_romana.py)
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Script unificado com suporte a Algarismos Romanos, Egípcios e as 4 operações básicas inteiras.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    {copied ? 'Copiado!' : 'Copiar Código'}
                  </button>
                  <button
                    onClick={handleDownloadPy}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Baixar .py
                  </button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between pb-2 text-xs font-mono text-slate-400">
                    <span>Editor de Teste (Python):</span>
                    <button
                      onClick={runPySimulation}
                      disabled={isRunningPy}
                      className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      {isRunningPy ? 'Executando...' : 'Executar no Python'}
                    </button>
                  </div>
                  <textarea
                    value={pyCode}
                    onChange={(e) => setPyCode(e.target.value)}
                    rows={7}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-amber-300 focus:outline-none focus:border-amber-500/80 resize-none"
                  />
                </div>

                <div className="flex flex-col">
                  <div className="pb-2 text-xs font-mono text-slate-400">Console de Saída:</div>
                  <pre className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-emerald-400 whitespace-pre-wrap overflow-y-auto">
                    {pyOutput}
                  </pre>
                </div>
              </div>

              <div className="mt-6">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2 font-semibold">
                  Código Fonte Importado Diretamente de calculadora_romana.py:
                </span>
                <pre className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 md:p-5 font-mono text-xs text-slate-300 overflow-x-auto max-h-[420px] leading-relaxed">
                  {PYTHON_SOURCE_CODE}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Aba Regras */}
        {activeTab === 'rules' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  Regras dos Sistemas Numéricos e Operações
                </h2>
                <p className="text-xs text-slate-400">
                  Entenda como os números romanos e egípcios funcionam e como as 4 operações básicas inteiras são calculadas.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <h3 className="font-semibold text-amber-400 text-sm mb-2">
                    1. Algarismos Romanos (Limite: 3.999)
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Usa 7 letras: <strong>I</strong> (1), <strong>V</strong> (5), <strong>X</strong> (10),{' '}
                    <strong>L</strong> (50), <strong>C</strong> (100), <strong>D</strong> (500) e{' '}
                    <strong>M</strong> (1.000). Símbolos menores à esquerda subtraem (ex: IV = 4) e à direita somam (ex: VI = 6).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <h3 className="font-semibold text-emerald-400 text-sm mb-2">
                    2. Algarismos Egípcios (Limite: 9.999.999)
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Sistema puramente aditivo de base 10: <strong>𓏺</strong> (1 - Bastão),{' '}
                    <strong>𓎆</strong> (10 - Calcanhar), <strong>𓍢</strong> (100 - Corda),{' '}
                    <strong>𓆼</strong> (1.000 - Flor de Lótus), <strong>𓂭</strong> (10.000 - Dedo),{' '}
                    <strong>𓆐</strong> (100.000 - Girino) e <strong>𓁨</strong> (1.000.000 - Deus Heh). Cada símbolo pode se repetir até 9 vezes.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 md:col-span-2">
                  <h3 className="font-semibold text-white text-sm mb-2">
                    3. As 4 Operações Básicas com Números Inteiros
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    A calculadora trabalha exclusivamente com números inteiros e suporta <strong>Adição (+)</strong>,{' '}
                    <strong>Subtração (-)</strong>, <strong>Multiplicação (*)</strong> e{' '}
                    <strong>Divisão Inteira (/)</strong>, descartando casas decimais (ex: XV / II = VII, pois 15 ÷ 2 = 7 na divisão inteira).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        Calculadora Multi-Funções (Romana e Egípcia) · 4 Operações Básicas com Números Inteiros
      </footer>
    </div>
  );
}
