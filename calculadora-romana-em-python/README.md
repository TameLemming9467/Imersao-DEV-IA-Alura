# Calculadora em Python com Algarismos Romanos

Aplicação interativa e script em Python 3 para cálculos matemáticos utilizando algarismos romanos (`I`, `V`, `X`, `L`, `C`, `D`, `M`).

## Conteúdo do Repositório

- `calculadora_romana.py`: Script Python executável em linha de comando (CLI) ou importável como módulo.
- Interface Web Interativa (React + TypeScript + Tailwind): Interface gráfica para testes em tempo real, conversor bidirecional e visualização de código.

## Executando o Script Python no Terminal

Requisitos: Python 3.8+ instalado.

```bash
# Executar diretamente
python3 calculadora_romana.py
```

### Exemplo de Uso em Código:

```python
from calculadora_romana import calc, roman_to_int, int_to_roman

print(calc("XIV + IX"))        # Saída: XXIII
print(calc("C - XLVIII"))      # Saída: LII
print(calc("XII * V"))         # Saída: LX
print(calc("(MMXXIV - 24)"))   # Saída: MM
```

## Como Commitar no Git

```bash
# 1. Inicializar repositório (caso ainda não esteja inicializado)
git init

# 2. Adicionar arquivos
git add .

# 3. Criar commit
git commit -m "feat: calculadora em python com algarismos romanos"

# 4. Vincular ao seu GitHub e enviar
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/calculadora-romana.git
git push -u origin main
```
