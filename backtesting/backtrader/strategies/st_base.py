import inspect
import backtrader as bt
from datetime import datetime, time


class StrategyBase(bt.Strategy):

    params = dict(
        take_profit_usd=None,
        stop_loss_usd=None,
    )

    def __init__(self):
        self.trades: list[bt.trade.Trade] = []
        self.trades_info: list[tuple] = [] # trade's info only, more readable
        self.positions_info: list[tuple] = [] # position's info, view potential pnl
        self.orders: list[bt.Order] = []   # list to track executed buy orders and their sell limits

        self.data_5m: bt.feeds.pandafeed.PandasData = self.datas[0]
        self.data_1d: bt.feeds.pandafeed.PandasData = None
        if len(self.datas)==2:
            self.data_1d = self.datas[1]
        
        self.data_1d_curr_date = None
        self.data_1d_prev_date = None

        # use UTC time
        self.premarket_open = time(hour=8, minute=0)
        self.market_open = time(hour=13, minute=30)
        self.market_close = time(hour=20, minute=0)
        self.after_hours_close = time(hour=23, minute=59)

        self.set_tradehistory(True)

        
    def log(self, txt=""):
        prefix=""
        
        if self.data_1d:
            prefix+=f"[1D]: {self.data_1d.datetime.datetime(0)}, {self.data_1d._name}, (o={self.data_1d.open[0]}, h={self.data_1d.high[0]}, l={self.data_1d.low[0]}, c={self.data_1d.close[0]}), "
        
        prefix+=f"[5m]: {self.data_5m.datetime.datetime(0)}, {self.data_5m._name}, (o={self.data_5m.open[0]}, h={self.data_5m.high[0]}, l={self.data_5m.low[0]}, c={self.data_5m.close[0]})"
        print(f"{prefix}: {txt}")


    def notify_order(self, order: bt.order.Order):


        # init new attributes:
        # save current time to order
        notify_dt: datetime =self.data_5m.datetime.datetime()
        order.notify_dt = notify_dt
        # order.pair_type = None # ['enter', 'exit']
        # order.pair_order_ref = 0 # partner's ref (id)
        self.orders.append(order)

        # close pending orders
        if 0:
            current_time: time=self.data_5m.datetime.time()
            if current_time>=self.market_close:
                self.cancel_all_orders()

        order_info=(
            inspect.currentframe().f_code.co_name,
            order.ref,
            order.ordtypename(),   # ['Buy', 'Sell']
            order.getstatusname(), # ['Created', 'Submitted', 'Accepted', 'Partial', 'Completed', 'Canceled', 'Expired', 'Margin', 'Rejected']
            order.size,
            order.executed.size,
            order.executed.price,
            round(order.executed.value, 2),
            order.getordername(),  # ['Market', 'Close', 'Limit', 'Stop', 'StopLimit', 'StopTrail', 'StopTrailLimit', 'Historical']
        )

        self.log(order_info)




    

    def notify_trade(self, trade: bt.trade.Trade):

        trade_info=(
            inspect.currentframe().f_code.co_name,
            trade.ref,
            self.data_5m._name,
            "long" if (trade.history[0].event.size>0) else "short",
            bt.trade.Trade.status_names[trade.status], # ['Created', 'Open', 'Closed']
            f"{trade.open_datetime()}", 
            f"{trade.close_datetime()}" if trade.isclosed else None, 
            # f"{trade.baropen} -> {trade.barclose if trade.barclose else None}",
            trade.history[0].event.size, 
            trade.history[0].event.price, # enter price
            trade.history[-1].event.price if trade.isclosed else None, # exit price
            round(trade.history[-1].event.price - trade.history[0].event.price, 4) if trade.isclosed else None, # diff price
            round(100*(trade.history[-1].event.price-trade.history[0].event.price)/trade.history[0].event.price, 2) if trade.isclosed else None, # percentage
            round(trade.pnl, 2),
        )
        
        self.log(trade_info)
        
        if trade.isclosed:
            self.trades.append(trade)
            self.trades_info.append(trade_info)

        
    # filter trades by date part only
    def get_trades_by_close_date(self, close_date: datetime):
        filtered_trades: list[bt.trade.Trade] = []
        for t in self.trades:
            if t.isclosed and t.close_datetime().date() == close_date.date():
                filtered_trades.append(t)

        return filtered_trades
    


    def get_position_info(self) -> tuple:

        current_time: time=self.data_5m.datetime.datetime()

        position_init_cost = self.position.size * self.position.price
        position_curr_cost = (self.position.size * self.position.adjbase) if self.position.adjbase else 0
        curr_pnl = (position_curr_cost - position_init_cost) if position_curr_cost else 0

        position_info=(
            inspect.currentframe().f_code.co_name,
            current_time,
            self.position.size,
            self.position.price,
            self.position.adjbase,
            round(100*(self.position.adjbase-self.position.price)/self.position.price, 2) if (self.position.adjbase and self.position.price) else 0, # percentage
            round(position_init_cost, 2),
            round(position_curr_cost, 2),
            round(curr_pnl, 2),
        )

        self.positions_info.append(position_info)

        return position_info



    
    def allow_trade(self) -> bool:
        prefix=inspect.currentframe().f_code.co_name
        current_time: time=self.data_5m.datetime.time()

        # trading boundries
        if current_time<self.market_open or current_time>=self.market_close:
            txt=f"[{prefix}] not RTH (don't trade)"
            # self.log(txt)
            return False
        
        txt=f"[{prefix}] RTH... {self.get_position_info()}"
        # self.log(txt)

        return True
    

    def allow_place_new_order(self) -> bool:
        current_time: time=self.data_5m.datetime.time()
        if (current_time<self.market_open) or (current_time>=self.market_close):
            txt="don't place new orders (anymore?)"
            self.log(txt)
            return False
        
        return True
    
    def close_positions_market_close(self):
        # close open position at market close
        current_time: time=self.data_5m.datetime.time()
        if self.position and current_time>=self.market_close:
            canceled_orders: list[bt.Order]=self.cancel_all_orders()
            enter_orders_ids=[o.pair_order_ref for o in canceled_orders]

            self.order = self.close(data=self.data_5m)
            
            self.order.pair_order_ref = enter_orders_ids # ids of orders that we exit (close)
            self.order.pair_type = "exit (market_close)"

            self.log(f"[EXIT] [order.ref={self.order.ref} placed: CLOSE] (market close)")
            # self.orders.append(self.order)


    # cancel pending orders
    def cancel_all_orders(self) -> list[bt.Order]:
        canceled_orders: list[bt.Order]=[]
        for o in self.broker.orders:
            if o.status in [bt.Order.Submitted, bt.Order.Accepted]:
                self.cancel(o)
                self.log(f"[order.ref={o.ref} placed: CANCEL]")
                canceled_orders.append(o)
        return canceled_orders

    def next(self):
        txt=self.get_position_info() # append to self.positions_info
        self.log(txt)

        if self.data_1d is None:
            return
        
        self.data_1d_curr_date = self.data_1d.datetime.datetime(0)
        if self.data_1d_prev_date != self.data_1d_curr_date:
            self.data_1d_prev_date = self.data_1d_curr_date
            
            prefix=f"[1D]: {self.data_1d.datetime.datetime(0)}, (o={self.data_1d.open[0]}, h={self.data_1d.high[0]}, l={self.data_1d.low[0]}, c={self.data_1d.close[0]})"
            print("="*len(prefix))
            print(f"{prefix}")
            print("="*len(prefix))

        # raise NotImplementedError()

    def cancel_all_orders_and_close_position(self):
    
        canceled_orders: list[bt.Order]=self.cancel_all_orders()
        # enter_orders_ids=[o.pair_order_ref for o in canceled_orders]
        enter_orders_ids=[]
        for o in canceled_orders:
            if hasattr(o, "pair_order_ref"):
                enter_orders_ids.append(o.pair_order_ref)


        self.order = self.close(data=self.data_5m)
        if self.order:
            
            self.order.pair_order_ref = enter_orders_ids # ids of orders that we exit (close)
            self.order.pair_type = "exit (market_close)"

            self.log(f"[EXIT] [order.ref={self.order.ref} placed: CLOSE] (market close)")

        else:
            # self.log(f"can not place a CLOSE order (no position to close: {self.position})")
            self.log(f"can not place a CLOSE order (no position to close)")

        # self.orders.append(self.order)

    


    

   

        

