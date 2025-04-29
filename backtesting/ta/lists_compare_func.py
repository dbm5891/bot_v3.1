import os
import sys
import ast
import time
from matplotlib.artist import Artist
from matplotlib.axes import Axes
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from matplotlib import pyplot as plt
from scipy.spatial.distance import cdist

def hausdorff_distance(A, B):
    """
    Calculate the Hausdorff distance between two sets of points A and B.
    A and B are arrays of shape (n_points, 2), representing points in 2D space.
    """
    # Compute all pairwise distances between points in A and points in B
    dists = cdist(A, B, metric='euclidean')
    
    # For each point in A, find the closest point in B, and vice versa
    forward_distance = np.max(np.min(dists, axis=1))
    backward_distance = np.max(np.min(dists, axis=0))
    
    # Hausdorff distance is the maximum of the forward and backward distances
    return max(forward_distance, backward_distance)




# ----------------------------------------------

def read_csv() -> pd.DataFrame:
    cwd = os.getcwd()
    sys.path.append(f"{cwd}\\bot")
    path = f"{cwd}\\scripts\\outputs_sim\\csv_candles_5min"
    # path = f"{cwd}\\backtesting\\csv_input"
    files=[
        # "aapl_2022-05-09_to_2022-05-13_basic_data.csv", # one week
        # "aapl_2022-05-09_to_2022-05-31_basic_data.csv", # one month
        # "aapl_2022-05-09_to_2023-07-12_basic_data.csv",
        # "aapl_HistoricalData_c1d_p5y.csv",

        "candles_ruler_valid_only_AAPL_2022-05-09_to_2023-07-12.csv",
        # "candles_ruler_valid_only_TSLA_2022-05-09_to_2023-07-12.csv",
        # "candles_ruler_valid_only_BAC_2022-05-09_to_2023-07-12.csv",
        # "candles_ruler_valid_only_NVDA_2022-05-09_to_2023-07-12.csv",
        # "candles_ruler_valid_only_MSFT_2022-05-09_to_2023-07-12.csv",
        # "candles_ruler_valid_only_AMD_2022-05-09_to_2023-07-12.csv",
        # "candles_ruler_valid_only_AAL_2022-05-09_to_2023-07-12.csv",
    ]


    print(f"="*50)

    # Start time
    start_time = time.time()

    # Read all CSV files
    # dataframes = [pd.read_csv(f"{path}/{file}") for file in files]
    dataframes = []

    for i, filename in enumerate(files):

        print(f"{i}) {filename}")
        curr_df = pd.read_csv(f"{path}/{filename}", parse_dates=["ruler_time_begin", "ruler_time_end"])
        
        # TODO: calc it with pandas_ta / backtrader indicators (not manualy)
        if 0:
            curr_df['sma_period_20'] = pd.to_numeric(curr_df['sma_period_20'], errors='coerce')
            curr_df['sma_period_50'] = pd.to_numeric(curr_df['sma_period_50'], errors='coerce')
            curr_df['sma_period_192'] = pd.to_numeric(curr_df['sma_period_192'], errors='coerce')
        
        dataframes.append(curr_df)
        # print(curr_df)
        
    # Concatenate all DataFrames
    df = pd.concat(dataframes, ignore_index=True)



    # Calculate runtime
    curr_time = time.time()
    runtime = round(curr_time - start_time, 2)
    print(f"Runtime: {runtime} seconds")

    print(f"="*50)
    print(df)
    print(f"="*50)
    df.reset_index(drop=True)
    print(df.info())

    return df



# ----------------------------------------------
# plot lists from same day

def plot_lists(lists):


    if not lists:
        print(f"not lists to plot.")
        return

    for i, (lst, marker, label, zorder) in enumerate(lists):

        x=[i for i, v in enumerate(lst)]
        y=lst

        
        label=f"{i}) {label}"
        plt.plot(x, y, marker, label=label, zorder=zorder)
        print(label)


    print(f"="*50)
    list_under_test_txt=lists[0][2]
    title=f"list_under_test_txt = {list_under_test_txt}, similar_lists ({len(lists)-1})"
    print(title)

    # TODO: stat
    if 0:
        total_lists=0
        print(f"total_lists iterated={total_lists}")
        print(f"similar_lists={len(lists)-1}")
        percent=round((len(lists)-1)/total_lists*100, 2)
        print(f"percent={percent}%")

    # plot graph
    plt.axvline(x=66, linewidth=3, color="grey", linestyle='-.')
    plt.axvline(x=66+78, linewidth=3, color="grey", linestyle='-.')
    plt.legend(loc='best')
    plt.title(title)
    plt.grid()
    plt.show()


# ----------------------------------------------
# plot rows

def plot_rows(rows: list[dict], title: str="", print_label: bool=False):

    
    if not rows:
        print(f"not lists to plot.")
        return
    
    print("="*50)
    print(f"plot_rows: {title}")
    print("="*50)

    for i, row in enumerate(rows):

        if not "gaussian_f1d_sigma_10_percentage" in row:
            continue

        lst=row["gaussian_f1d_sigma_10_percentage"]
        x=[i for i, v in enumerate(lst)]
        y=lst

        
        label=f'{i}) {row["symbol"]} {row["ruler_time_end"]} ({len(lst)})'
        if "plot_attributes_label" in row:
            label += f' {row["plot_attributes_label"]}'
        
        marker=""
        if "plot_attributes_marker" in row:
            marker=row["plot_attributes_marker"]
        
        zorder=0
        if "plot_attributes_zorder" in row:
            zorder=row["plot_attributes_zorder"]
        
        color=None
        if "plot_attributes_color" in row:
            color=row["plot_attributes_color"]

        alpha=1
        if "plot_attributes_alpha" in row:
            alpha=row["plot_attributes_alpha"]


        plt.plot(x, y, marker, color=color, label=label, alpha=alpha, zorder=zorder)
        if print_label:
            print(label)


    
    # Set axis limits
    if 0:
        plt.xlim(0, 192)  # Set x-axis limits from 0 to 5
        plt.ylim(-7, 3) # Set y-axis limits from 0 to 20

    # plot graph
    plt.axvline(x=66, linewidth=3, color="grey", linestyle='-.')
    plt.axvline(x=66+78, linewidth=3, color="grey", linestyle='-.')
    plt.legend(loc='best')
    plt.title(title)
    plt.grid()
    plt.show()


# ----------------------------------------------
# plot rows

def plot_rows_key(
        ax: Axes,
        rows: list[dict],
        base_time: datetime=None,
        title: str="", 
        print_label: bool=False, 
        key: str="close",
    ):
    
    if not rows:
        print(f"not lists to plot.")
        return
    
    print("="*50)
    print(f"plot_rows ({len(rows)}): {title}")
    print("="*50)

    x=[]
    y=[]
    # collect data
    for i, row in enumerate(rows):

        if base_time:
            # take only the time part (normalize to base_time)
            x.append(row["ruler_time_end"].replace(year=base_time.year, month=base_time.month, day=base_time.day))
        else:
            x.append(row["ruler_time_end"])

        # skip
        if key in row:
            y.append(row[key])
        else:
            y.append(None)


    # plot data
    # label=f'{rows[0]["symbol"]} {rows[0]["ruler_time_end"]} to {rows[-1]["symbol"]} {rows[-1]["ruler_time_end"]} ({len(y)})'
    label=f'{rows[0]["symbol"]} {rows[0]["ruler_time_end"]}: {key}'
    if "plot_attributes_label" in row:
        label += f' {row["plot_attributes_label"]}'
    
    marker=""
    if "plot_attributes_marker" in row:
        marker=row["plot_attributes_marker"]
    
    zorder=0
    if "plot_attributes_zorder" in row:
        zorder=row["plot_attributes_zorder"]
    
    color=None
    if "plot_attributes_color" in row:
        color=row["plot_attributes_color"]

    alpha=1
    if "plot_attributes_alpha" in row:
        alpha=row["plot_attributes_alpha"]


    ax.plot(x, y, marker, color=color, label=label, alpha=alpha, zorder=zorder)
    if print_label:
        print(label)


    
    

# ----------------------------------------------
def plot_axvline(ax: Axes, dt: datetime):
    ax.axvline(x=dt.replace(hour=11, minute=0, second=0), ls='-', linewidth=1, color="yellow")
    ax.axvline(x=dt.replace(hour=16, minute=30, second=0), ls='-', linewidth=2, color="black")
    ax.axvline(x=dt.replace(hour=23, minute=0, second=0), ls='-', linewidth=2, color="black")
    ax.axvline(x=dt.replace(hour=23, minute=0, second=0)+timedelta(hours=4), ls='-', linewidth=1, color="deepskyblue")





# ----------------------------------------------
def to_percentage(lst):
    # return lst # debug

    # percentages = [(v / max(lst)) * 100 for v in lst]  # Convert each value to a percentage related to max value in list
    # percentages = [((v-min(lst)) / (max(lst)-min(lst))) * 100 for v in lst]  # normalize_list [0,1]
    percentages = [((v-lst[0]) / lst[0]) * 100 for v in lst]  # percentage change related to *first item* in list
    return percentages



# ----------------------------------------------
def get_list(df: pd.DataFrame, symbol: str, time: datetime) -> list:
    filtered_df = df[(df['ruler_time_end'] == time) & (df['symbol'] == symbol)] # <class 'pandas.core.frame.DataFrame'>
    print(filtered_df)

    test_row=filtered_df.iloc[0] # <class 'pandas.core.series.Series'>

    # tested list
    list_under_test_txt=f"[{symbol}][{time}]"

    # Convert the string to a list using ast.literal_eval()
    list_under_test = ast.literal_eval(test_row["gaussian_f1d_sigma_10"])

    return list_under_test

# ----------------------------------------------
def get_row(df: pd.DataFrame, symbol: str, time: datetime) -> dict:
    filtered_df = df[(df['ruler_time_end'] == time) & (df['symbol'] == symbol)] # <class 'pandas.core.frame.DataFrame'>
    # print(filtered_df)
    if filtered_df.empty:
        print("filtered dataFrame is empty.")
        return {}

    row_dict=filtered_df.iloc[0].to_dict()
    
    # skip nan
    if not pd.isna(row_dict["gaussian_f1d_sigma_10"]):
        row_dict["gaussian_f1d_sigma_10"]=ast.literal_eval(row_dict["gaussian_f1d_sigma_10"]) # Convert the string to a list
        row_dict["gaussian_f1d_sigma_10_percentage"]=to_percentage(row_dict["gaussian_f1d_sigma_10"])

    return row_dict

# ----------------------------------------------
def get_lists(df: pd.DataFrame, time: datetime) -> list[tuple]:
    # rows with the same time (hh:mm)
    filtered_df = df[(df['ruler_time_end'].dt.hour == time.hour) & (df['ruler_time_end'].dt.minute == time.minute)]
    print(filtered_df)
    
    filtered_lists=[]
    for index, row in filtered_df.iterrows():
        # print(row) # Series
        value=row["gaussian_f1d_sigma_10"]
        # skip nan
        if pd.isna(value):
            continue
        y = ast.literal_eval(value)
        y=to_percentage(y)
        t=(y, "", f'[{row["symbol"]}][{row["ruler_time_end"]}] ({len(y)})', 0)
        filtered_lists.append(t)
        # print(y)

    return filtered_lists




    
# ----------------------------------------------
def get_rows(df: pd.DataFrame, time: datetime) -> list[dict]:
    # rows with the same time (hh:mm)
    filtered_df = df[(df['ruler_time_end'].dt.hour == time.hour) & (df['ruler_time_end'].dt.minute == time.minute)]
    # print(filtered_df)
    
    rows: list[dict]=[]
    for index, row in filtered_df.iterrows():

        row_dict=row.to_dict()
        if not pd.isna(row["gaussian_f1d_sigma_10"]):
            row_dict["gaussian_f1d_sigma_10"]=ast.literal_eval(row_dict["gaussian_f1d_sigma_10"]) # Convert the string to a list
            row_dict["gaussian_f1d_sigma_10_percentage"]=to_percentage(row_dict["gaussian_f1d_sigma_10"])
        rows.append(row_dict)

    return rows



    
# ----------------------------------------------
# get candles (each row represent a candle)
def get_rows_range(df: pd.DataFrame, symbol: str, time_begin: datetime, time_end: datetime) -> list[dict]:
    # rows with the same time (hh:mm)
    filtered_df = df[(df['symbol'] == symbol) & (df['ruler_time_end'] >= time_begin) & (df['ruler_time_end'] <= time_end)]
    # print(filtered_df)
    
    rows: list[dict]=[]
    for index, row in filtered_df.iterrows():

        row_dict=row.to_dict()
        if not pd.isna(row["gaussian_f1d_sigma_10"]):
            row_dict["gaussian_f1d_sigma_10"]=ast.literal_eval(row_dict["gaussian_f1d_sigma_10"]) # Convert the string to a list
            row_dict["gaussian_f1d_sigma_10_percentage"]=to_percentage(row_dict["gaussian_f1d_sigma_10"])
        rows.append(row_dict)

    return rows







    


# ----------------------------------------------
def find_similar_lists(list_under_test: list[float], lists_same_time: list[tuple]):
    
    similar_lists: list[tuple]=[]
    atol=0.75
    # atol=3
    hausdorff_distances=[]


    for i, (lst, marker, label, zorder) in enumerate(lists_same_time):

        x_axis=[i for i, v in enumerate(lst)]
        y=curr_list=lst

        label=f"{i}) {label}"
        print(label)

        if len(list_under_test) != len(curr_list):
            print(f"lists must be with same length: {label} ({len(list_under_test)}) != ({len(curr_list)})")
            continue

        # compare lists:

        
        if 1:
            # res: np.ndarray=np.array(curr_list)>=np.array(list_under_test)
            res: np.ndarray=np.isclose(np.array(list_under_test), np.array(curr_list), atol=atol)
            if res.all():
                print(f"found similar list: {label} ({len(curr_list)}) {curr_list[-5:]}")
                similar_lists.append((lst, marker, f"{label}, atol={atol}", zorder))

        
        
        # hausdorff_distance
        if 0:
            A = np.array([[x, y] for x, y in zip(x_axis, list_under_test)])
            B = np.array([[x, y] for x, y in zip(x_axis, curr_list)])
            distance = hausdorff_distance(A, B)
            print("Hausdorff Distance:", distance)
            hausdorff_distances.append(distance)
            if distance<=4:
                similar_lists.append((lst, marker, f"{label}, hausdorff_distance={distance}", zorder))

    print("sorted(hausdorff_distances):")
    print(sorted(hausdorff_distances))


        

    return similar_lists



# ----------------------------------------------


# ----------------------------------------------
# return rows that close enough to 'row'
def compare_rows_isclose(row: dict, rows: list[dict], atol=1) -> list[dict]:
    
    similar_rows: list[dict]=[]

    lst=row["gaussian_f1d_sigma_10_percentage"]
    label=f'{row["symbol"]} {row["ruler_time_end"]} ({len(lst)})'

    for r in rows:

        # skip self
        if row["symbol"]==r["symbol"] and row["ruler_time_end"]==r["ruler_time_end"]:
            print("skip self")
            continue

        if not "gaussian_f1d_sigma_10_percentage" in r:
            continue

        curr_lst=r["gaussian_f1d_sigma_10_percentage"]
        # x_axis=[i for i, v in enumerate(lst)]
        # y=curr_lst

        if len(lst) != len(curr_lst):
            print(f"lists must be with same length: {label} ({len(lst)}) != ({len(curr_lst)})")
            continue

        # compare lists:
        if 1:
            res: np.ndarray=np.array(lst)>=np.array(curr_lst)
            # res: np.ndarray=np.isclose(np.array(lst), np.array(curr_lst), atol=atol)
            if res.all():
                print(f"found similar list: {label} ({len(curr_lst)}) (np.isclose.atol={atol})")
                similar_rows.append(r)

    return similar_rows





# ----------------------------------------------
# plot rows: OHLC4_from_day_begin

def plot_rows_key_from_day_begin(
        ax: Axes,
        rows: list[dict], 
        base_time: datetime,
        row_key: str="OHLC4_from_day_begin",
        title: str="", 
        print_label: bool=False,
    ):

    
    if not rows:
        print(f"not lists to plot.")
        return
    
    print("="*50)
    print(f"plot_rows: {title}")
    print("="*50)

    for i, row in enumerate(rows):

        # unpack the zipped list into two separate lists
        x, y = zip(*row[row_key])

        # take only the time part (normalize to base_time)
        x=[dt.replace(year=base_time.year, month=base_time.month, day=base_time.day) for dt in x]
        

        label=f'{i}) {row["symbol"]} {row["ruler_time_end"]} ({len(x)}) ({row_key})'
        if "plot_attributes_label" in row:
            label += f' {row["plot_attributes_label"]}'
        
        marker=""
        if "plot_attributes_marker" in row:
            marker=row["plot_attributes_marker"]
        
        zorder=0
        if "plot_attributes_zorder" in row:
            zorder=row["plot_attributes_zorder"]
        
        color=None
        if "plot_attributes_color" in row:
            color=row["plot_attributes_color"]

        alpha=1
        if "plot_attributes_alpha" in row:
            alpha=row["plot_attributes_alpha"]

        # check if the list contains NaN
        if any(np.isnan(v) for v in y):
            print(f"{label}: y-list contains nan (skip plot)")
            continue

        ax.plot(x, y, marker, color=color, label=label, alpha=alpha, zorder=zorder)
        if print_label:
            print(label)


    
