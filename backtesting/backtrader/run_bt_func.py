from datetime import datetime
import numpy as np
import pandas as pd
import os
import sys

import time as tm
import backtrader as bt


cwd = os.getcwd()
sys.path.append(f"{cwd}")
sys.path.append(f"{cwd}\\scripts")



from backtesting.functional.dataframes import print_df_index_range
from strategies.st_base import StrategyBase

    
# TODO: fix function
def cerebro_summary(cerebro: bt.Cerebro):

    results = cerebro.runstrats

    strategies=[]
    for s in results:
        strategies.append(s.__class__.__name__)
        # strategies.append(f"{s.__class__.__name__}_[tp={s.params.take_profit_usd}_sl={s.params.stop_loss_usd}]")


    

    # Access the TradeAnalyzer results
    trade_analyzer = results[0].analyzers.trade_analyzer.get_analysis()
    # print(trade_analyzer)

    print(f"strategies: {strategies}")
    # txt=f'[{data_5m._name}] Final Portfolio Value ($): {cash} -> {round(cerebro.broker.getvalue(), 2)}'
    
    if 0:
        for t in cerebro.runstrats[0][0].trades_info:
            print(t)

        

    if 0:
        if cerebro.runstrats[0][0].trades:
            
            pnl=trade_analyzer["pnl"]["net"]["total"]
            pnl_average=trade_analyzer["pnl"]["net"]["average"]
            num_trades=trade_analyzer["total"]["total"]
            won_trades=trade_analyzer["won"]["total"]
            lost_trades=trade_analyzer["lost"]["total"]
            won_trades_pnl=trade_analyzer["won"]["pnl"]["total"]
            lost_trades_pnl=trade_analyzer["lost"]["pnl"]["total"]
            
            txt+=f' (trades: {num_trades}, PnL: {round(pnl, 2)}, average: {round(pnl_average, 2)})'
        print(txt)

    if 0:

        if cerebro.runstrats[0][0].trades:
            txt="" # reset
            txt+=f"symbol: {cerebro.datas[0]._name}"
            txt+=f"\n"
            txt+=f"pnl (sum): {round(pnl, 4)} (expectancy, $)"
            txt+=f"\n"
            txt+=f"mean: {round(pnl_average, 4)} (average expectancy, $/trade)"
            txt+=f"\n"
            txt+=f"total: {num_trades} (100%), ${round(pnl, 4)} (expectancy)"
            txt+=f"\n"
            txt+=f"won: {won_trades} ({round(100*won_trades/num_trades, 2)}%), ${round(won_trades_pnl, 2)}"
            txt+=f"\n"
            txt+=f"lost: {lost_trades} ({round(100*lost_trades/num_trades, 2)}%), ${round(lost_trades_pnl, 2)}"
            txt+=f"\n"
            txt+=f'profit factor: {round(abs(trade_analyzer["won"]["pnl"]["total"] / trade_analyzer["lost"]["pnl"]["total"]), 2)}'
        print(txt)  

    



# run cerebro over given df
def cerebro_run(
        df: pd.DataFrame, # usually 5 min timeframe
        strategy: StrategyBase = None,
        cash=100000.0, # usd
        plot: bool= True
    ) -> list[tuple]:

    
    print_df_index_range(df)
    
    cerebro = bt.Cerebro()
    data_5m = bt.feeds.PandasData(
        dataname=df, 
        timeframe=bt.TimeFrame.Minutes,  # Set to minutes
        compression=5,                   # Set the compression to 5 for 5-minute bars
    )
    data_5m._name = df.iloc[0]["symbol"]
    cerebro.adddata(data_5m)
    cerebro.addstrategy(strategy) if strategy else None
    # Add the TradeAnalyzer
    cerebro.addanalyzer(bt.analyzers.TradeAnalyzer, _name="trade_analyzer")

    cerebro.broker.setcash(cash)
    # cerebro.addsizer(bt.sizers.FixedSize, stake=500)

    print('Starting Portfolio Value: %.2f' % cerebro.broker.getvalue())
    
    # Run the strategy
    results = cerebro.run()

    pnl = cerebro.broker.getvalue() - cash
    print(f'Final Portfolio Value ($): {cash} -> {round(cerebro.broker.getvalue(), 2)} ({round(pnl, 2)})')


    # TODO: stat
    # cerebro_summary(cerebro)


    if plot:
        cerebro.plot(
            style='bar',
            # style='candle',
            barup="g",
            bardown="r",
            # volume=False,
            fmt_x_ticks='%Y-%m-%d %H:%M',
            fmt_x_data='%Y-%m-%d %H:%M',
        )

    return cerebro.runstrats[0][0].trades_info






def print_current_runtime(start_time):
    # calculate runtime
    curr_time = tm.time()
    runtime = round(curr_time - start_time, 2)
    print(f"Runtime: {runtime} seconds")





# summary
def print_summary(
        trades_info: list[tuple], 
        date: pd.Timestamp, 
        date_end: pd.Timestamp = None,
        print_df: bool = False,
    ):

    # trades_info to csv
    header=[
        "method",
        "ref",
        "symbol",
        "type",
        "status",
        "open",
        "close",
        "size",
        "open price",
        "close price",
        "diff price",
        "percentage",
        "pnl",
    ]
    df_trades_info = pd.DataFrame(trades_info, columns=header)
    df_trades_info["open"] = pd.to_datetime(df_trades_info["open"])
    df_trades_info["close"] = pd.to_datetime(df_trades_info["close"])

    df_trades_info.sort_values(by=['pnl'], inplace=True, ascending=False)
    if print_df:
        print("\n", df_trades_info)
        print(df_trades_info.info(), "\n")
    
    
    num_trades=len(df_trades_info["pnl"])
    
    won_trades=df_trades_info[df_trades_info["pnl"]>=0]
    won_trades_usd=won_trades["pnl"].sum()

    lost_trades=df_trades_info[df_trades_info["pnl"]<0]
    lost_trades_usd=lost_trades["pnl"].sum()
    
    profit_factor=won_trades_usd/abs(lost_trades_usd) if lost_trades_usd else np.inf
    pnl_sum=df_trades_info["pnl"].sum() # expectancy
    pnl_mean=df_trades_info["pnl"].mean() # average: expectancy/trade
    
    total_enter_cost=df_trades_info["open price"].sum() # total enter cost (with 1 share size)
    symbols = df_trades_info["symbol"].unique()


    txt="" # reset
    txt+=f"\n"
    # txt+=f"dates: {df_trades_info.iloc[0]['open'].date()}"
    txt+=f"date: {date.date()}"
    txt+=f" to {date_end.date()} ({date_end - date})" if date_end else ""
    txt+=f"\n"
    txt+=f"total: {num_trades} (100%), ${round(pnl_sum, 4)} (pnl sum, expectancy)"
    txt+=f"\n"
    
    txt+=f"won: {len(won_trades)}"
    if num_trades:
        txt+=f" ({round(100*len(won_trades)/num_trades, 2)}%), ${round(won_trades_usd, 2)}"
    txt+=f"\n"
    
    txt+=f"lost: {len(lost_trades)}"
    if num_trades:
        txt+=f" ({round(100*len(lost_trades)/num_trades, 2)}%), ${round(lost_trades_usd, 2)}"
    txt+=f"\n"

    txt+=f"mean: {round(pnl_mean, 4)} (average expectancy, $/trade)"
    txt+=f"\n"
    txt+=f'profit factor: {round(profit_factor, 2)}'
    txt+=f"\n"
    txt+=f'total enter cost: ${round(total_enter_cost, 2)}'
    txt+=f"\n"
    txt+=f'count symbols: {len(symbols)}'
    txt+=f"\n"
    print(txt)
    
    

    # to csv
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    path = f"backtesting/outputs"
    output_filename = f"{path}/trades_info_{date.date()}"
    output_filename += f"_to_{date_end.date()}" if date_end else ""
    output_filename += f"_{len(symbols)}symbols"
    output_filename += f"_ts{timestamp}.csv"
    # list_tuple_to_csv(header=header, list_tuples=trades_info, output_filename=output_filename, append_timestamp=True)
    df_trades_info.to_csv(output_filename)




