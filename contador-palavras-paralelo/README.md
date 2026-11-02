# Contador de Palavras em Paralelo (pwordcount)

> Projeto de grupo · Sistemas Operativos · LTI, FCUL · 2023/2024
>
> **Stack:** Python · `multiprocessing` (processos, `Manager`, `Lock`, `Value`)

Conta palavras em vários ficheiros, distribuindo-os por *n* processos. Um processo dedicado emite resultados parciais a intervalos regulares.

```
./pwordcount [-m t|u|o] [-p n] [-i s] [-l log] ficheiro1 [ficheiro2 ...]
```
| Opção | Significado |
|-------|-------------|
| `-m t` | total de palavras (por omissão) |
| `-m u` | total de palavras únicas |
| `-m o` | número de ocorrências de cada palavra |
| `-p n` | número de processos (nível de paralelização) |
| `-i s` | intervalo, em segundos, entre resultados parciais |
| `-l f` | escreve os resultados parciais no ficheiro `f` em vez do stdout |

Cada linha de resultados parciais tem o formato: `data hora  tempo_decorrido_ms  palavras_contadas  ficheiros_processados  ficheiros_por_processar`.

```bash
./pwordcount -m t -p 2 -i 1 exemplo.txt exemplo.txt
```

## Revisão para o portefólio
A versão entregue tinha várias limitações, uma delas assinalada pelo próprio grupo ("não foi possível correr o -i do modo correto"). Corrigi-as mantendo a mesma estrutura de funções:
- `-p` era ignorado (criava sempre um processo por ficheiro). Agora os ficheiros são repartidos por `p` processos.
- O contador de ficheiros processados era incrementado pelo processo dos resultados parciais, não pelos trabalhadores. Por isso os valores parciais estavam errados e o programa podia não terminar.
- No fim, o programa voltava a chamar o ciclo de resultados parciais, o que o bloqueava.
- `-l` escrevia só uma linha no fim. Agora recebe todos os resultados parciais.
- As palavras vazias (ex.: pontuação isolada) deixaram de ser contadas.
