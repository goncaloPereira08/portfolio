from csp import *

def CSP_pinguinsSaltadores(puzzle):
    # Parse do puzzle
    lines = puzzle.strip().split('\n')
    grid = []
    penguins = {}
    for row_idx, line in enumerate(lines):
        cells = line.strip().split()
        grid_row = []
        for col_idx, cell in enumerate(cells):
            grid_row.append(cell)
            if cell.isdigit() and len(cell) == 2:
                penguins[cell] = (row_idx, col_idx)
        grid.append(grid_row)
    
    variables = sorted(penguins.keys())
    domains = {p: [] for p in variables}
    
    # Função para verificar se há caminho válido entre dois pinguins
    def is_valid_path(start, end):
        r1, c1 = start
        r2, c2 = end
        if r1 != r2 and c1 != c2:
            return False
        dr = 0 if r1 == r2 else (1 if r2 > r1 else -1)
        dc = 0 if c1 == c2 else (1 if c2 > c1 else -1)
        cr, cc = r1 + dr, c1 + dc
        while (cr, cc) != (r2, c2):
            if grid[cr][cc] in ('##', '()'):
                return False
            cr += dr
            cc += dc
        return True

    # Construção dos domínios
    for i, p in enumerate(variables):
        for j, q in enumerate(variables):
            if p != q and is_valid_path(penguins[p], penguins[q]):
                domains[p].append(q)
        domains[p].sort()
    
    neighbors = {v: domains[v][:] for v in variables}
    
    # Restrição binária: emparelhamento mútuo
    def restricao(A, a, B, b):
        return (a == B) == (b == A)
    
    return CSP(variables, domains, neighbors, restricao)

