#!/usr/bin/env python3
"""
Calculadora em Python utilizando Algarismos Romanos
Suporta: +, -, *, //, %, potências e conversão bidirecional.
"""

import re

ROMAN_MAP = [
    (1000, 'M'), (900, 'CM'), (500, 'D'), (400, 'CD'),
    (100, 'C'), (90, 'XC'), (50, 'L'), (40, 'XL'),
    (10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')
]

VALUES = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}


def roman_to_int(s: str) -> int:
    """Converte numeral romano em número inteiro decimal."""
    s = s.strip().upper()
    if not s or s == "NULLA":
        return 0

    # Validação com Regex canônica da gramática romana clássica
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
    Avalia uma expressão matemática contendo algarismos romanos.
    Exemplos:
        calc("XIV + IX") -> "XXIII"
        calc("(C - XL) / II") -> "XXX"
        calc("XII * V") -> "LX"
    """
    tokens = re.findall(r'[IVXLCDM]+|NULLA|\d+|[+\-*/%()^]', expr, re.IGNORECASE)
    eval_tokens = []

    for t in tokens:
        upper = t.upper()
        if re.match(r'^[IVXLCDM]+$', upper) or upper == 'NULLA':
            eval_tokens.append(str(roman_to_int(upper)))
        elif t == '^':
            eval_tokens.append('**')
        elif t == '/':
            eval_tokens.append('//')  # Divisão inteira
        else:
            eval_tokens.append(t)

    eval_str = " ".join(eval_tokens)

    # Execução segura sem builtins perigosos
    res = eval(eval_str, {"__builtins__": None}, {})

    return int_to_roman(int(res))


def menu():
    print("=" * 50)
    print("   CALCULADORA DE ALGARISMOS ROMANOS (PYTHON)   ")
    print("=" * 50)
    print("Exemplos: 'XIV + IX', 'C - XLVIII', 'XII * V'")
    print("Digite 'sair' a qualquer momento para encerrar.\n")

    while True:
        try:
            entrada = input("Expressão romana: ").strip()
            if entrada.lower() in ("sair", "exit", "quit"):
                print("Até logo!")
                break
            if not entrada:
                continue

            resultado = calc(entrada)
            print(f"➔ Resultado: {resultado}\n")
        except Exception as e:
            print(f"Erro: {e}\n")


if __name__ == "__main__":
    menu()
