#!/usr/bin/env python3
"""
Calculadora Multi-Funções em Python (Algarismos Romanos e Egípcios)
Trabalha exclusivamente com números inteiros e as 4 operações básicas: +, -, *, /
"""

import re

ROMAN_MAP = [
    (1000, 'M'), (900, 'CM'), (500, 'D'), (400, 'CD'),
    (100, 'C'), (90, 'XC'), (50, 'L'), (40, 'XL'),
    (10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')
]
ROMAN_VALUES = {sym: val for val, sym in ROMAN_MAP if len(sym) == 1}

EGYPTIAN_MAP = [
    (1000000, '𓁨'),  # Deus Heh (1.000.000)
    (100000, '𓆐'),   # Girino (100.000)
    (10000, '𓂭'),    # Dedo apontando (10.000)
    (1000, '𓆼'),     # Flor de lótus (1.000)
    (100, '𓍢'),      # Rolo de corda (100)
    (10, '𓎆'),       # Calcanhar (10)
    (1, '𓏺'),        # Bastão (1)
]
EGYPTIAN_VALUES = {sym: val for val, sym in EGYPTIAN_MAP}


def _converter_para_simbolos(n: int, mapa: list[tuple[int, str]], limite: int) -> str:
    """Função auxiliar reutilizável que converte um inteiro positivo usando um mapa de símbolos."""
    n = int(n)
    if n == 0:
        return "NULLA"
    if n < 0:
        return f"-{_converter_para_simbolos(abs(n), mapa, limite)}"
    if n > limite:
        raise ValueError(f"Valor {n} excede o limite máximo suportado ({limite}).")

    resultado = []
    for valor, simbolo in mapa:
        while n >= valor:
            resultado.append(simbolo)
            n -= valor
    return "".join(resultado)


def roman_to_int(s: str) -> int:
    """Converte numeral romano em número inteiro."""
    s = s.strip().upper()
    if not s or s == "NULLA":
        return 0

    padrao = r"^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$"
    if not re.match(padrao, s):
        raise ValueError(f"Numeral romano inválido: '{s}'")

    total = 0
    for i in range(len(s)):
        atual = ROMAN_VALUES[s[i]]
        if i + 1 < len(s) and atual < ROMAN_VALUES[s[i + 1]]:
            total -= atual
        else:
            total += atual
    return total


def int_to_roman(n: int) -> str:
    """Converte número inteiro em numeral romano (limite: 3999)."""
    return _converter_para_simbolos(n, ROMAN_MAP, 3999)


def egyptian_to_int(s: str) -> int:
    """Converte numeral egípcio em número inteiro."""
    s = s.strip()
    if not s or s.upper() == "NULLA":
        return 0

    for char in s:
        if char not in EGYPTIAN_VALUES:
            raise ValueError(f"Símbolo egípcio inválido: '{char}'")

    for _, simbolo in EGYPTIAN_MAP:
        if s.count(simbolo) > 9:
            raise ValueError(f"O símbolo egípcio '{simbolo}' não pode se repetir mais de 9 vezes.")

    return sum(EGYPTIAN_VALUES[char] for char in s)


def int_to_egyptian(n: int) -> str:
    """Converte número inteiro em numeral egípcio (limite: 9.999.999)."""
    return _converter_para_simbolos(n, EGYPTIAN_MAP, 9999999)


def token_to_int(token: str) -> int:
    """Identifica e converte um número (Romano, Egípcio ou Inteiro) para int."""
    upper = token.upper()
    if upper == "NULLA":
        return 0
    if token.isdigit():
        return int(token)
    if all(c in EGYPTIAN_VALUES for c in token):
        return egyptian_to_int(token)
    if re.match(r"^[IVXLCDM]+$", upper):
        return roman_to_int(upper)
    raise ValueError(f"Número ou símbolo desconhecido: '{token}'")


def calc(expr: str, sistema: str = "auto") -> str:
    """
    Avalia uma expressão contendo apenas números inteiros e as 4 operações básicas (+, -, *, /).
    Suporta números romanos, egípcios e inteiros decimais.
    """
    if not expr or not expr.strip():
        return "NULLA"

    # Verifica se há caracteres fora dos permitidos (apenas números, romanos, egípcios e +, -, *, /, parênteses)
    if re.search(r"[^IVXLCDMivxlcdm𓏺𓎆𓍢𓆼𓂭𓆐𓁨0-9+\-*/()\sNULLAnulla]", expr):
        raise ValueError("Operação inválida! Use apenas números inteiros e as 4 operações básicas (+, -, *, /).")

    if "**" in expr or "//" in expr:
        raise ValueError("Use apenas os operadores básicos simples: +, -, *, /")

    tokens = re.findall(r"[𓏺𓎆𓍢𓆼𓂭𓆐𓁨]+|[IVXLCDM]+|NULLA|\d+|[+\-*/()]", expr, re.IGNORECASE)
    if not tokens:
        return "NULLA"

    eval_tokens = []
    usou_egipcio = False

    for t in tokens:
        if t in "+-*()":
            eval_tokens.append(t)
        elif t == "/":
            eval_tokens.append("//")  # Garante divisão sempre inteira
        else:
            if any(c in EGYPTIAN_VALUES for c in t):
                usou_egipcio = True
            eval_tokens.append(str(token_to_int(t)))

    eval_str = " ".join(eval_tokens)

    try:
        resultado_int = int(eval(eval_str, {"__builtins__": None}, {}))
    except ZeroDivisionError:
        raise ValueError("Erro: Divisão por zero não é permitida.")
    except Exception:
        raise ValueError("Expressão matemática mal formada.")

    if sistema == "egipcio" or (sistema == "auto" and usou_egipcio):
        return int_to_egyptian(resultado_int)
    return int_to_roman(resultado_int)


def menu():
    print("=" * 55)
    print("   CALCULADORA MULTI-FUNÇÕES: ROMANA E EGÍPCIA   ")
    print("   Operações suportadas: + , - , * , / (Inteiros)   ")
    print("=" * 55)
    print("Símbolos Egípcios: 𓏺=1, 𓎆=10, 𓍢=100, 𓆼=1000, 𓂭=10000")
    print("Exemplos: 'XIV + IX', '𓎆𓏺𓏺 + 𓎆', 'C / V'")
    print("Digite 'sair' para encerrar.\n")

    sistema_saida = "auto"
    while True:
        try:
            entrada = input(f"[{sistema_saida.upper()}] Expressão (ou 'romano'/'egipcio' para mudar saída): ").strip()
            if entrada.lower() in ("sair", "exit", "quit"):
                print("Até logo!")
                break
            if entrada.lower() in ("romano", "egipcio", "auto"):
                sistema_saida = entrada.lower()
                print(f"➔ Modo de saída alterado para: {sistema_saida.upper()}\n")
                continue
            if not entrada:
                continue

            resultado = calc(entrada, sistema_saida)
            print(f"➔ Resultado: {resultado}\n")
        except Exception as e:
            print(f"Erro: {e}\n")


if __name__ == "__main__":
    menu()
