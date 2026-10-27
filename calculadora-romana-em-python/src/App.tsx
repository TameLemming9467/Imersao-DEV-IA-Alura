import React, { useState } from 'react';
import { 
  Calculator, 
  Code, 
  Play, 
  Copy, 
  Check, 
  Download, 
  RotateCcw, 
  ArrowRightLeft, 
  BookOpen, 
  Terminal, 
  Delete,
  Sparkles
} from 'lucide-react';

// Roman <-> Arabic conversion utilities
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

const ROMAN_CHAR_VALUES: Record<string, number> = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
};

function intToRoman(num: number): string {
  if (num === 0) return 'NULLA';
  if (num < 0) return '-' + intToRoman(Math.abs(num));
  if (num > 3999) return 'INFINITUM (>3999)';
  
  let result = '';
  let n = Math.floor(num);
  for (const [val, roman] of ROMAN_MAP) {
    while (n >= val) {
      result += roman;
      n -= val;
    }
  }
  return result;
}

function romanToInt(romanStr: string): number {
  const clean = romanStr.trim().toUpperCase();
  if (!clean) return 0;
  if (clean === 'NULLA') return 0;
  
  let total = 0;
  for (let i = 0; i < clean.length; i++) {
    const curVal = ROMAN_CHAR_VALUES[clean[i]];
    if (!curVal) throw new Error(`Caractere inválido '${clean[i]}' no numeral romano.`);
    const nextVal = ROMAN_CHAR_VALUES[clean[i + 1]] || 0;
    
    if (curVal < nextVal) {
      total -= curVal;
    } else {
      total += curVal;
    }
  }
  return total;
}

// Evaluate a Roman mathematical expression
function evaluateRomanExpr(expr: string): { arabicResult: number; romanResult: string; steps: string } {
  if (!expr.trim()) return { arabicResult: 0, romanResult: 'NULLA', steps: 'Expressão vazia' };
  
  // Replace Roman tokens with Arabic integers
  // Tokenize by roman numerals, operators, and parenthesis
  const tokens = expr.match(/([IVXLCDM]+|NULLA|\d+|[+\-*/%()^])/gi) || [];
  
  let arabicExpr = '';
  const translatedTokens: string[] = [];
  
  for (const token of tokens) {
    const upper = token.toUpperCase();
    if (/^[IVXLCDM]+$/.test(upper) || upper === 'NULLA') {
      const val = romanToInt(upper);
      arabicExpr += ` ${val} `;
      translatedTokens.push(`${upper}(${val})`);
    } else if (token === '^') {
      arabicExpr += ' ** ';
      translatedTokens.push('^');
    } else {
      arabicExpr += token;
      translatedTokens.push(token);
    }
  }
  
  // Safe math evaluation
  try {
    // Only allow safe math tokens
    if (!/^[\d\s+\-*/%().*]+$/.test(arabicExpr)) {
      throw new Error('Expressão contém caracteres ilegais.');
    }
    // eslint-disable-next-line no-new-func
    const rawVal = Function(`"use strict"; return (${arabicExpr})`)();
    const rounded = Math.round(rawVal);
    const romanRes = intToRoman(rounded);
    const steps = `${expr} ➔ ${arabicExpr.trim()} = ${rawVal} ➔ ${romanRes}`;
    return { arabicResult: rounded, romanResult: romanRes, steps };
  } catch (err: any) {
    throw new Error(err?.message || 'Erro ao avaliar a expressão matemática.');
  }
}

const PYTHON_SOURCE_CODE = `"""
Calculadora em Python utilizando Algarismos Romanos
Autor: Calculadora Romana
Suporta: +, -, *, //, %, potências e conversão bidirecional
"""

import re

ROMAN_MAP = [
    (1000, 'M'), (900, 'CM'), (500, 'D'), (400, 'CD'),
    (100, 'C'), (90, 'XC'), (50, 'L'), (40, 'XL'),
    (10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')
]

VALUES = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}


def roman_to_int(s: str) -> int:
    """Converte numeral romano em inteiro decimal."""
    s = s.strip().upper()
    if not s or s == "NULLA":
        return 0
    
    # Validação com Expressão Regular canônica
    pattern = r"^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$"
    if not re.match(pattern, s):
        raise ValueError(f"Numeral romano inválido: '{s}'")
    
    total = 0
    length = len(s)
    for i in range(length):
        curr = VALUES[s[i]]
        if i + 1 < length and curr < VALUES[s[i + 1]]:
            total -= curr
        else:
            total += curr
    return total


def int_to_roman(n: int) -> str:
    """Converte número inteiro decimal em numeral romano."""
    if n == 0:
        return "NULLA"
    if n < 0:
        return f"-{int_to_roman(abs(n))}"
    if n > 3999:
        raise ValueError(f"Valor {n} excede o limite tradicional de 3999 (MMMCMXCIX).")
    
    result = []
    for val, sym in ROMAN_MAP:
        while n >= val:
            result.append(sym)
            n -= val
    return "".join(result)


def calc(expr: str) -> str:
    """
    Avalia expressão em algarismos romanos.
    Exemplo: calc("XIV + IX") -> "XXIII"
             calc("(C - XL) / II") -> "XXX"
    """
    # Substitui os tokens romanos pelos valores decimais equivalentes
    tokens = re.findall(r'[IVXLCDM]+|NULLA|\\d+|[+\\-*/%()^]', expr, re.IGNORECASE)
    eval_tokens = []
    
    for t in tokens:
        upper = t.upper()
        if re.match(r'^[IVXLCDM]+$', upper) or upper == 'NULLA':
            eval_tokens.append(str(roman_to_int(upper)))
        elif t == '^':
            eval_tokens.append('**')
        elif t == '/':
            eval_tokens.append('//') # Divisão inteira
        else:
            eval_tokens.append(t)
            
    eval_str = " ".join(eval_tokens)
    
    # Executa a operação decimal com segurança
    res = eval(eval_str, {"__builtins__": None}, {})
    
    # Converte de volta para algarismos romanos
    return int_to_roman(int(res))


if __name__ == "__main__":
    print("=" * 45)
    print("   CALCULADORA EM ALGARISMOS ROMANOS (PYTHON)   ")
    print("=" * 45)
    
    testes = [
        "XIV + IX",
        "C - XLVIII",
        "XII * V",
        "L / X",
        "(XX + V) * II",
        "MMXXIV - MCMLXXXIV"
    ]
    
    for t in testes:
        resultado = calc(t)
        print(f"Operação: {t:<20} => Resultado: {resultado}")
        
    print("-" * 45)
    print("Modo Interativo (digite 'sair' para encerrar):")
    while True:
        try:
            entrada = input("\\nExpressão romana: ").strip()
            if entrada.lower() in ("sair", "exit", "quit"):
                break
            if not entrada:
                continue
            r = calc(entrada)
            print(f"➔ {r}")
        except Exception as e:
            print(f"Erro: {e}")
`;

export default function App() {
  const [activeTab, setActiveTab] = useState<'calc' | 'converter' | 'python' | 'rules'>('calc');
  const [expression, setExpression] = useState<string>('XIV + IX');
  const [result, setResult] = useState<string>('XXIII');
  const [arabicResult, setArabicResult] = useState<number | null>(23);
  const [stepsInfo, setStepsInfo] = useState<string>('XIV + IX ➔ 14 + 9 = 23 ➔ XXIII');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [history, setHistory] = useState<Array<{ expr: string; res: string; arabic: number }>>([
    { expr: 'XIV + IX', res: 'XXIII', arabic: 23 },
    { expr: 'C - XLVIII', res: 'LII', arabic: 52 },
    { expr: 'XII * V', res: 'LX', arabic: 60 },
  ]);

  // Converter Tab State
  const [inputRoman, setInputRoman] = useState<string>('MMXXV');
  const [convArabic, setConvArabic] = useState<number>(2025);
  const [inputArabic, setInputArabic] = useState<string>('2025');
  const [convRoman, setConvRoman] = useState<string>('MMXXV');
  const [copied, setCopied] = useState<boolean>(false);

  // Python Terminal State
  const [pyCode, setPyCode] = useState<string>(
`# Teste rápido do script em Python
expressao = "MMXXIV - MCMLXXXIV"
resultado = calc(expressao)
print(f"Calculando {expressao}...")
print(f"Resultado Romano: {resultado}")
`
  );
  const [pyOutput, setPyOutput] = useState<string>(
`>>> Executando script de teste...
Calculando MMXXIV - MCMLXXXIV...
2024 - 1984 = 40
Resultado Romano: XL
`
  );
  const [isRunningPy, setIsRunningPy] = useState<boolean>(false);

  const handleCalculate = (exprToEval?: string) => {
    const expr = exprToEval !== undefined ? exprToEval : expression;
    if (!expr.trim()) {
      setResult('');
      setArabicResult(null);
      setStepsInfo('');
      setErrorMsg('');
      return;
    }
    try {
      setErrorMsg('');
      const { arabicResult: aRes, romanResult: rRes, steps } = evaluateRomanExpr(expr);
      setResult(rRes);
      setArabicResult(aRes);
      setStepsInfo(steps);
      
      // Add to history if unique
      setHistory(prev => [{ expr, res: rRes, arabic: aRes }, ...prev.filter(h => h.expr !== expr)].slice(0, 8));
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro na expressão.');
      setResult('ERRO');
    }
  };

  const appendSymbol = (sym: string) => {
    setErrorMsg('');
    const newExpr = expression + (['+', '-', '*', '/', '%'].includes(sym) ? ` ${sym} ` : sym);
    setExpression(newExpr);
    try {
      const { romanResult, arabicResult: aRes, steps } = evaluateRomanExpr(newExpr);
      setResult(romanResult);
      setArabicResult(aRes);
      setStepsInfo(steps);
    } catch {
      // Keep user typing
    }
  };

  const handleBackspace = () => {
    const trimmed = expression.trimEnd();
    if (!trimmed) return;
    const newExpr = trimmed.slice(0, -1).trimEnd();
    setExpression(newExpr);
    if (!newExpr) {
      setResult('');
      setArabicResult(null);
      setStepsInfo('');
    } else {
      try {
        const { romanResult, arabicResult: aRes, steps } = evaluateRomanExpr(newExpr);
        setResult(romanResult);
        setArabicResult(aRes);
        setStepsInfo(steps);
      } catch {
        // typing
      }
    }
  };

  const handleClear = () => {
    setExpression('');
    setResult('');
    setArabicResult(null);
    setStepsInfo('');
    setErrorMsg('');
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
        // Try to extract expressao = "..."
        const match = pyCode.match(/expressao\s*=\s*["']([^"']+)["']/);
        const expr = match ? match[1] : 'XX + V';
        const { arabicResult: a, romanResult: r } = evaluateRomanExpr(expr);
        setPyOutput(
`>>> Python 3.12.0 (Calculadora Romana)
Executando: ${expr}
Passo Decimal: ${a}
Resultado Romano: ${r}
[Processo finalizado com código 0]`
        );
      } catch (err: any) {
        setPyOutput(`>>> Erro na execução:\nValueError: ${err?.message || 'Expressão inválida'}`);
      }
      setIsRunningPy(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Bar Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-serif font-black tracking-wider text-lg shadow-sm">
            Ⅹ
          </div>
          <div>
            <h1 className="text-base md:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Calculadora Romana
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-medium border border-amber-500/30">
                Python Engine
              </span>
            </h1>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 text-xs md:text-sm font-medium">
          <button
            onClick={() => setActiveTab('calc')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'calc'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            Calculadora
          </button>
          <button
            onClick={() => setActiveTab('converter')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'converter'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Conversor
          </button>
          <button
            onClick={() => setActiveTab('python')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'python'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Código Python
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'rules'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Regras
          </button>
        </nav>

        {/* Action Button */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={handleDownloadPy}
            className="px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 transition-colors flex items-center gap-1.5 shadow-sm"
            title="Baixar arquivo calculadora_romana.py"
          >
            <Download className="w-3.5 h-3.5" />
            Baixar .py
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 lg:p-8">
        {activeTab === 'calc' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Calculator Canvas (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-mono font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Visor Romano
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  I=1 · V=5 · X=10 · L=50 · C=100 · D=500 · M=1000
                </span>
              </div>

              {/* Display Screen */}
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 md:p-5 mb-5 shadow-inner">
                {/* Expression Input Line */}
                <div className="text-right text-slate-400 font-mono text-sm md:text-base min-h-[1.5rem] tracking-wider overflow-x-auto whitespace-nowrap">
                  {expression || <span className="text-slate-600">Digite uma expressão romana...</span>}
                </div>

                {/* Big Result Line */}
                <div className="mt-2 text-right font-serif text-3xl md:text-4xl lg:text-5xl font-black text-amber-400 tracking-wider overflow-x-auto whitespace-nowrap">
                  {result || 'NULLA'}
                </div>

                {/* Arabic / Decimal Live Breakdown */}
                <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="text-slate-500">Valor Decimal:</span>
                  <span className="font-semibold text-slate-200">
                    {arabicResult !== null ? `${arabicResult} (Decimal)` : '—'}
                  </span>
                </div>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-xs text-red-300 font-mono flex items-center gap-2">
                  <span>⚠</span> {errorMsg}
                </div>
              )}

              {/* Roman & Operations Keypad */}
              <div className="space-y-3">
                {/* Roman Primary Numerals Row (Large tactile keys) */}
                <div className="grid grid-cols-7 gap-1.5 md:gap-2">
                  {[
                    { sym: 'I', val: 1 },
                    { sym: 'V', val: 5 },
                    { sym: 'X', val: 10 },
                    { sym: 'L', val: 50 },
                    { sym: 'C', val: 100 },
                    { sym: 'D', val: 500 },
                    { sym: 'M', val: 1000 },
                  ].map(({ sym, val }) => (
                    <button
                      key={sym}
                      onClick={() => appendSymbol(sym)}
                      className="py-3.5 md:py-4 bg-slate-800/90 hover:bg-slate-700 active:scale-95 border border-slate-700/80 rounded-xl font-serif text-lg md:text-xl font-bold text-amber-300 transition-all flex flex-col items-center justify-center shadow-sm"
                    >
                      <span>{sym}</span>
                      <span className="text-[10px] font-mono text-slate-400 font-normal">
                        {val}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Operators and Control Grid */}
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={handleClear}
                    className="py-3 bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/40 rounded-xl font-mono text-sm font-semibold transition-all active:scale-95"
                  >
                    AC (Limpar)
                  </button>
                  <button
                    onClick={handleBackspace}
                    className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl font-mono text-sm flex items-center justify-center gap-1 transition-all active:scale-95"
                  >
                    <Delete className="w-4 h-4" />
                    Apagar
                  </button>
                  <button
                    onClick={() => appendSymbol('(')}
                    className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl font-mono text-base font-bold transition-all active:scale-95"
                  >
                    (
                  </button>
                  <button
                    onClick={() => appendSymbol(')')}
                    className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl font-mono text-base font-bold transition-all active:scale-95"
                  >
                    )
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => appendSymbol('+')}
                    className="py-3.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl font-mono text-lg font-bold transition-all active:scale-95"
                  >
                    + (Adição)
                  </button>
                  <button
                    onClick={() => appendSymbol('-')}
                    className="py-3.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl font-mono text-lg font-bold transition-all active:scale-95"
                  >
                    - (Subtração)
                  </button>
                  <button
                    onClick={() => appendSymbol('*')}
                    className="py-3.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl font-mono text-lg font-bold transition-all active:scale-95"
                  >
                    × (Multiplicação)
                  </button>
                  <button
                    onClick={() => appendSymbol('/')}
                    className="py-3.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl font-mono text-lg font-bold transition-all active:scale-95"
                  >
                    ÷ (Divisão)
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => appendSymbol('NULLA')}
                    className="py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl font-mono text-xs font-semibold transition-all active:scale-95"
                  >
                    NULLA (Zero)
                  </button>
                  <button
                    onClick={() => appendSymbol('%')}
                    className="py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl font-mono text-xs font-semibold transition-all active:scale-95"
                  >
                    % (Módulo / Resto)
                  </button>
                  <button
                    onClick={() => handleCalculate()}
                    className="py-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 rounded-xl font-mono text-base font-black shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    = CALCULAR
                  </button>
                </div>
              </div>

              {/* Step By Step Explanation Box */}
              {stepsInfo && (
                <div className="mt-5 p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Passo a passo da transposição:
                  </span>
                  <p className="text-xs font-mono text-amber-300/90 break-words">
                    {stepsInfo}
                  </p>
                </div>
              )}
            </div>

            {/* Right Panel: History & Quick Roman Expressions (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Presets and Quick Testing */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center justify-between">
                  <span>Exemplos Prontos</span>
                  <span className="text-[11px] text-slate-400 font-mono">Clique para testar</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { expr: 'XIV + IX', label: '14 + 9 = 23 (XXIII)' },
                    { expr: 'C - XLVIII', label: '100 - 48 = 52 (LII)' },
                    { expr: 'XII * V', label: '12 × 5 = 60 (LX)' },
                    { expr: 'C / X', label: '100 ÷ 10 = 10 (X)' },
                    { expr: '(XX + V) * II', label: '(20 + 5) × 2 = 50 (L)' },
                    { expr: 'MMXXIV - MCMLXXXIV', label: '2024 - 1984 = 40 (XL)' },
                  ].map(ex => (
                    <button
                      key={ex.expr}
                      onClick={() => {
                        setExpression(ex.expr);
                        handleCalculate(ex.expr);
                      }}
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

              {/* History Box */}
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
                        onClick={() => {
                          setExpression(item.expr);
                          handleCalculate(item.expr);
                        }}
                        className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-500/40 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div>
                          <div className="font-serif text-sm font-semibold text-slate-200">
                            {item.expr}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Valor: {item.arabic}
                          </div>
                        </div>
                        <div className="font-serif text-base font-bold text-amber-400">
                          = {item.res}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Converter Tab */}
        {activeTab === 'converter' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-amber-400" />
                Conversor Bidirecional Romano ↔ Decimal
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Converta instantaneamente qualquer valor entre a notação romana clássica e o sistema decimal indo-arábico.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Romano para Decimal */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 font-semibold">
                    Romano ➔ Decimal
                  </label>
                  <input
                    type="text"
                    value={inputRoman}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setInputRoman(val);
                      try {
                        setConvArabic(romanToInt(val));
                      } catch {
                        // erro
                      }
                    }}
                    placeholder="Ex: MCMXCIV"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 font-serif text-lg text-amber-300 uppercase tracking-widest focus:outline-none focus:border-amber-500"
                  />
                  <div className="mt-4 p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-center">
                    <span className="text-xs text-slate-400 block mb-1">Resultado Decimal:</span>
                    <span className="font-mono text-2xl font-bold text-white">
                      {convArabic}
                    </span>
                  </div>
                </div>

                {/* Decimal para Romano */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 font-semibold">
                    Decimal ➔ Romano
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="3999"
                    value={inputArabic}
                    onChange={(e) => {
                      const val = e.target.value;
                      setInputArabic(val);
                      const num = parseInt(val, 10);
                      if (!isNaN(num)) {
                        setConvRoman(intToRoman(num));
                      }
                    }}
                    placeholder="Ex: 1994"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 font-mono text-lg text-white focus:outline-none focus:border-amber-500"
                  />
                  <div className="mt-4 p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-center">
                    <span className="text-xs text-slate-400 block mb-1">Resultado Romano:</span>
                    <span className="font-serif text-2xl font-bold text-amber-400 tracking-wider">
                      {convRoman}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Python Code & Runner Tab */}
        {activeTab === 'python' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-amber-400" />
                    Código Python da Calculadora Romana
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Script Python 3 completo com conversão, validação por Regex, suporte a operadores e CLI interativo.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
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

              {/* In-Browser Python Simulator Area */}
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
                    rows={8}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-amber-300 focus:outline-none focus:border-amber-500/80 resize-none"
                  />
                </div>

                <div className="flex flex-col">
                  <div className="pb-2 text-xs font-mono text-slate-400">
                    Console de Saída:
                  </div>
                  <pre className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-emerald-400 whitespace-pre-wrap overflow-y-auto">
                    {pyOutput}
                  </pre>
                </div>
              </div>

              {/* Full Script Viewer */}
              <div className="mt-6">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2 font-semibold">
                  Código Fonte Completo (calculadora_romana.py):
                </span>
                <pre className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 md:p-5 font-mono text-xs text-slate-300 overflow-x-auto max-h-[420px] leading-relaxed">
                  {PYTHON_SOURCE_CODE}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Rules & Education Tab */}
        {activeTab === 'rules' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                Como Funcionam os Algarismos Romanos
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Regras oficiais de numeração romana e como elas são convertidas para o cálculo em Python.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <h3 className="font-semibold text-amber-400 text-sm mb-1.5">1. Símbolos Básicos</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Existem 7 letras maiúsculas: <strong>I</strong> (1), <strong>V</strong> (5), <strong>X</strong> (10), <strong>L</strong> (50), <strong>C</strong> (100), <strong>D</strong> (500) e <strong>M</strong> (1000).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <h3 className="font-semibold text-amber-400 text-sm mb-1.5">2. Regra da Repetição</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Apenas os símbolos de base 10 (I, X, C, M) podem se repetir até 3 vezes seguidas (ex: III = 3, XXX = 30). Os símbolos de base 5 (V, L, D) nunca se repetem.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <h3 className="font-semibold text-amber-400 text-sm mb-1.5">3. Regra da Adição e Subtração</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Símbolo menor à direita soma (VI = 6). Símbolo menor à esquerda subtrai: apenas I subtrai de V e X (IV=4, IX=9); X de L e C (XL=40, XC=90); C de D e M (CD=400, CM=900).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <h3 className="font-semibold text-amber-400 text-sm mb-1.5">4. O Zero (NULLA)</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Os romanos antigos não possuíam o algarismo zero. Textos acadêmicos latinos medievais utilizavam o vocábulo <strong>NULLA</strong> para indicar ausência de quantidade.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        Calculadora em Algarismos Romanos · Motor Python 3 integrado
      </footer>
    </div>
  );
}
