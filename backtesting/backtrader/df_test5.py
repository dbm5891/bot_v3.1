
import operator
import numpy as np

selected_bars_values=[1,2,3,0,4,4,5,6,5,4,4,3,]
ref_value=1
values = np.array(selected_bars_values)
filtered_values: np.ndarray = operator.gt(values, ref_value)
print(values)
print(filtered_values)
print(filtered_values.sum()/len(values))