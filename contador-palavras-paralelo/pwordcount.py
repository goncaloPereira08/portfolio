import sys
import argparse
import multiprocessing
import re
import time
import datetime


def count_words_in_file(file_path, mode):
    file_word_count = {}
    with open(file_path, 'r', encoding="utf-8", errors="replace") as file:
        for line in file:
            for word in line.split():
                word = re.sub(r'[^\w\s]', '', word)
                if not word:
                    continue
                if mode == 'u':
                    file_word_count[word] = 1
                else:  # 't' e 'o'
                    file_word_count[word] = file_word_count.get(word, 0) + 1
    return file_word_count


def process_files(file_paths, mode, results, lock, processed_files):
    """Processa um subconjunto de ficheiros e junta os resultados ao dicionário partilhado."""
    for file_path in file_paths:
        file_word_count = count_words_in_file(file_path, mode)
        with lock:
            for word, count in file_word_count.items():
                if mode == 'u':
                    results[word] = 1
                else:
                    results[word] = results.get(word, 0) + count
            processed_files.value += 1


def format_partial(start_time, results, processed_files, total_files):
    """Linha de resultados parciais: data, tempo decorrido (ms), palavras contadas,
    ficheiros processados e ficheiros por processar."""
    time_elapsed_ms = int((time.time() - start_time) * 1000)
    total_words_counted = sum(results.values())
    current_time = datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S")
    done = processed_files.value
    return f"{current_time} {time_elapsed_ms} {total_words_counted} {done} {total_files - done}"


def emit_partial_results(interval, start_time, results, processed_files, total_files, log_path):
    """Emite resultados parciais a cada `interval` segundos para stdout ou para o ficheiro de log."""
    out = open(log_path, 'w', encoding="utf-8") if log_path else sys.stdout
    try:
        while True:
            out.write(format_partial(start_time, results, processed_files, total_files) + "\n")
            out.flush()
            if processed_files.value >= total_files:
                break
            time.sleep(interval)
    finally:
        if log_path:
            out.close()


def split_files(files, n):
    """Divide a lista de ficheiros em n grupos tão equilibrados quanto possível."""
    return [files[i::n] for i in range(n)]


def main(argv):
    parser = argparse.ArgumentParser()
    parser.add_argument('-m', choices=['t', 'u', 'o'], default='t')
    parser.add_argument('-p', type=int, default=1)
    parser.add_argument('-i', type=int, default=3)
    parser.add_argument('-l', type=str)
    parser.add_argument('files', nargs='+')
    args = parser.parse_args(argv)

    if args.p < 1:
        print("Erro: Nível de paralelização incorreto, deve ser maior que 0.")
        sys.exit(1)
    if args.i < 1:
        print("Erro: O intervalo de resultados parciais deve ser maior que 0.")
        sys.exit(1)

    start_time = time.time()
    files = args.files
    level_of_parallelism = min(args.p, len(files))

    manager = multiprocessing.Manager()
    results = manager.dict()
    lock = multiprocessing.Lock()
    processed_files = multiprocessing.Value('i', 0)

    partial_results_process = multiprocessing.Process(
        target=emit_partial_results,
        args=(args.i, start_time, results, processed_files, len(files), args.l)
    )
    partial_results_process.start()

    processes = [
        multiprocessing.Process(target=process_files,
                                args=(group, args.m, results, lock, processed_files))
        for group in split_files(files, level_of_parallelism)
    ]
    for process in processes:
        process.start()
    for process in processes:
        process.join()
    partial_results_process.join()

    if args.m == 't':
        print("Total de palavras:", sum(results.values()))
    elif args.m == 'u':
        print("Total de palavras únicas:", len(results))
    elif args.m == 'o':
        for word, count in sorted(results.items(), key=lambda kv: (-kv[1], kv[0])):
            print(f"Palavra: {word}, contagem: {count}")


if __name__ == "__main__":
    main(sys.argv[1:])
