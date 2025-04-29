from datetime import datetime, time, timedelta

market_open = time(hour=16, minute=30)
market_close = time(hour=23, minute=0)

print(market_open)
print(market_close)

# Adding 5 minutes to market_close
new_time = (datetime.combine(datetime.today(), market_close) + timedelta(minutes=5)).time()
print(new_time)
