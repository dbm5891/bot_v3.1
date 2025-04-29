import ast
from datetime import datetime, timedelta
import re
from matplotlib import pyplot as plt
import pandas as pd

from dfs_prepare import df_5m, time_begin, time_end

# from dfs_set_ta_indicators_5m_2 import df_5m,\
#     indicator_0, global_lengths_diffs, local_lengths_diffs,\
#     key_signal_peaks, key_signal_valleys,\
#     signal_column, key_signal_column_diff,\
#     bb_length, bb_stds, bb_mamode,\
#     g_std

from dfs_set_ta_indicators_1D import df_1d

from functional.dataframes import plot_1D_candles, plot_1D_hlines, plot_5m_candles,\
    plot_1D_eth_vlines, plot_1D_pivot_lines, plot_1D_vlines,\
    plot_text, plot_trades_as_bars, print_df, print_all_rows_df, plot_trades, plot_drawdown,\
    plot_orders_pairs, plot_orders_pairs_duration,\
    plot_trades_duration, plot_trades_drawdown, plot_positions_info

from functional.files import orders_info_csv_to_list_tuple, positions_info_csv_to_list_tuple, trades_info_csv_to_list_tuple, get_pnl_from_trades_info,\
    get_pnl_from_orders_info


path = f"backtesting/outputs"


# symbol
symbol_df_1d=df_1d['symbol'].iloc[0]
symbol_df_5m=df_5m['symbol'].iloc[0]
if 0:
    if symbol_df_1d != symbol_df_5m:
        raise ValueError("dataframes must represent same symbol.")
# symbol=symbol_df_1d
symbol=symbol_df_5m


# define Matplotlib figure and axis
fig, ax = plt.subplots()

# plot_1D_eth_vlines(ax, df_1d, linewidth=2)
# plot_1D_vlines(ax, df_1d, y_min=0, y_max=77)


# positions life cycle
if 1:
    # read csv to list[tuple]
    filename = f"{path}/StrategyEachBar_Long_LR_[tp=100.0_sl=100.0]_positions_08-04-2025_16-51-10.csv" # (all) aapl
    filename = f"{path}/StrategyEachBar_Long_LR_[tp=100.0_sl=100.0]_positions_08-04-2025_17-28-03.csv" # (all) amd
    filename = f"{path}/StrategyEachBar_Short_LR_[tp=100.0_sl=100.0]_AMD_positions_09-04-2025_11-58-57.csv" # (all) amd
    filename = f"{path}/StrategyEachBar_Long_LR_[tp=100.0_sl=100.0]_TSLA_positions_09-04-2025_12-41-45.csv" # (all) 
    
    positions_info=positions_info_csv_to_list_tuple(filename, time_begin, time_end)
    plot_positions_info(ax, positions_info)


# plot trades
trades_info: list[tuple]=[]
orders_info: list[tuple]=[]
pnl=0
pnl_average=0
count=0
# read csv to list[tuple]
if 1:
    filename="StrategyEachBar_Long_LR_[tp=100.0_sl=100.0]_orders_08-04-2025_16-51-10.csv" # aapl
    filename="StrategyEachBar_Long_LR_[tp=100.0_sl=100.0]_orders_08-04-2025_17-28-03.csv" # amd
    
    filename="StrategyEachBar_Short_LR_[tp=100.0_sl=100.0]_AMD_orders_09-04-2025_11-58-57.csv" # amd
    filename="StrategyEachBar_Long_LR_[tp=100.0_sl=100.0]_TSLA_orders_09-04-2025_12-41-45.csv" #

    # method	ref	notify_dt	pair_type	pair_order_ref	executed_datetime	order_type	status	
    # size	executed_size	price	executed_price	executed_value	exec_type

    orders_df = pd.read_csv(
        f"{path}/{filename}",
        parse_dates=["notify_dt", "executed_datetime"]
    )
    print(orders_df)
    print(orders_df.info())

    orders_pairs = pd.DataFrame(columns=["order_ref", "order_open_index", "order_close_index"]).set_index("order_ref")

    # iterate enter orders, to find exit order
    for i, row in orders_df.iterrows():
        
        # find enter completed order
        if row["pair_type"]=="main" and row["status"]=="Completed":

            # orders_to_trades.loc[row["ref"]] = [row.name, pd.NA] # index
            orders_pairs.loc[row["ref"]] = [row["ref"], pd.NA]
            
        # find exit completed orders (take profit reached)
        if row["pair_type"]=="limit" and row["status"]=="Completed":

            # orders_to_trades.loc[int(row["pair_order_ref"]), "order_close_index"] = row.name # index
            orders_pairs.loc[int(row["pair_order_ref"]), "order_close_index"] = row["ref"]
        
        # find exit completed orders (stop loss reached)
        if row["pair_type"]=="stop" and row["status"]=="Completed":

            # orders_to_trades.loc[int(row["pair_order_ref"]), "order_close_index"] = row.name # index
            orders_pairs.loc[int(row["pair_order_ref"]), "order_close_index"] = row["ref"]

        # exited with a close order (original exit order canceled)
        if row["pair_type"] in ["exit", "exit (market_close)"] and row["status"]=="Completed":
            # get enter orders ids:

            enter_orders_ids=ast.literal_eval(row["pair_order_ref"])
            # print(enter_orders_ids)
            for order_ref in enter_orders_ids:
                
                if pd.notna(orders_pairs.at[order_ref, "order_close_index"]):
                    print(f'<========= has value: {orders_pairs.loc[order_ref, "order_close_index"]}, new: {row["ref"]}')

                # orders_to_trades.loc[order_ref, "order_close_index"] = row.name # index
                orders_pairs.loc[order_ref, "order_close_index"] = row["ref"]





    print(orders_pairs)
    
    
    if 0:
        for i, row in orders_pairs.iterrows():
            print(f"[{i}] {row.to_list()}")

    # orders pairs to trades
    trade_id=0
    trades = pd.DataFrame(
        columns=[
            "id", 
            "symbol", 
            "open_datetime", 
            "open_executed_price", 
            "close_datetime", 
            "close_executed_price", 
            "type",
            "size",
            "price_diff",
            "percentage_diff",
            "pnl"
        ]).set_index("id")
    
    for i, row in orders_pairs.iterrows():
        open_order_df = orders_df[(orders_df["ref"] == row["order_open_index"]) & (orders_df["status"]=="Completed")]
        close_order_df = orders_df[(orders_df["ref"] == row["order_close_index"]) & (orders_df["status"]=="Completed")]
        
        # print(f"[{i}] {row.to_list()}")
        # print(open_order_df)
        # print(close_order_df)

        if not len(close_order_df):
            print(f"WARNING: no closing order found for open order ref={open_order_df['ref'].iloc[0]} <==============")
            continue


        
        trade_type = "long" if (open_order_df["size"].iloc[0]>0) else "short"
        trade_pnl = (close_order_df["executed_price"].iloc[0] - open_order_df["executed_price"].iloc[0])*open_order_df["size"].iloc[0]
        # if trade_type=="short":
        #     trade_pnl *= -1

        trade_id = open_order_df["ref"].iloc[0]
        trades.loc[trade_id] = [
            symbol_df_5m,
            open_order_df["executed_datetime"].iloc[0],
            open_order_df["executed_price"].iloc[0],
            close_order_df["executed_datetime"].iloc[0],
            close_order_df["executed_price"].iloc[0],
            trade_type,
            open_order_df["size"].iloc[0],
            close_order_df["executed_price"].iloc[0] - open_order_df["executed_price"].iloc[0],
            (close_order_df["executed_price"].iloc[0] - open_order_df["executed_price"].iloc[0])/open_order_df["executed_price"].iloc[0],
            trade_pnl,
        ]

        # print(trades.loc[trade_id])
        # trade_id+=1
    
        




    # print(trades.info())
    print(trades)
    
    if 1:
        output_filename = f"{path}/orders_list_to_trades.csv"
        timestamp = datetime.now().strftime("%d-%m-%Y_%H-%M-%S")
        match = re.search(r"\.\w+$", output_filename)
        file_extension = match.group()
        output_filename = output_filename.replace(file_extension, f"_{timestamp}{file_extension}")

        trades.to_csv(output_filename)  
        print(f"exported: [{output_filename}]")
    
    # plot_orders_pairs_duration(ax, orders_info) # deprecated

    # plot_trades_duration(ax, trades)
    plot_trades_drawdown(ax, trades, plot_text=False)
    # plot_trades(ax, trades) # use script: 'dfs_plot3.py'
    plot_trades_as_bars(ax, trades)



    



# plot_1D_vlines(ax, df_1d, amplitude=100, alpha=0.20, color="b")


legend = ax.legend(loc='best')
legend.get_frame().set_alpha(0)  # Set transparency level (0.0 = fully transparent, 1.0 = fully opaque)

delta: timedelta=time_end-time_begin
title=f"{symbol}, [{time_begin.strftime('%Y-%m-%d')}] to [{time_end.strftime('%Y-%m-%d')}] ({delta.days} days)"
title+=f"\n{filename}"
print(title)
plt.title(title)
ax.grid()
plt.show()


