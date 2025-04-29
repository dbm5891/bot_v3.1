# ============================================================
# CSV
# ============================================================

# export list of tuples to a csv file
import csv
from datetime import datetime, timedelta
import re


def list_tuple_to_csv(header: list[str], list_tuples: list[tuple], output_filename: str, append_timestamp: bool = False):

    if not list_tuples:
        print(f"empty list, nothing to export.")
        return
    
    # append timestamp suffix (before extension)
    if append_timestamp:
        timestamp = datetime.now().strftime("%d-%m-%Y_%H-%M-%S")
        match = re.search(r"\.\w+$", output_filename)
        file_extension = match.group()
        output_filename = output_filename.replace(file_extension, f"_{timestamp}{file_extension}")

    with open(output_filename, 'w', encoding='UTF8', newline='') as f:
        writer = csv.writer(f)

        # write the header
        if header:
            writer.writerow(header)

        for t in list_tuples:
            
            # write a row
            writer.writerow(t)

    # print(f"exported: [{output_filename}]")

    regex = "(\w+\/)(\w+\/)(.+.csv)"
    res = re.search(regex, output_filename)

    if res:
        print("-"*50)
        print(f"list_tuples ({len(list_tuples)} rows) exported to csv file:")
        print(f"{res.group(1)}{res.group(2)}")
        print(res.group(3))
        print()

    # example:
    # csv file exported to:
    # backtesting/outputs/
    # StrategyEachBar_Short_orders_11-02-2025_16-11-31.csv
            
                





# can filter by time range
def trades_info_csv_to_list_tuple(filename_csv: str, time_begin: datetime, time_end: datetime):

    tuples: list[tuple] = []

    print(f"reading csv file... ({filename_csv})")
    with open(filename_csv, "r") as f:

        reader = csv.DictReader(f)

        for i, row in enumerate(reader):

            t=(
                row["method"],
                row["ref"],
                row["type"],
                row["status"],
                row["open"],
                row["close"],
                row["size"],
                row["open price"],
                row["close price"],
                row["diff price"],
                row["percentage"],
                row["pnl"],
            )
            if datetime.fromisoformat(row["open"])>time_begin and datetime.fromisoformat(row["open"])<time_end:
                tuples.append(t)

    return tuples




# can filter by time range
def get_pnl_from_trades_info(list_tuples: list[tuple], time_begin: datetime, time_end: datetime):

    pnl=0
    for t in list_tuples:
        # t[4] = t_open_datetime
        # t[5] = t_close_datetime
        if datetime.fromisoformat(t[5])>time_begin and datetime.fromisoformat(t[5])<time_end:
            pnl+=eval(t[11])
    return pnl



# can filter by time range
def positions_info_csv_to_list_tuple(filename_csv: str, time_begin: datetime, time_end: datetime):

    tuples: list[tuple] = []

    print(f"reading csv file... ({filename_csv})")
    with open(filename_csv, "r") as f:

        reader = csv.DictReader(f)

        for i, row in enumerate(reader):

            t=(
                row["method"],
                row["datetime"],
                row["size"],
                row["open_price"],
                row["adjbase_price"],
                row["percentage"],
                row["init_cost"],
                row["curr_cost"],
                row["curr_pnl"],
            )
            if datetime.fromisoformat(row["datetime"])>time_begin and datetime.fromisoformat(row["datetime"])<time_end:
                tuples.append(t)

    return tuples


# can filter by time range
def orders_info_csv_to_list_tuple(filename_csv: str, time_begin: datetime, time_end: datetime):

    tuples: list[tuple] = []

    print(f"reading csv file... ({filename_csv})")
    with open(filename_csv, "r") as f:

        reader = csv.DictReader(f)

        for i, row in enumerate(reader):

            # skip order
            if not row["executed_datetime"]:
                continue

            t=(
                row["method"],
                row["ref"],
                row["pair_type"],
                row["pair_order_ref"],
                row["executed_datetime"],
                row["order_type"],
                row["status"],
                row["size"],
                row["executed_size"],
                row["price"],
                row["executed_price"],
                row["executed_value"],
                row["exec_type"],
                
            )

            if datetime.fromisoformat(row["executed_datetime"])>time_begin and datetime.fromisoformat(row["executed_datetime"])<time_end:
                tuples.append(t)

    return tuples

# can filter by time range
def get_pnl_from_orders_info(orders_info: list[tuple], time_begin: datetime, time_end: datetime):

    pnl=0
    ref=0
    # TODO: per day
    order_close_all = orders_info[-1] # close market exit price


    for i in range(0, len(orders_info)-1, 2):


        order_enter=orders_info[i] # buy
        order_exit=orders_info[i+1] # sell

        ref+=1 # count trades

        direction=None
        # direction
        if order_enter[3]=="Buy" and order_exit[3]=="Sell":
            direction="long"
        elif order_enter[3]=="Sell" and order_exit[3]=="Buy":
            direction="short"


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

        if x_open>time_begin and x_close<time_end:
            if direction=="long":
                pnl += y_close-y_open
                
            elif direction=="short":
                pnl += -(y_close-y_open)

        
    return pnl, ref

        

