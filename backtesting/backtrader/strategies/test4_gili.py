from matplotlib import pyplot as plt
import pandas as pd

filename="C:\\Users\\leass\\OneDrive\\Documents\\gili2.csv"
df = pd.read_csv(filename, parse_dates=["ts1"])
print(df)
print(df.info())





fig, ax = plt.subplots()
x=(df["ts1"]).tolist()
ax.plot(x, df["v1"])
ax.plot(x, df["v2"])
# ax.plot(x, df["v3"])
ax.grid()
plt.show()

