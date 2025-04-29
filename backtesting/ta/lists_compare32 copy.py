from lists_compare_func import *
# from lists_compare_func_temp import list_tuple_to_csv


# ----------------------------------------------
# main


df=read_csv()
lists_same_time=[]
similar_lists=[]


tested_symbol="AAPL"
tested_time = datetime(year=2022, month=5, day=11, hour=19, minute=5)


tested_row=get_row(df, tested_symbol, tested_time)
# set attributes for plotting
tested_row["plot_attributes_marker"]="-o"
tested_row["plot_attributes_label"]="(list_under_test)"
tested_row["plot_attributes_zorder"]=1

# print(row)
print(len(tested_row))

rows=get_rows(df, tested_time)
# print(rows)
print(len(rows))


if 0:
    title=f'rows: {tested_row["symbol"]} {tested_row["ruler_time_end"]} ({len(rows)})'
    plot_rows(rows, title)


silimar_rows=[]
silimar_rows.append(tested_row)
silimar_rows.extend(compare_rows_isclose(tested_row, rows, atol=1)) # using isclose()
# set attributes for plotting
for r in silimar_rows:
    r["plot_attributes_color"]="orange"
    r["plot_attributes_alpha"]=0.75

tested_row["plot_attributes_color"]="red" # overwrite
tested_row["plot_attributes_alpha"]=1 # overwrite
if 0:
    plot_rows(silimar_rows, f"silimar_rows ({len(silimar_rows)})")


silimar_rows_market_close=[]

# row under test
tested_row_market_close=get_row(df, tested_symbol, tested_time.replace(hour=23, minute=5)) # at market close
# set attributes for plotting
tested_row_market_close["plot_attributes_marker"]="-o"
tested_row_market_close["plot_attributes_label"]="(list_under_test)"
tested_row_market_close["plot_attributes_zorder"]=1
tested_row_market_close["plot_attributes_color"]="g"
silimar_rows_market_close.append(tested_row_market_close)

for r in silimar_rows:

    # skip self
    if tested_row["symbol"]==r["symbol"] and tested_row["ruler_time_end"]==r["ruler_time_end"]:
        print("skip self")
        continue

    row_market_close=get_row(df, r["symbol"], r["ruler_time_end"].replace(hour=23, minute=5)) # at market close
    row_market_close["plot_attributes_color"]="b"
    row_market_close["plot_attributes_alpha"]=0.75
    silimar_rows_market_close.append(row_market_close)

# plot at market close
if 0:
    plot_rows(silimar_rows_market_close, f"silimar_rows_market_close ({len(silimar_rows_market_close)})")
# exit(2)




# ----------------------------------------------
# get extremum values from close market list
ts:list[tuple]=[]
for r, r_mc in zip(silimar_rows, silimar_rows_market_close):

    
    prefix=f'{r["symbol"]} {r["ruler_time_end"]} ({len(r["gaussian_f1d_sigma_10_percentage"])})'

    if not "gaussian_f1d_sigma_10_percentage" in r_mc:
        continue

    prefix+=f' --> {r_mc["symbol"]} {r_mc["ruler_time_end"]} ({len(r_mc["gaussian_f1d_sigma_10_percentage"])})'
    # print(prefix)

    
    # skip self
    if 0:
        if tested_row["symbol"]==r["symbol"] and tested_row["ruler_time_end"]==r["ruler_time_end"]:
            print(f"{prefix}: skip self.")
            continue


    tail_length=len(r_mc["gaussian_f1d_sigma_10_percentage"]) - len(r["gaussian_f1d_sigma_10_percentage"])+1
    lst=r_mc["gaussian_f1d_sigma_10_percentage"][-tail_length:]

    r_mc_base=lst[0]

    lst_max=round(max(lst), 2)
    lst_min=round(min(lst), 2)
    
    diff_max_up=round(max(lst)-r_mc_base, 2)
    diff_min_down=round(min(lst)-r_mc_base, 2)

    print(f"{prefix}: [max = {lst_max}, min = {lst_min}], diff_max_up = {diff_max_up}, diff_min_down = {diff_min_down}")
    ts.append((prefix, lst_max, lst_min, diff_max_up, diff_min_down))

# to csv
if 0:
    path = f"./scripts/outputs_sim/csv_candles_5min/"
    output_filename = f"{path}/min_max_tail.csv"
    header=["prefix", "max", "min", "diff_max_up", "diff_min_down"]
    list_tuple_to_csv(header, ts, output_filename, True)






# ----------------------------------------------
all_rows=silimar_rows_market_close+silimar_rows
title=f'[all_rows] tested_row: {tested_row["symbol"]} {tested_row["ruler_time_end"]} ({len(all_rows)})'
if 1:
    plot_rows(all_rows, title)










