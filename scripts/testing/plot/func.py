from datetime import time, timedelta
from matplotlib.axes import Axes
import pandas as pd
from dataclasses import dataclass

#  represent on which subplot to plot and how
@dataclass
class Plotter:
    subplot: str=None # subplot name
    order: int=None # subplot order from top to bottom (0 is topmost) # TODO
    subplot_title: str=None # subplot title
    df: pd.DataFrame=None # the data
    column: str=None # column name to plot
    label: str=None # label in legend
    marker: str=None
    markersize: int=8
    color: str=None
    facecolor: str=None # background color for a subplot
    alpha: float=1
    linestyle: str=None

@dataclass
class Plotter_daily_vlines:
    subplot: str=None # subplot name
    df: pd.DataFrame=None # the data
    column: str=None # column name to plot
    y_min: float=None
    y_max: float=None







# plot daily boundries at UTC time
# open          utc     israel (utc+3)
# pre market    8:00    11:00
# market        13:30   16:30
# after hours   20:00   23:00
# market close  0:00    03:00

def plot_vlines(
        ax: Axes, 
        df: pd.DataFrame,
        column: str="close", # default column for daily max/min Y values
        color="grey", # boundries color
        alpha=0.50,
        linewidth=1,
        y_min=None,
        y_max=None,
    ):

    # extract trading days
    dates: list[pd.Timestamp] = df.index.normalize().unique()
    # print(dates)
    # print(f"count unique trading dates: {len(dates)}")

    colors=[color, "black", "black", color]

    # iterate trading days
    for date in dates:

        # get daily data
        time_begin = date
        time_end = date.replace(hour=23, minute=55)
        df_date = df.loc[time_begin:time_end]

            
        # utc time
        for i,t in enumerate([
            time(hour=8, minute=0, second=0),
            time(hour=13, minute=30, second=0),
            time(hour=20, minute=0, second=0),
            time(hour=23, minute=59, second=59),
        ]):
            
            ax.vlines(
                x=date.replace(hour=t.hour, minute=t.minute, second=t.second),
                ymin=df_date[column].min() if y_min is None else y_min,
                ymax=df_date[column].max() if y_max is None else y_max,
                color=colors[i],
                linewidth=linewidth,
                alpha=alpha,
            )







# smoothed moving averages (SMMA)
def smma(series: pd.Series, period: int):
    return series.ewm(alpha=1/period, adjust=False).mean()