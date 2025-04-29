from datetime import datetime
import re
from matplotlib import pyplot as plt
import numpy as np
import pandas as pd
import pandas_ta as ta
from dfs_prepare import df_1d, path
from functional.dataframes import print_df, print_all_rows_df
from pandas_ta_custom_indicators import custom_find_peaks, marubozu_indicator, set_columns_diff_aligned, set_columns_aligned, gaussian_moving_average



# ----------------------------------------------
# 1D
# ----------------------------------------------


# to csv
if 0:
    output_filename = f"{path}/df_1d.csv"
    timestamp = datetime.now().strftime("%d-%m-%Y_%H-%M-%S")
    match = re.search(r"\.\w+$", output_filename)
    file_extension = match.group()
    output_filename = output_filename.replace(file_extension, f"_{timestamp}{file_extension}")

    df_1d.to_csv(output_filename)  
    print(f"exported: [{output_filename}]")
    exit()
    




df_1d['open_close_change'] = df_1d['close'] - df_1d['open']
df_1d['open_close_change_pct'] = ((df_1d['close'] - df_1d['open']) / df_1d['open']) * 100
df_1d['direction'] = np.where(df_1d['open_close_change_pct'] > 0, 'u', 'd')

df_1d['high_low_change'] = df_1d['high'] - df_1d['low']
df_1d['high_low_change_sign'] = np.where(df_1d['open_close_change'] > 0, df_1d['high_low_change'], -df_1d['high_low_change'])

df_1d['true_range'] = ta.true_range(df_1d['high'], df_1d['low'], df_1d['close'])
df_1d['true_range_sign'] = np.where(df_1d['open_close_change'] > 0, df_1d['true_range'], -df_1d['true_range'])


marubozu_indicator(df_1d, threshold=0.25)

print_df(df_1d)


total_rows = len(df_1d)
positive_count = (df_1d['open_close_change_pct'] >= 0).sum()
negative_count = (df_1d['open_close_change_pct'] < 0).sum()
max_value = df_1d['open_close_change_pct'].max()
min_value = df_1d['open_close_change_pct'].min()
mean_value = df_1d['open_close_change_pct'].mean()

print(f"total_rows: {total_rows}, 100 %")
print(f"positive_count: {positive_count}, {round(100*positive_count/total_rows, 2)} %, max_value: {max_value}")
print(f"negative_count: {negative_count}, {round(100*negative_count/total_rows, 2)} %, min_value: {min_value}")
print(f"mean_value: {mean_value}")
print(f"")


# plot
fig, ax = plt.subplots()
# ax.plot(df_1d.index.tolist(), df_1d["open_close_change_pct"], label="[D] open_close_change_pct")
# column_name="open_close_change_pct"
# column_name="true_range"
# ax.bar(df_1d.index.tolist(), df_1d[column_name], label=f"[D] {column_name}", alpha=0.50)

if 0:
    column_name="true_range_sign"
    ax.bar(df_1d.index.tolist(), df_1d[column_name], label=f"[D] {column_name}", alpha=0.50)

column_name="high_low_change_sign"
ax.bar(df_1d.index.tolist(), df_1d[column_name], label=f"[D] {column_name}", alpha=0.50)

column_name="open_close_change"
ax.bar(df_1d.index.tolist(), df_1d[column_name], label=f"[D] {column_name}", alpha=0.50)

column_name="marubozu_type"

filtered_df = df_1d[df_1d[f'{column_name}']==1]
ax.plot(filtered_df.index.tolist(), filtered_df[f'{column_name}']-1, label=f"[D] {column_name} (up)", marker='o', color='g', linestyle='None')

filtered_df = df_1d[df_1d[f'{column_name}']==-1]
ax.plot(filtered_df.index.tolist(), filtered_df[f'{column_name}']+1, label=f"[D] {column_name} (down)", marker='o', color='r', linestyle='None')

marubozu_count = df_1d['marubozu'].sum()
print(f"marubozu_count: {marubozu_count}, {round(100*marubozu_count/total_rows, 2)} %")



legend = ax.legend(loc='best')
legend.get_frame().set_alpha(0)  # Set transparency level (0.0 = fully transparent, 1.0 = fully opaque)

plt.grid()
plt.show()

