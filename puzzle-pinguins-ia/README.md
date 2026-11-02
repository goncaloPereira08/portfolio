# Puzzle dos Pinguins com IA (Penguins Pairs)

> Projeto de grupo · Sistemas Inteligentes · LTI, FCUL · 2024/2025
>
> **Stack:** Python · algoritmos de procura (A*, procura gulosa) · problemas de satisfação de restrições

Puzzle numa grelha gelada: cada pinguim desliza numa direção até bater num obstáculo (`##`) ou noutro pinguim. Quando dois pinguins se encontram, formam um par e saem do tabuleiro. A água (`()`) não pode ser atravessada. O objetivo é emparelhar todos os pinguins.

| Ficheiro | Conteúdo |
|----------|----------|
| [`penguins_pairs_procura.py`](penguins_pairs_procura.py) | Formulação como problema de procura (estados, ações, `result`, `goal_test`) e três heurísticas: `halfPenguins`, `Npairings` e `highestPairings` |
| [`penguins_csp.py`](penguins_csp.py) | Formulação como CSP: cada pinguim é uma variável, o domínio são os pinguins com quem se pode emparelhar diretamente e a restrição binária garante emparelhamentos mútuos |

**Dependências:** os ficheiros usam os módulos `searchPlus` e `csp` fornecidos na unidade curricular, baseados no [aima-python](https://github.com/aimacode/aima-python). Para os executar, coloca esses módulos na mesma pasta.
