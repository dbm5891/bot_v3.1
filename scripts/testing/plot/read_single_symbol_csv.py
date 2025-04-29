import os
import sys
import pandas as pd
from datetime import datetime, timedelta



# ----------------------------------------------
cwd = os.getcwd()
sys.path.append(f"{cwd}")
sys.path.append(f"{cwd}\\backtesting")
sys.path.append(f"{cwd}\\backtesting\\functional")



# ----------------------------------------------
# read 5min timeframe data


path = f"{cwd}\\data_2020_2025\\symbols"
filename="GM_5min_eth_2020-04-01_to_2025-04-10.csv" # month step
filename="APA_5min_eth_2020-04-01_to_2025-04-10.csv" # month step
filename="AAPL_5min_eth_2020-04-01_to_2025-04-10.csv" # month step


# path = f"{cwd}\\data_2020_2025\\indexes"
# filename="VXX_5min_eth_2020-04-01_to_2025-04-10.csv" # month step

df_5m = pd.read_csv(f"{path}/{filename}", parse_dates=["timestamp"])
df_5m = df_5m.set_index("timestamp")
df_5m.sort_index(ascending=True, inplace=True)
df_5m = df_5m.ffill()  # Forward-fill the NaN values



from backtesting.functional.dataframes import print_df
print_df(df_5m)
