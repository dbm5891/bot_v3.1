# Bot v3.1 Simplified Component Diagram

```mermaid
flowchart TB
    %% Main Components
    subgraph BacktestingFW["Backtesting Framework"]
        BT_Engine["Backtrader Engine"]
        BT_Data["Data Processing"]
        BT_Strategies["Trading Strategies"]
        BT_Analysis["Analysis & Visualization"]
        BT_Features["Advanced Features"]
        
        %% Key connections within backtesting
        BT_Data --> BT_Engine
        BT_Strategies --> BT_Engine
        BT_Engine --> BT_Analysis
        BT_Features --> BT_Engine
    end
    
    subgraph TATools["Technical Analysis Tools"]
        TA_Standard["Standard Indicators"]
        TA_Custom["Custom Indicators"]
        TA_Compare["Indicator Comparison"]
    end
    
    subgraph FuncUtils["Functional Utilities"]
        FU_Dataframes["DataFrame Operations"]
        FU_Files["File Operations"]
        FU_Util["General Utilities"]
    end
    
    %% Data Sources and External Systems
    CSV_Data["CSV Market Data"]
    TradingView["TradingView Platform"]
    Broker["TD Ameritrade"]
    
    %% Cross-component connections
    CSV_Data --> BT_Data
    TA_Standard --> BT_Strategies
    TA_Custom --> BT_Strategies
    FU_Dataframes --> BT_Data
    FU_Files --> CSV_Data
    TradingView --> BT_Features
    Broker --> BT_Engine
    FU_Dataframes --> TA_Standard
    
    %% Detailed components inside each main component
    subgraph BT_Data
        dfs_prepare["dfs_prepare.py"]
        dfs_indicators["dfs_set_ta_indicators.py"]
        dfs_indicators_1d["_1D.py"]
        dfs_indicators_5m["_5m.py"]
    end
    
    subgraph BT_Strategies
        run_bt["run_bt_v1.1.py"]
        strategies["Custom Strategy Classes"]
    end
    
    subgraph BT_Analysis
        stats["Statistical Analysis"]
        viz["Visualization Tools"]
    end
    
    subgraph BT_Features
        mta["Multi-Timeframe Analysis"]
        orders["Order Management"]
        ml["Machine Learning"]
        tv["TradingView Integration"]
    end
    
    subgraph TA_Standard
        pandas_ta["pandas-ta Integration"]
    end
    
    subgraph TA_Custom
        custom_ind["Custom Indicators"]
    end
    
    subgraph FU_Dataframes
        print_df["print_df()"]
        df_analysis["DataFrame Analysis"]
    end
    
    subgraph FU_Files
        list_csv["list_tuple_to_csv()"]
        file_ops["File Operations"]
    end
    
    %% Styling
    classDef standard fill:#ddf,stroke:#33f,stroke-width:1px
    classDef input fill:#dfd,stroke:#494,stroke-width:1px
    classDef external fill:#ffd,stroke:#b94,stroke-width:2px
    
    class BacktestingFW,TATools,FuncUtils standard
    class CSV_Data input
    class TradingView,Broker external
```

## Component Description

This simplified component diagram shows the main parts of the Bot v3.1 system:

### 1. Backtesting Framework
- **Backtrader Engine**: Core backtesting implementation
- **Data Processing**: Prepares market data for analysis
  - dfs_prepare.py: Initial data loading
  - dfs_set_ta_indicators.py: Adds technical indicators
  - Timeframe-specific versions (1D and 5m)
- **Trading Strategies**: Strategy implementation and execution
  - run_bt_v1.1.py: Main execution script
  - Custom strategy classes
- **Analysis & Visualization**: Performance evaluation tools
  - Statistical Analysis: Metrics and distribution tests
  - Visualization Tools: Charts and performance visuals
- **Advanced Features**: Enhanced capabilities
  - Multi-Timeframe Analysis: Combining timeframes
  - Order Management: Position sizing and execution
  - Machine Learning: ML model integration
  - TradingView Integration: External platform connection

### 2. Technical Analysis Tools
- **Standard Indicators**: Common technical indicators via pandas-ta
- **Custom Indicators**: User-developed specialized indicators
- **Indicator Comparison**: Tools to evaluate indicator effectiveness

### 3. Functional Utilities
- **DataFrame Operations**: Tools for data manipulation
- **File Operations**: File handling and CSV management
- **General Utilities**: Miscellaneous helper functions

### 4. External Components
- **CSV Market Data**: Historical price data
- **TradingView Platform**: External visualization and prototyping
- **TD Ameritrade**: Broker for market data and execution

The arrows show the flow of data and dependencies between components.