def find_sequences(binary_list):
    sequences = []
    n = len(binary_list)
    
    # Start of the first sequence
    group = 0
    start = 0
    
    # first item
    print(f"[index] value, group, [start:end]")
    print(f"[{0}] {binary_list[0]}, {group}, [{start}:{start}]")
    for i in range(1, n):
        
        if binary_list[i] != binary_list[i - 1]:
            # Add the current sequence to the list
            sequences.append((binary_list[start], start, i - 1))
            # Update the start of the next sequence
            start = i
            group += 1
    
        print(f"[{i}] {binary_list[i]}, {group}, [{start}:{i}]")


    # Add the last sequence
    sequences.append((binary_list[start], start, n - 1))
    
    return sequences

# Example list of 0s and 1s
binary_list = [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0]

# Find and print sequences
sequences = find_sequences(binary_list)
for value, start, end in sequences:
    print(f"Value: {value}, Start Index: {start}, End Index: {end}")
