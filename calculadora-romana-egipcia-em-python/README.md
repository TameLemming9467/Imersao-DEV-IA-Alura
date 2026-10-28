# Calculadora Multi-Funções: Algarismos Romanos e Egípcios

Aplicação interativa e script em Python 3 para cálculos matemáticos com números inteiros e as **4 operações básicas** (`+`, `-`, `*`, `/`), suportando **Algarismos Romanos** (`I`, `V`, `X`, `L`, `C`, `D`, `M`) e **Algarismos Egípcios** (`𓏺`, `𓎆`, `𓍢`, `𓆼`, `𓂭`, `𓆐`, `𓁨`).

## Conteúdo do Repositório

- `calculadora_romana.py`: Script Python executável em linha de comando (CLI) ou importável como módulo.
- Interface Web Interativa (`src/App.tsx`): Calculadora visual multi-funções, conversor simultâneo (Romano ↔ Egípcio ↔ Inteiro) e simulador de código.

## Executando o Script Python no Terminal

Requisitos: Python 3.8+ instalado.

```bash
python calculadora_romana.py
```

### Exemplo de Uso em Código:

```python
from calculadora_romana import calc, roman_to_int, int_to_roman, egyptian_to_int, int_to_egyptian

print(calc("XIV + IX"))                  # Saída: XXIII
print(calc("𓎆𓏺𓏺 + 𓎆"))                   # Saída: 𓎆𓎆𓏺𓏺 (12 + 10 = 22)
print(calc("XII * V", sistema="egipcio")) # Saída: 𓎆𓎆𓎆𓎆𓎆𓎆 (60)
print(calc("XV / II"))                   # Saída: VII (divisão inteira: 15 // 2 = 7)
```
