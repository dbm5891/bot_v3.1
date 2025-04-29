import inspect
import re
import time
from matplotlib.artist import Artist
from matplotlib.axes import Axes
import numpy as np
import pandas as pd
from datetime import datetime, timedelta, time, date
from matplotlib import patches, pyplot as plt

# 10 colors
palette_10_colors = [
    "red",
    "pink",
    "orange",
    "gold",
    "yellow",
    "lime",
    "green",
    "blue",
    "orchid",
    "violet",
]

# ----------------------------------------------
def df_get_rows_by_time(df: pd.DataFrame, time: time) -> pd.DataFrame:
    # rows with the same time (hh:mm)
    filtered_df = df[(df['ruler_time_end'].dt.hour == time.hour) & (df['ruler_time_end'].dt.minute == time.minute)]
    # print(filtered_df)
    return filtered_df


# ----------------------------------------------
# get candles (each row represent a candle)
def df_get_rows_by_range(df: pd.DataFrame, symbol: str, time_begin: datetime, time_end: datetime) -> pd.DataFrame:
    # rows with the same time (hh:mm)
    filtered_df = df[(df['symbol'] == symbol) & (df['ruler_time_end'] >= time_begin) & (df['ruler_time_end'] <= time_end)]
    # print(filtered_df)
    return filtered_df


# ----------------------------------------------
def df_to_rows(df: pd.DataFrame) -> list[dict]:
    return [r.to_dict() for i, r in df.iterrows()]


def print_df_index_range(df: pd.DataFrame):
    frame = inspect.currentframe().f_back
    names = [name for name, val in frame.f_locals.items() if val is df]
    if not names:
        print("names is empty")
        return
    delta = df.iloc[-1].name - df.iloc[0].name
    title = f"{names[0]}: [{df.iloc[0]['symbol']}] [{df.iloc[0].name}] to [{df.iloc[-1].name}] ({delta})"
    print(title)

def print_df(df: pd.DataFrame):
    frame = inspect.currentframe().f_back
    names = [name for name, val in frame.f_locals.items() if val is df]
    delta: pd.Timedelta = df.iloc[-1].name - df.iloc[0].name
    title = f"{names[0]}: [{df.iloc[0].name}] to [{df.iloc[-1].name}] ({delta.days} days)"
    print("="*len(title))
    print(title)
    print("="*len(title))
    print(df)
    print(df.info())
    print()

def get_df_title(df: pd.DataFrame):
    frame = inspect.currentframe().f_back
    names = [name for name, val in frame.f_locals.items() if val is df]
    delta: pd.Timedelta = df.iloc[-1].name - df.iloc[0].name
    title = f"{names[0]}: [{df.iloc[0].name}] to [{df.iloc[-1].name}] ({delta.days} days)"
    return title

def print_all_rows_df(df: pd.DataFrame):
    
    if not len(df):
        print("df is empty, nothing to print")
        return
    
    frame = inspect.currentframe().f_back
    names = [name for name, val in frame.f_locals.items() if val is df]
    title = f"{names[0]}: [{df.iloc[0].name}] to [{df.iloc[-1].name}]"
    print("="*len(title))
    print(title)
    print("="*len(title))

    for i, row in df.iterrows():
        print(i, row.to_list())

    print(df.info())
    print()


# ----------------------------------------------
# plot candles
def plot_1D_candles(ax: Axes, df: pd.DataFrame):
    alpha=0.25
    for i, row in df.iterrows():

        x = row.name.replace(hour=16, minute=30)
        y = row["open"]

        width = row.name.replace(hour=23, minute=0) - x
        height = row["close"] - y

        color = "g" if row["open_close_change"]>0 else "r"

        # plot candle's body
        ax.add_patch(
            patches.Rectangle(
                xy=(x, y),
                width=width, 
                height=height,
                # linewidth=candles.line_width,
                # edgecolor=color,
                facecolor=color,
                alpha=alpha,
            )
        )

        # plot candle's wicks or shadows (vertical lines that show the lows and highs for the candle)
        candle_middle_position = row.name.replace(hour=19, minute=45)
        
        # upper shadow
        ymin = row["close"] if row["open_close_change"]>0 else row["open"]
        ax.vlines(
            x=candle_middle_position, 
            ymin=ymin, 
            ymax=row["high"],
            color=color,
            linewidth=2,
            alpha=alpha,
        )

        # lower shadow
        ymax = row["open"] if row["open_close_change"]>0 else row["close"]
        ax.vlines(
            x=candle_middle_position, 
            ymin=row["low"],
            ymax=ymax,
            color=color,
            linewidth=2,
            alpha=alpha,
        )



# ----------------------------------------------
# plot candles
def plot_5m_candles(ax: Axes, df: pd.DataFrame):
    alpha=0.25
    for i, row in df.iterrows():

        x = row.name
        y = row["open"]

        width = pd.Timedelta(minutes=5)
        height = row["close"] - y

        color = "blue" if row["open_close_change"]>0 else "orange"

        # plot candle's body
        ax.add_patch(
            patches.Rectangle(
                xy=(x, y),
                width=width, 
                height=height,
                # linewidth=candles.line_width,
                # edgecolor=color,
                facecolor=color,
                alpha=alpha,
            )
        )

        # plot candle's wicks or shadows (vertical lines that show the lows and highs for the candle)
        candle_middle_position = row.name + pd.Timedelta(minutes=2, seconds=30)
        
        # upper shadow
        ymin = row["close"] if row["open_close_change"]>0 else row["open"]
        ax.vlines(
            x=candle_middle_position, 
            ymin=ymin, 
            ymax=row["high"],
            color=color,
            linewidth=2,
            alpha=alpha,
        )

        # lower shadow
        ymax = row["open"] if row["open_close_change"]>0 else row["close"]
        ax.vlines(
            x=candle_middle_position, 
            ymin=row["low"],
            ymax=ymax,
            color=color,
            linewidth=2,
            alpha=alpha,
        )




# ----------------------------------------------
# plot daily hours boundies
def plot_1D_eth_vlines(
        ax: Axes, 
        df: pd.DataFrame,
        alpha=0.50,
        linewidth=1,
    ):
    
    for i, row in df.iterrows():
        
        # in day lines
        ymin=row["low"]
        ymax=row["high"]

        # Israel time
        dt_pm:datetime=row.name.replace(hour=11, minute=0, second=0) # premarket open
        dt_mo:datetime=row.name.replace(hour=16, minute=30, second=0) # market open
        dt_mc:datetime=row.name.replace(hour=23, minute=0, second=0) # market close
        dt_ah:datetime=row.name.replace(hour=23, minute=0, second=0)+timedelta(hours=4) # after hours close

        # daily vertical lines (boundries)
        
        ax.plot([dt_pm]*2, [ymin, ymax], ls='-', linewidth=linewidth, color="black", alpha=alpha)
        ax.plot([dt_mo]*2, [ymin, ymax], ls='-', linewidth=linewidth, color="black", alpha=alpha)
        ax.plot([dt_mc]*2, [ymin, ymax], ls='-', linewidth=linewidth, color="black", alpha=alpha)
        ax.plot([dt_ah]*2, [ymin, ymax], ls='-', linewidth=linewidth, color="black", alpha=alpha)

        

    # legend: market hours
    if 0:
        ax.plot([], [], color="black", label="premarket open (11:00), market open (16:30), close (23:00), after hours close (3:00)")


# ----------------------------------------------
# plot daily hours boundies
def plot_1D_pivot_lines(
        ax: Axes, 
        df: pd.DataFrame,
        alpha=0.50,
        linewidth=1.5,
    ):

    
    for i, row in df.iterrows():
        
        # Israel time
        dt_pm:datetime=row.name.replace(hour=11, minute=0, second=0) # premarket open
        dt_mo:datetime=row.name.replace(hour=16, minute=30, second=0) # market open
        dt_mc:datetime=row.name.replace(hour=23, minute=0, second=0) # market close
        dt_ah:datetime=row.name.replace(hour=23, minute=0, second=0)+timedelta(hours=4) # after hours close


        # daily pivot
        ax.plot([dt_pm, dt_ah], [row["P"]]*2,  ls='-', linewidth=linewidth, color="black", alpha=alpha)
        ax.plot([dt_pm, dt_ah], [row["S1"]]*2, ls='-', linewidth=linewidth, color="g", alpha=alpha)
        ax.plot([dt_pm, dt_ah], [row["S2"]]*2, ls='-', linewidth=linewidth, color="g", alpha=alpha)
        ax.plot([dt_pm, dt_ah], [row["R1"]]*2, ls='-', linewidth=linewidth, color="r", alpha=alpha)
        ax.plot([dt_pm, dt_ah], [row["R2"]]*2, ls='-', linewidth=linewidth, color="r", alpha=alpha)

    # legend: pivot
    ax.plot([], [], color="black", label="[D] Pivot")
    ax.plot([], [], color="g", label="[D] S1, S2")
    ax.plot([], [], color="r", label="[D] R1, R2")

    # legend: market hours
    if 0:
        ax.plot([], [], color="black", label="premarket open (11:00), market open (16:30), close (23:00), after hours close (3:00)")


# ----------------------------------------------
# plot daily hours boundies
def plot_text(
        ax: Axes, 
        df: pd.DataFrame,
        alpha=0.50,
    ):
    for i, row in df.iterrows():
        if 1:
            # txt=f"{row['direction']} {round(row['open_close_change_pct'], 2)}%"
            txt=f"{round(row['open_close_change_pct'], 2)}%"
            ax.text(row.name.replace(hour=23, minute=0), row['close'], txt, fontsize=10, ha='right', va='bottom', alpha=alpha)

        
        if 0:
            if row.name.strftime('%a')=="Mon":
                txt="Mon"
                ax.text(row.name.replace(hour=11, minute=0), row['open'], txt, fontsize=10, ha='right', va='bottom', alpha=alpha)


# ----------------------------------------------
def plot_1D_hlines(
        ax: Axes, 
        df: pd.DataFrame,
        color="black",
        alpha=0.50,
        linewidth=1,
        y_value=0,
    ):

    ax.hlines(
        y=y_value,
        xmin=df.iloc[0].name,
        xmax=df.iloc[-1].name,
        color=color,
        linewidth=linewidth,
        alpha=alpha,
    )



# ----------------------------------------------
def plot_1D_vlines(
        ax: Axes, 
        df: pd.DataFrame,
        color="black",
        alpha=0.50,
        linewidth=1,
        y_min=0,
        y_max=1,
    ):

    for i, row in df.iterrows():
        
        ax.vlines(
            x=row.name.replace(hour=11, minute=0, second=0),
            ymin=y_min,
            ymax=y_max,
            color=color,
            linewidth=linewidth,
            alpha=alpha,
        )
        ax.vlines(
            x=row.name.replace(hour=16, minute=30, second=0),
            ymin=y_min,
            ymax=y_max,
            color=color,
            linewidth=linewidth+1,
            alpha=alpha,
        )
        ax.vlines(
            x=row.name.replace(hour=23, minute=0, second=0),
            ymin=y_min,
            ymax=y_max,
            color=color,
            linewidth=linewidth+1,
            alpha=alpha,
        )
        ax.vlines(
            x=row.name.replace(hour=23, minute=0, second=0)+timedelta(hours=4),
            ymin=y_min,
            ymax=y_max,
            color=color,
            linewidth=linewidth,
            alpha=alpha,
        )


        

# ----------------------------------------------
# plot trades
# tuple==trade_info (create at 'backtesting\backtrader\run_bt_v1.1.py')
def plot_trades_info(ax: Axes, trades_info: list[tuple]):
    alpha=0.25
    for t in trades_info:

        # example:
        # t=('notify_trade', 2, 'short', 'Closed', '2023-05-02 17:25:00', '2023-05-02 19:45:00', -500, 168.6, 168.37, -0.23, -0.14, 115.0)
        
        t_open_datetime=t[4]
        t_open_price=t[7]

        t_close_datetime=t[5]
        t_close_price=t[8]
        
        t_ref=int(t[1])
        t_type=t[2]
        t_pnl=float(t[11])

        x_open = datetime.fromisoformat(t_open_datetime)
        y_open = float(t_open_price)
        
        x_close = datetime.fromisoformat(t_close_datetime)
        y_close = float(t_close_price)

        width = x_close - x_open
        height = y_close - y_open

        # profit + LONG
        if (t_pnl>0) and (t_type=="long"):
            edgecolor="green"
            facecolor="lime"
            hatch='///'

        # loss + LONG
        elif (t_pnl<0) and (t_type=="long"):
            edgecolor="red"
            facecolor='salmon'
            hatch='///'
        
        # profit + SHORT
        elif (t_pnl>0) and (t_type=="short"):
            edgecolor="green"
            facecolor="lime"
            hatch='\\\\\\'

        # loss + SHORT
        elif (t_pnl<0) and (t_type=="short"):
            edgecolor="red"
            facecolor='salmon'
            hatch='\\\\\\'
        
        # default colors
        else:
            edgecolor="blue"
            facecolor="navy"
            hatch="|"

        # trade's rectangle
        ax.add_patch(
            patches.Rectangle(
                xy=(x_open, y_open),
                width=width,
                height=height,
                linewidth=1, 
                edgecolor=edgecolor, 
                facecolor=facecolor,
                hatch=hatch,
                zorder=2, 
                alpha=0.25,
            )
        )

        # trade's text
        color='green'
        if t_pnl<0:
            color='red'

        # info
        t_txt = t_ref
        t_txt = f"{t_ref}, {t_type[0].upper()}, ${t_pnl}"

        
        ax.text(
            x=x_open,
            y=y_open*1.001, # move position up 0.1%
            s=t_txt,
            color=color, 
            fontsize=12, 
            zorder=2,
            bbox={'facecolor': 'yellow', 'alpha': 0.5, 'pad': 1},
        )

        
# ----------------------------------------------
# plot drawdown
# tuple==trade_info (create at 'backtesting\backtrader\run_bt_v1.1.py')
def plot_drawdown(ax: Axes, trades_info: list[tuple], plot_text: bool=True):
    
    # init
    x: list[datetime] = []
    y: list[float] = []
    sum=0
    
    for t in trades_info:

        # example:
        # t=('notify_trade', 2, 'short', 'Closed', '2023-05-02 17:25:00', '2023-05-02 19:45:00', -500, 168.6, 168.37, -0.23, -0.14, 115.0)
        
        t_open_datetime=t[4]
        t_open_price=t[7]

        t_close_datetime=t[5]
        t_close_price=t[8]
        
        t_ref=int(t[1])
        t_type=t[2]
        t_pnl=float(t[11])

        x_open = datetime.fromisoformat(t_open_datetime)
        y_open = float(t_open_price)
        
        x_close = datetime.fromisoformat(t_close_datetime)
        y_close = float(t_close_price)

        x.append(x_open)
        x.append(x_close)
        y.append(sum) # before trade
        sum+=t_pnl
        y.append(sum) # after trade

        if plot_text:
            
            # trade's text
            color='green'
            if t_pnl<0:
                color='red'

            # info
            t_txt = t_ref
            t_txt = f"{t_ref}, {t_type[0].upper()}, ${t_pnl}"

            
            ax.text(
                x=x_close,
                y=sum,
                s=t_txt,
                color=color, 
                fontsize=12, 
                zorder=2,
                bbox={'facecolor': 'yellow', 'alpha': 0.5, 'pad': 1},
            )

    ax.plot(x, y)



        
        
# ----------------------------------------------
# plot position_info to view position's life cycle and potential pnl
# tuple==position_info (create at 'backtesting\backtrader\run_bt_v1.1.py')
def plot_positions_info(ax: Axes, positions_info: list[tuple]):
    
    # init
    x: list[datetime] = []
    y: list[float] = []
    
    for p in positions_info:

        # example:
        # p=('get_position_info', datetime.datetime(2022, 5, 27, 22, 10), 500, 148.19, 149.03, 0.57, 74095.0, 74515.0, 420.0)
        header=[
            "method",
            "datetime",
            "size",
            "open_price",
            "adjbase_price",
            "percentage",
            "init_cost",
            "curr_cost",
            "curr_pnl",
        ]
        
 

        x0 = datetime.fromisoformat(p[1])
        # y0 = float(p[5]) # percentage
        y0 = float(p[8]) # curr_pnl
        
      
        x.append(x0)
        y.append(y0)

        

    ax.plot(x, y, color="tab:blue", alpha=0.40)
    # ax.plot(x, y, marker="o", linestyle="None")
    # ax.bar(x, y, color="r", width=0.002)



        
        
# ----------------------------------------------
# plot orders pairs. each sequncial tuples represent a trade.
# the first item in the pair is the entry order, and the second is the exit order.
# if exit order's status is "canceled", consider last tuple as the close market exit price.
# tuple==order_info (create at 'backtesting\backtrader\run_bt_v1.1.py')
def plot_orders_pairs(ax: Axes, orders_info: list[tuple]):
    alpha=0.50
    order_close_all = orders_info[-1] # close market exit price

    
    ref=0
    
    for i in range(0, len(orders_info)-1, 2):

        # if i%10:
        #     continue

        order_enter=orders_info[i] # buy
        order_exit=orders_info[i+1] # sell


        # example:
        # method	ref	executed_datetime	order_type	status	size	executed_size	price	executed_price	executed_value	exec_type
        # ('<module>', 1, '2022-05-10 16:30:00', 'Buy', 'Completed', 1, 1, None, 155.69, 155.69, 'Market')
        # ('<module>', 2, '2022-05-10 22:50:00', 'Sell', 'Canceled', -1, 0, 157.69, 0.0, 0.0, 'Limit')
        # ('<module>', 3, '2022-05-10 16:35:00', 'Buy', 'Completed', 1, 1, None, 155.9, 155.9, 'Market')
        # ('<module>', 4, '2022-05-10 22:50:00', 'Sell', 'Canceled', -1, 0, 157.9, 0.0, 0.0, 'Limit')
        # ...
        # ('<module>', 151, '2022-05-10 22:45:00', 'Buy', 'Completed', 1, 1, None, 154.39, 154.39, 'Market')
        # ('<module>', 152, '2022-05-10 22:50:00', 'Sell', 'Canceled', -1, 0, 156.39, 0.0, 0.0, 'Limit')
        # ('<module>', 153, '2022-05-10 22:50:00', 'Buy', 'Completed', 1, 1, None, 154.38, 154.38, 'Market')
        # ('<module>', 154, None, 'Sell', 'Accepted', -1, 0, 156.38, 0.0, 0.0, 'Limit')
        # ('<module>', 155, '2022-05-10 22:55:00', 'Sell', 'Completed', -42, -42, None, 154.55, 6522.61, 'Market')


        
        ref+=1
        t_ref=ref
        # t_ref=int(order_exit[1])

       

        t_type=None
        # direction
        if order_enter[3]=="Buy" and order_exit[3]=="Sell":
            t_type="long"
        elif order_enter[3]=="Sell" and order_exit[3]=="Buy":
            t_type="short"


        x_open = datetime.fromisoformat(order_enter[2])
        y_open = float(order_enter[8])
        
        x_close = None
        y_close = None

        # limit succeeded (take profit)
        if order_exit[4]=="Completed":
            x_close = datetime.fromisoformat(order_exit[2])+timedelta(minutes=5)
            y_close = float(order_exit[8])
        
        # exit at close market price
        elif order_exit[4]=="Canceled":
            x_close = datetime.fromisoformat(order_close_all[2])
            y_close = float(order_close_all[8])

        if t_type=="long":
            t_pnl = y_close-y_open
                
        elif t_type=="short":
            t_pnl = -(y_close-y_open)

        width = x_close - x_open
        height = y_close - y_open

        # profit + LONG
        if (t_pnl>0) and (t_type=="long"):
            edgecolor="green"
            facecolor="lime"
            hatch='///'

        # loss + LONG
        elif (t_pnl<0) and (t_type=="long"):
            edgecolor="red"
            facecolor='salmon'
            hatch='///'
        
        # profit + SHORT
        elif (t_pnl>0) and (t_type=="short"):
            edgecolor="green"
            facecolor="lime"
            hatch='\\\\\\'

        # loss + SHORT
        elif (t_pnl<0) and (t_type=="short"):
            edgecolor="red"
            facecolor='salmon'
            hatch='\\\\\\'
        
        # default colors
        else:
            # edgecolor="blue"
            # facecolor="navy"
            # hatch="|"
            pass


        # trade's rectangle
        ax.add_patch(
            patches.Rectangle(
                xy=(x_open, y_open),
                width=width,
                height=height,
                linewidth=2, 
                # edgecolor=edgecolor, 
                # edgecolor=palette_10_colors[i % len(palette_10_colors)], 
                facecolor='none',  # No fill
                # facecolor=facecolor,
                # facecolor="None",
                # hatch=hatch,
                # hatch="None",
                zorder=2, 
                alpha=alpha,
            )
        )

        # trade's text
        color='green'
        if t_pnl<0:
            color='red'

        # info
        t_txt = t_ref
        t_txt = f"{t_ref}, {t_type[0].upper()}, ${round(t_pnl, 2)}"

        
        ax.text(
            x=x_open,
            y=y_open, # move position up 0.1%
            s=t_txt,
            color=color, 
            fontsize=12, 
            zorder=2,
            bbox={'facecolor': 'yellow', 'alpha': 0.5, 'pad': 1},
        )



# ----------------------------------------------
# get close order by date
def get_close_market_order(orders_info: list[tuple], dt: date) -> tuple:
    
    for t in orders_info:
        if datetime.fromisoformat(t[4]).date() == dt and t[2]=="market_close":
            return t

# ----------------------------------------------
# get orders by date
def get_orders_by_date(orders_info: list[tuple], dt: date) -> list[tuple]:
    
    ts=[]
    for t in orders_info:
        if datetime.fromisoformat(t[4]).date() == dt:
            ts.append(t)
    return ts


# ----------------------------------------------
# plot daily hours boundies
def plot_orders_pairs_duration(ax: Axes, orders_info: list[tuple]):
    alpha=0.50
    linewidth=1.5
    
    
    # get days range
    days: list[datetime]=[]
    for t in orders_info:
        days.append(datetime.fromisoformat(t[4]).date())

    unique_days = list(set(days))
    unique_days.sort()
    # print(unique_days)

    # iterate days

    for day in unique_days:

        day_order_close_all = get_close_market_order(orders_info, day)

        day_orders=get_orders_by_date(orders_info, day)

        
        ref=0
        day_pnl=0
        day_won=0
        
        for i in range(0, len(day_orders)-1, 2):

            # if i%10:
            #     continue

            order_enter=day_orders[i] # buy
            order_exit=day_orders[i+1] # sell

            # print(order_enter)
            # print(order_exit)

            # example:
            # method	ref	pair_type	pair_order_ref	executed_datetime	order_type	status	size	executed_size	price	executed_price	executed_value	exec_type
            # <module>	1	enter		10/05/2022 16:30	Buy	Completed	1	1		155.69	155.69	Market
            # <module>	2	exit	1	10/05/2022 22:50	Sell	Canceled	-1	0	157.69	0	0	Limit
            # ...
            # <module>	153	enter		10/05/2022 22:50	Buy	Completed	1	1		154.38	154.38	Market
            # <module>	154	exit	153		Sell	Accepted	-1	0	156.38	0	0	Limit
            # <module>	155	market_close		10/05/2022 22:55	Sell	Completed	-42	-42		154.55	6522.61	Market

            # verify a valid pair
            if order_enter[2]=="enter" and order_exit[2]=="exit" and\
                  order_enter[3]==order_exit[1] and order_enter[1]==order_exit[3]:

                ref+=1
                t_ref=ref
                # t_ref=int(order_exit[1])

            

                direction=None
                # direction
                if order_enter[5]=="Buy" and order_exit[5]=="Sell":
                    direction="long"
                elif order_enter[5]=="Sell" and order_exit[5]=="Buy":
                    direction="short"


                x_open = datetime.fromisoformat(order_enter[4])
                y_open = float(order_enter[10])
                
                x_close = None
                y_close = None

                # limit succeeded (take profit)
                if order_exit[6]=="Completed":
                    x_close = datetime.fromisoformat(order_exit[4])+timedelta(minutes=5)
                    y_close = float(order_exit[10])
                
                # exit at close market price
                elif order_exit[6]=="Canceled":
                    x_close = datetime.fromisoformat(day_order_close_all[4])
                    y_close = float(day_order_close_all[10])

                
                if direction=="long":
                    t_pnl = y_close-y_open
                        
                elif direction=="short":
                    t_pnl = -(y_close-y_open)

                day_pnl += t_pnl


                duration = x_close - x_open

                # trade's text
                color='green'
                if t_pnl<0:
                    color='red'

                # stat.
                if t_pnl>=0:
                    day_won+=1

                # info
                t_txt = f"{t_ref}, {direction[0].upper()}, ${round(t_pnl, 2)}, {duration}"

                
                ax.text(
                    # x=x_open,
                    x=datetime.fromisoformat(day_order_close_all[4])+timedelta(minutes=10),
                    y=ref,
                    s=t_txt,
                    color=color, 
                    fontsize=8, 
                    zorder=2,
                    # bbox={'facecolor': 'yellow', 'alpha': 0.5, 'pad': 1},
                )


                ax.plot([x_open, x_close], [ref]*2,  ls='-', linewidth=linewidth, color=color, alpha=alpha)
        

            else:
                raise ValueError(f"not a valid pair: 1st:({order_enter[1]}, {order_enter[2]}, {order_enter[3]}), 2nd:({order_exit[1]}, {order_exit[2]}, {order_exit[3]})")
            
    
        
        
        # ----------------------------------------------
        # summary: day's pln
        # print(f"[{day}] $ {round(day_pnl, 4)}, {round(100*day_won/ref)}%")
        print(f"{day}, {round(day_pnl, 4)}, {day_won/ref}")

        # info

        t_txt = f"$ {round(day_pnl, 4)}, {round(100*day_won/ref)}%"

        color='green'
        if day_pnl<0:
            color='red'

        ax.text(
            x=datetime.fromisoformat(day_order_close_all[4])+timedelta(minutes=10),
            y=-1,
            s=t_txt,
            color=color, 
            fontsize=12, 
            zorder=2,
            bbox={'facecolor': 'yellow', 'alpha': 0.5, 'pad': 1},
        )
        
            


        
# ----------------------------------------------
# plot trades
def plot_trades(ax: Axes, trades: pd.DataFrame):
    alpha=0.25

    # Index: 154 entries, 0 to 153
    # Data columns (total 9 columns):
    # #   Column                Non-Null Count  Dtype
    # ---  ------                --------------  -----
    # 0   open_datetime         154 non-null    datetime64[ns]
    # 1   open_executed_price   154 non-null    float64
    # 2   close_datetime        154 non-null    datetime64[ns]
    # 3   close_executed_price  154 non-null    float64
    # 4   type                  154 non-null    object
    # 5   size                  154 non-null    int64
    # 6   price_diff            154 non-null    float64
    # 7   percentage_diff       154 non-null    float64
    # 8   pnl                   154 non-null    float64
    # dtypes: datetime64[ns](2), float64(5), int64(1), object(1)
    # memory usage: 12.0+ KB
    # None
    #         open_datetime  open_executed_price      close_datetime  close_executed_price  type  size  price_diff  percentage_diff    pnl
    # id
    # 0   2022-08-25 16:30:00              168.800 2022-08-25 22:55:00               169.745  long     1       0.945         0.005598  0.945
    # 1   2022-08-25 16:35:00              169.140 2022-08-25 22:55:00               169.745  long     1       0.605         0.003577  0.605
    # 2   2022-08-25 16:40:00              169.400 2022-08-25 22:55:00               169.745  long     1       0.345         0.002037  0.345
    # 3   2022-08-25 16:45:00              169.670 2022-08-25 22:55:00               169.745  long     1       0.075         0.000442  0.075
    # 4   2022-08-25 16:50:00              169.150 2022-08-25 22:55:00               169.745  long     1       0.595         0.003518  0.595
    # ..                  ...                  ...                 ...                   ...   ...   ...         ...              ...    ...
    # 149 2022-08-26 22:30:00              164.490 2022-08-26 22:55:00               163.800  long     1      -0.690        -0.004195 -0.690
    # 150 2022-08-26 22:35:00              164.200 2022-08-26 22:55:00               163.800  long     1      -0.400        -0.002436 -0.400
    # 151 2022-08-26 22:40:00              164.155 2022-08-26 22:55:00               163.800  long     1      -0.355        -0.002163 -0.355
    # 152 2022-08-26 22:45:00              163.670 2022-08-26 22:55:00               163.800  long     1       0.130         0.000794  0.130
    # 153 2022-08-26 22:50:00              163.950 2022-08-26 22:55:00               163.800  long     1      -0.150        -0.000915 -0.150

    # [154 rows x 9 columns]

    
    
    for i, row in trades.iterrows():

        x_open = row["open_datetime"]
        y_open = row["open_executed_price"]
        
        x_close = row["close_datetime"]
        y_close = row["close_executed_price"]

        width = x_close - x_open
        height = y_close - y_open

        t_ref = row.name
        t_type = row["type"]
        t_pnl = row["pnl"]

        # profit + LONG
        if (t_pnl>0) and (t_type=="long"):
            edgecolor="green"
            facecolor="lime"
            hatch='///'

        # loss + LONG
        elif (t_pnl<0) and (t_type=="long"):
            edgecolor="red"
            facecolor='salmon'
            hatch='///'
        
        # profit + SHORT
        elif (t_pnl>0) and (t_type=="short"):
            edgecolor="green"
            facecolor="lime"
            hatch='\\\\\\'

        # loss + SHORT
        elif (t_pnl<0) and (t_type=="short"):
            edgecolor="red"
            facecolor='salmon'
            hatch='\\\\\\'
        
        # default colors
        else:
            edgecolor="blue"
            facecolor="navy"
            hatch="|"

        # trade's rectangle
        ax.add_patch(
            patches.Rectangle(
                xy=(x_open, y_open),
                width=width,
                height=height,
                linewidth=1, 
                edgecolor=edgecolor, 
                facecolor=facecolor,
                hatch=hatch,
                zorder=2, 
                alpha=0.25,
            )
        )

        # trade's text
        color='green'
        if t_pnl<0:
            color='red'

        # info
        # t_txt = t_ref
        t_txt = f"{t_ref}, {t_type[0].upper()}, ${round(t_pnl, 4)}"
        print(f"[{x_open}] {t_txt}")

        
        ax.text(
            x=x_open,
            y=y_open*1.001, # move position up 0.1%
            s=t_txt,
            color=color, 
            fontsize=12, 
            zorder=2,
            bbox={'facecolor': 'yellow', 'alpha': 0.5, 'pad': 1},
        )


# ----------------------------------------------
# just plot each trade
def plot_trades_duration(ax: Axes, trades: pd.DataFrame):
    alpha=0.50
    linewidth=1.5

    if not len(trades):
        return


        # Index: 154 entries, 0 to 153
    # Data columns (total 9 columns):
    # #   Column                Non-Null Count  Dtype
    # ---  ------                --------------  -----
    # 0   open_datetime         154 non-null    datetime64[ns]
    # 1   open_executed_price   154 non-null    float64
    # 2   close_datetime        154 non-null    datetime64[ns]
    # 3   close_executed_price  154 non-null    float64
    # 4   type                  154 non-null    object
    # 5   size                  154 non-null    int64
    # 6   price_diff            154 non-null    float64
    # 7   percentage_diff       154 non-null    float64
    # 8   pnl                   154 non-null    float64
    # dtypes: datetime64[ns](2), float64(5), int64(1), object(1)
    # memory usage: 12.0+ KB
    # None
    #         open_datetime  open_executed_price      close_datetime  close_executed_price  type  size  price_diff  percentage_diff    pnl
    # id
    # 0   2022-08-25 16:30:00              168.800 2022-08-25 22:55:00               169.745  long     1       0.945         0.005598  0.945
    # 1   2022-08-25 16:35:00              169.140 2022-08-25 22:55:00               169.745  long     1       0.605         0.003577  0.605
    # 2   2022-08-25 16:40:00              169.400 2022-08-25 22:55:00               169.745  long     1       0.345         0.002037  0.345
    # 3   2022-08-25 16:45:00              169.670 2022-08-25 22:55:00               169.745  long     1       0.075         0.000442  0.075
    # 4   2022-08-25 16:50:00              169.150 2022-08-25 22:55:00               169.745  long     1       0.595         0.003518  0.595
    # ..                  ...                  ...                 ...                   ...   ...   ...         ...              ...    ...
    # 149 2022-08-26 22:30:00              164.490 2022-08-26 22:55:00               163.800  long     1      -0.690        -0.004195 -0.690
    # 150 2022-08-26 22:35:00              164.200 2022-08-26 22:55:00               163.800  long     1      -0.400        -0.002436 -0.400
    # 151 2022-08-26 22:40:00              164.155 2022-08-26 22:55:00               163.800  long     1      -0.355        -0.002163 -0.355
    # 152 2022-08-26 22:45:00              163.670 2022-08-26 22:55:00               163.800  long     1       0.130         0.000794  0.130
    # 153 2022-08-26 22:50:00              163.950 2022-08-26 22:55:00               163.800  long     1      -0.150        -0.000915 -0.150

    # [154 rows x 9 columns]
    
    
   
    # iterate days

   
        
    total_pnl=0
    day_won=0
    
    j=0
    for i, row in trades.iterrows():

        duration: pd.Timedelta = row["close_datetime"] - row["open_datetime"]
        t_pnl=row["pnl"]

        # trade's text
        color='green'
        if t_pnl<0:
            color='red'

        # stat.
        if t_pnl>=0:
            day_won+=1

        # info
        # t_ref=row.name%77 # we place 77 enter orders per day in 5min bar timeframe (16:25 to 22:45)
        t_ref=row.name
        direction=row["type"]
        # t_txt = f"({t_ref}, {direction[0].upper()}, ${round(t_pnl, 2)}, {timedelta(seconds=duration.total_seconds())})"
        # t_txt = f"({t_ref}, {direction[0].upper()}, ${round(t_pnl, 2)}, {timedelta(seconds=duration.total_seconds())}, {row['open_executed_price']} --> {row['close_executed_price']} = {round(row['price_diff'], 2)})"
        t_txt = f'({row["close_datetime"]}, {direction[0].upper()}, ${round(t_pnl, 2)}, {timedelta(seconds=duration.total_seconds())})'

        
        ax.text(
            # x=x_open,
            # x=row["close_datetime"]+pd.Timedelta(minutes=5),
            x=row["close_datetime"].replace(hour=23, minute=5, second=0),
            y=j%77,
            s=t_txt,
            color=color, 
            fontsize=8, 
            zorder=2,
            # bbox={'facecolor': 'yellow', 'alpha': 0.5, 'pad': 1},
        )


        ax.plot([row["open_datetime"], row["close_datetime"]], [j%77]*2,  ls='-', linewidth=linewidth, color=color, alpha=alpha)
        j+=1 # y plot value


    # Group by date and sum the pnl column
    pnl_per_date_series: pd.Series = trades.groupby(trades['open_datetime'].dt.date)['pnl'].sum()
    if 0:
        print(pnl_per_date_series.info())
        print(pnl_per_date_series)
        sum = pnl_per_date_series.sum() # sum all dates
        print("-"*50)
        print(f"sum: {round(sum, 4)} ({len(pnl_per_date_series)} days)")
        print("-"*50)
        print()


        if 1:
            path = f"backtesting/outputs"
            output_filename = f"{path}/pnl_per_date_series.csv"
            timestamp = datetime.now().strftime("%d-%m-%Y_%H-%M-%S")
            match = re.search(r"\.\w+$", output_filename)
            file_extension = match.group()
            output_filename = output_filename.replace(file_extension, f"_{timestamp}{file_extension}")

            pnl_per_date_series.to_csv(output_filename)  
            print(f"exported: [{output_filename}]")



    for date, total_pnl in pnl_per_date_series.items():

        # print(f"{date}, {round(total_pnl, 4)}")

        # info

        t_txt = f"$ {round(total_pnl, 4)}"

        color='green'
        if total_pnl<0:
            color='red'

        ax.text(
            x=datetime.combine(date, time(hour=16, minute=30)),
            y=-2,
            s=t_txt,
            color=color, 
            fontsize=12, 
            zorder=2,
            bbox={'facecolor': 'yellow', 'alpha': 0.5, 'pad': 1},
        )


        
       
# ----------------------------------------------
def plot_trades_drawdown(ax: Axes, trades: pd.DataFrame, plot_text: bool=True):
    
    if not len(trades):
        return

    # init
    x: list[datetime] = []
    y: list[float] = []
    sum=0
    
    for i, row in trades.iterrows():

        x_open = row["open_datetime"]
        y_open = row["open_executed_price"]
        
        x_close = row["close_datetime"]
        y_close = row["close_executed_price"]
        
        t_ref = row.name
        t_type = row["type"]
        t_pnl = row["pnl"]


        x.append(x_open)
        x.append(x_close)
        y.append(sum) # before trade
        sum+=t_pnl
        y.append(sum) # after trade

        if plot_text:
            
            # trade's text
            color='green'
            if t_pnl<0:
                color='red'

            # info
            t_txt = t_ref
            t_txt = f"{t_ref}, {t_type[0].upper()}, ${t_pnl}"

            
            ax.text(
                x=x_open,
                y=sum,
                s=t_txt,
                color=color, 
                fontsize=12, 
                zorder=2,
                bbox={'facecolor': 'yellow', 'alpha': 0.5, 'pad': 1},
            )

    ax.plot(x, y, marker='o')
    

    # Group by date and sum the pnl column
    pnl_per_date_series: pd.Series = trades.groupby(trades['open_datetime'].dt.date)['pnl'].sum()
    pnl_per_date_series_win: pd.Series = pnl_per_date_series[pnl_per_date_series>=0]
    pnl_per_date_series_lost: pd.Series = pnl_per_date_series[pnl_per_date_series<0]

    



    for date, total_pnl in pnl_per_date_series.items():

        # print(f"{date}, {round(total_pnl, 4)}")

        # info

        t_txt = f"$ {round(total_pnl, 4)}"

        color='green'
        if total_pnl<0:
            color='red'

        ax.text(
            x=datetime.combine(date, time(hour=16, minute=30)),
            y=-2,
            s=t_txt,
            color=color, 
            fontsize=12, 
            zorder=2,
            bbox={'facecolor': 'yellow', 'alpha': 0.5, 'pad': 1},
        )


    # plot info
    txt=""
    txt+=f'symbol: {trades.iloc[0]["symbol"]}'
    txt+=f"\n"
    txt+=f"sum: {round(pnl_per_date_series.sum(), 4)} (expectancy, $)"
    txt+=f"\n"
    txt+=f"mean: {round(pnl_per_date_series.mean(), 4)} (average expectancy, $/trade)"
    txt+=f"\n"
    txt+=f"median: {round(pnl_per_date_series.median(), 4)}"
    txt+=f"\n"
    txt+=f"max: {round(pnl_per_date_series.max(), 4)}"
    txt+=f"\n"
    txt+=f"min: {round(pnl_per_date_series.min(), 4)}"
    txt+=f"\n"
    txt+=f"total: {len(pnl_per_date_series)} (100%), ${round(pnl_per_date_series.sum(), 4)} (expectancy)"
    txt+=f"\n"
    txt+=f"won: {len(pnl_per_date_series_win)} ({round(100*len(pnl_per_date_series_win)/len(pnl_per_date_series), 2)}%), ${round(pnl_per_date_series_win.sum(), 2)}"
    txt+=f"\n"
    txt+=f"lost: {len(pnl_per_date_series_lost)} ({round(100*len(pnl_per_date_series_lost)/len(pnl_per_date_series), 2)}%), ${round(pnl_per_date_series_lost.sum(), 2)}"
    txt+=f"\n"
    txt+=f"profit factor: {round(abs(pnl_per_date_series_win.sum()/pnl_per_date_series_lost.sum()), 2)}"

    ax.text(
        x=pnl_per_date_series.index[0],
        y=pnl_per_date_series.sum()/2,
        s=txt,
        color="b", 
        fontsize=10,
    )

    if 1:
        print(pnl_per_date_series.info())
        print(pnl_per_date_series)
        print("-"*50)
        print(txt)
        print("-"*50)
        print()

    ax.axhline(
        y=pnl_per_date_series.mean(), 
        label=f"mean: {round(pnl_per_date_series.mean(), 4)} (average expectancy, $/trade)",
        color="tab:orange", 
        linestyle='--', 
        linewidth=1,
    )
    
    
    



# ----------------------------------------------
def plot_trades_as_bars(ax: Axes, trades: pd.DataFrame):
    
    if not len(trades):
        return

    # Group by date and sum the pnl column
    pnl_per_date_series: pd.Series = trades.groupby(trades['open_datetime'].dt.date)['pnl'].sum()
    # pnl_per_date_series: pd.Series = trades.groupby(trades['close_datetime'].dt.date)['pnl'].sum()
    ax.bar(
        x=pnl_per_date_series.index, 
        height=pnl_per_date_series.values, 
        color=['tab:green' if v >= 0 else 'tab:red' for v in pnl_per_date_series.values],
        align="edge",
    )

    


