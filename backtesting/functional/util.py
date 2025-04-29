def is_sorted(x: list, descending: bool=False) -> bool:
    if descending:
        return all(x[i] >= x[i+1] for i in range(len(x)-1))
    
    # ascending
    return all(x[i] <= x[i+1] for i in range(len(x)-1))
