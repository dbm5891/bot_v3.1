import ast
from datetime import datetime, timedelta
import re
from matplotlib import pyplot as plt
import pandas as pd

from dfs_prepare import time_begin, time_end

from dfs_set_ta_indicators_5m_2 import df_5m,\
    indicator_0, global_lengths_diffs, local_lengths_diffs,\
    key_signal_peaks, key_signal_valleys,\
    signal_column, key_signal_column_diff,\
    bb_length, bb_stds, bb_mamode,\
    g_std

from dfs_set_ta_indicators_1D import df_1d

from functional.dataframes import plot_1D_candles, plot_5m_candles,\
    plot_1D_eth_vlines, plot_1D_pivot_lines, plot_1D_vlines,\
    plot_text, print_df, print_all_rows_df, plot_trades, plot_drawdown,\
    plot_orders_pairs, plot_orders_pairs_duration,\
    plot_trades_duration, plot_trades_drawdown

from functional.files import orders_info_csv_to_list_tuple, trades_info_csv_to_list_tuple, get_pnl_from_trades_info,\
    get_pnl_from_orders_info




# symbol
symbol_df_1d=df_1d['symbol'].iloc[0]
symbol_df_5m=df_5m['symbol'].iloc[0]
if symbol_df_1d != symbol_df_5m:
    raise ValueError("dataframes must represent same symbol.")
symbol=symbol_df_1d


# define Matplotlib figure and axis
fig, ax = plt.subplots()

# plot_1D_eth_vlines(ax, df_1d, linewidth=2)
# plot_1D_vlines(ax, df_1d, y_min=0, y_max=77)

# plot trades
trades_info: list[tuple]=[]
orders_info: list[tuple]=[]
pnl=0
pnl_average=0
count=0
# read csv to list[tuple]
path = f"backtesting/outputs"
if 1:
    

    




    filename = f"{path}/StrategyEachBar_orders_07-02-2025_11-59-57.csv" # (5/22) tp=2
    # filename = f"{path}/StrategyEachBar_orders_07-02-2025_13-16-27.csv" # (5/22) tp=0.01
    # filename = f"{path}/StrategyEachBar_orders_09-02-2025_12-08-38.csv" # (5/22) tp=2
    filename = f"{path}/StrategyEachBar_Short_orders_09-02-2025_12-43-05.csv" # (5/22) tp=2
    filename = f"{path}/StrategyEachBar_Short_orders_09-02-2025_13-14-46.csv" # (5/22) tp=2
    filename = f"{path}/StrategyEachBar_orders_09-02-2025_15-49-40.csv" # (10/5/22) tp=2
    filename = f"{path}/StrategyEachBar_orders_09-02-2025_16-18-55.csv" # (10-11/5/22) tp=2
    filename = f"{path}/StrategyEachBar_orders_09-02-2025_16-40-53.csv" # (10-11/5/22) tp=2
    filename = f"{path}/StrategyEachBar_orders_09-02-2025_17-09-04.csv" # (11/5/22) tp=2
    filename = f"{path}/StrategyEachBar_orders_09-02-2025_17-10-03.csv" # (10-11/5/22) tp=2
    filename = f"{path}/StrategyEachBar_orders_09-02-2025_17-21-51.csv" # (10-14/5/22) tp=2
    
    filename = f"{path}/StrategyEachBar_orders_09-02-2025_17-42-11.csv" # (10-14/5/22) tp=2
    filename = f"{path}/StrategyEachBar_Long_orders_09-02-2025_21-53-41.csv" # (5-6/22) tp=2
    # filename = f"{path}/StrategyEachBar_Short_orders_09-02-2025_21-55-39.csv" # (5-6/22) tp=2

    filename = f"{path}/StrategyEachBar_SMA_orders_11-02-2025_11-17-39.csv" # (5-6/22) tp=2
    filename = f"{path}/StrategyEachBar_SMA_Market_Open_orders_11-02-2025_11-56-16.csv" # (5-6/22) tp=2
    filename = f"{path}/StrategyEachBar_SMA_Market_Open_orders_11-02-2025_11-58-12.csv" # (5-6-7/22) tp=2
    filename = f"{path}/StrategyEachBar_SMA_Market_Open_orders_11-02-2025_12-20-01.csv" # (5/22 - 7/23) tp=2
    
    filename = f"{path}/StrategyEachBar_Long_orders_11-02-2025_17-38-03.csv" # (5/22 - 7/23) tp=2
    filename = f"{path}/StrategyEachBar_SMA_Market_Open_orders_12-02-2025_10-18-51.csv" # (5/22 - 7/23) tp=2
    
    # plot orders
    # orders_info=orders_info_csv_to_list_tuple(filename, time_begin, time_end)
    # pnl, count=get_pnl_from_orders_info(orders_info, time_begin, time_end)
    # pnl_average=pnl/count if count else 0
    
    filename="StrategyEachBar_Long_orders_12-02-2025_11-15-36.csv"
    filename="StrategyEachBar_Long_orders_12-02-2025_15-05-09.csv"
    
    filename="StrategyEachBar_Long_orders_12-02-2025_15-27-21.csv"
    filename="StrategyEachBar_Long_orders_12-02-2025_15-42-53.csv"
    
    filename="StrategyEachBar_Long_orders_13-02-2025_12-44-28.csv" # tp=2.00
    # filename="StrategyEachBar_Long_orders_13-02-2025_12-47-38.csv" # tp=1.00
    # filename="StrategyEachBar_Long_orders_13-02-2025_12-49-33.csv" # tp=0.10
    
    # filename="StrategyEachBar_Long_orders_13-02-2025_12-56-56.csv" # tp=0.10
    # filename="StrategyEachBar_Long_orders_14-02-2025_12-45-07.csv" # tp=0.10
    
    # filename="StrategyEachBar_Long_orders_16-02-2025_15-07-52.csv" # tp=2.0

    filename="StrategyEachBar_Long_orders_17-02-2025_12-57-55.csv" # tp=2.0
    filename="StrategyEachBar_Long_orders_17-02-2025_14-35-12.csv" # tp=2.0, AAPL, [2022-05-25] to [2022-05-28]
    filename="StrategyEachBar_Long_orders_17-02-2025_14-37-42.csv" # tp=999, AAPL, [2022-05-25] to [2022-05-28]
    
    filename="StrategyEachBar_Long_orders_17-02-2025_23-38-11.csv" # tp=999, AAPL, [2022-05-25] to [2022-05-28]
    filename="StrategyEachBar_Long_orders_20-02-2025_12-59-39.csv" # tp=2.0, AAPL, [2022-05-25] to [2022-05-28]
    filename="StrategyEachBar_Long_MA_orders_20-02-2025_13-00-58.csv" # tp=2.0, 
    filename="StrategyEachBar_Long_MA_orders_20-02-2025_13-44-13.csv" # tp=2.0, 
    filename="StrategyEachBar_Long_MA_orders_20-02-2025_13-57-34.csv" # tp=2.0, 
    filename="StrategyEachBar_Long_MA_orders_20-02-2025_14-05-08.csv" # tp=2.0, 
    
    # filename="StrategyEachBar_Long_MA_orders_20-02-2025_16-07-30.csv" # tp=99, 
    filename="StrategyEachBar_Long_MA_orders_20-02-2025_16-05-15.csv" # tp=99, 
    filename="StrategyEachBar_Long_MA_orders_20-02-2025_16-18-39.csv" # tp=0.10
    filename="StrategyEachBar_Long_MA_orders_20-02-2025_16-29-15.csv" # tp=0.50
    
    filename="StrategyEachBar_Long_MA_orders_20-02-2025_16-38-30.csv" # tp=2
    filename="StrategyEachBar_Long_orders_23-02-2025_15-30-10.csv" # tp=2
    filename="StrategyEachBar_Long_orders_23-02-2025_15-36-53.csv" # tp=2
    
    filename="StrategyEachBar_Long_orders_23-02-2025_15-56-07.csv" # tp=0.20
    filename="StrategyEachBar_Short_orders_23-02-2025_19-54-57.csv" # tp=0.20
    
    filename="StrategyEachBar_Long_orders_23-02-2025_23-13-38.csv" # tp=99 buy and hold: buy at open, sell at close day.
    filename="StrategyEachBar_Long_orders_24-02-2025_12-23-01.csv" # tp=99 buy and hold: buy at open, sell at close day.


    filename="StrategyEachBar_Long_orders_26-02-2025_22-39-54.csv" 
    
    filename="StrategyEachBar_Long_orders_26-02-2025_22-43-26.csv" 
    # filename="StrategyEachBar_Long_Pivot_orders_26-02-2025_22-43-53.csv" 
    
    # filename="StrategyEachBar_Short_Pivot_orders_27-02-2025_10-55-21.csv" 
    
    # filename="StrategyEachBar_Long_LR_orders_04-03-2025_13-00-35.csv" 
    # filename="StrategyEachBar_Long_LR_orders_04-03-2025_13-04-04.csv" 
    # filename="StrategyEachBar_Long_LR_orders_04-03-2025_13-06-26.csv" # tp=0.20
    # filename="StrategyEachBar_Long_Pivot_orders_04-03-2025_13-11-18.csv" 
    # filename="StrategyEachBar_Long_LR_orders_04-03-2025_17-53-39.csv"  # tp=2
    
    # filename="StrategyEachBar_Long_Pivot_orders_05-03-2025_14-02-51.csv"  # tp=0.20
    # filename="StrategyEachBar_Long_Pivot_orders_05-03-2025_14-06-07.csv"  # tp=0.20, +5min
    # filename="StrategyEachBar_Long_Pivot_orders_05-03-2025_14-10-00.csv"  # tp=0.20, +30min
    # filename="StrategyEachBar_Short_Pivot_orders_05-03-2025_14-16-47.csv" 
    
    # filename="StrategyEachBar_Long_LR_orders_06-03-2025_11-38-27.csv" 
    filename="StrategyEachBar_Long_orders_07-03-2025_13-49-18.csv" 
    filename="StrategyEachBar_Long_tp=0.2_sl=None_orders_09-03-2025_12-17-43.csv" 

    
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
        
        # find enter completed orders
        if row["pair_type"]=="enter" and row["status"]=="Completed":

            # orders_to_trades.loc[row["ref"]] = [row.name, pd.NA] # index
            orders_pairs.loc[row["ref"]] = [row["ref"], pd.NA]
            
        # find exit completed orders (take profit reached)
        if row["pair_type"]=="exit" and row["status"]=="Completed":

            # orders_to_trades.loc[int(row["pair_order_ref"]), "order_close_index"] = row.name # index
            orders_pairs.loc[int(row["pair_order_ref"]), "order_close_index"] = row["ref"]

        # exited with a close order (original exit order canceled)
        if row["pair_type"]=="exit (market_close)" and row["status"]=="Completed":
            # get enter orders ids:

            enter_orders_ids=ast.literal_eval(row["pair_order_ref"])
            print(enter_orders_ids)
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
        
        print(f"[{i}] {row.to_list()}")
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
        output_filename = f"{path}/orders_pairs_to_trades.csv"
        timestamp = datetime.now().strftime("%d-%m-%Y_%H-%M-%S")
        match = re.search(r"\.\w+$", output_filename)
        file_extension = match.group()
        output_filename = output_filename.replace(file_extension, f"_{timestamp}{file_extension}")

        trades.to_csv(output_filename)  
        print(f"exported: [{output_filename}]")
    
    # plot_orders_pairs_duration(ax, orders_info) # deprecated

    plot_trades_duration(ax, trades)
    plot_trades_drawdown(ax, trades, plot_text=False)
    # plot_trades(ax, trades) # use script: 'dfs_plot3.py'
    



# plot_1D_vlines(ax, df_1d, amplitude=100, alpha=0.20, color="b")


legend = ax.legend(loc='best')
legend.get_frame().set_alpha(0)  # Set transparency level (0.0 = fully transparent, 1.0 = fully opaque)

delta: timedelta=time_end-time_begin
# title=f"{symbol}, [{time_begin.strftime('%Y-%m-%d')}] to [{time_end.strftime('%Y-%m-%d')}] ({delta.days} days, {count} trades, pnl: {round(pnl, 4)} usd, average: {round(pnl_average, 4)} usd/trade)"
title=f"{symbol}, [{time_begin.strftime('%Y-%m-%d')}] to [{time_end.strftime('%Y-%m-%d')}] ({delta.days} days)"
title+=f"\n{filename}"
print(title)
plt.title(title)
ax.grid()
plt.show()


