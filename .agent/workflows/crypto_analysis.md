---
description: Comprehensive Crypto Market Analysis (Binance, Coinank, Coinglass)
---

This workflow guides the analysis of a crypto asset to determine its next price move using multiple data sources.

**Parameters:**
- `TICKER`: The full futures ticker (e.g., `1000PEPEUSDT`)
- `SYMBOL`: The base symbol (e.g., `PEPE`)

**Steps:**

1. **Binance Futures Trading Data**
   - **URL**: `https://www.binance.com/en/futures/<TICKER>`
   - **Action**: 
     - Click the "Trading Data" tab.
     - **IMPORTANT**: Click the "Full Screen" icon (double arrow ⤢) in the top right of the data panel to view all charts clearly.
     - Extract the following:
       - Long/Short Ratio (Accounts vs Top Traders)
       - Open Interest (OI) trend (Increasing/Decreasing)
       - Taker Buy/Sell Volume
   - **Analysis**:
     - L/S Ratio > 2.0: Retail is heavily Long (Contrarian Bearish signal).
     - L/S Ratio < 0.5: Retail is heavily Short (Contrarian Bullish signal).

2. **Binance AI Technical Analysis**
   - **URL**: `https://www.binance.com/en/markets/ai-select/detail/<SYMBOL>_USDT?indicatorType=technical&timeType=1h`
   - **Action**: Read the "AI Summary" and check the 1H Trend status.
   - **Analysis**: Note if the technicals (RSI, MA) conflict with the sentiment.

3. **Coinank Liquidation Map**
   - **URL**: `https://coinank.com/chart/derivatives/liq-map/binance/<TICKER_LOWERCASE>/1d`
   - **Action**: Look for the "tallest" liquidation bars relative to the current price.
   - **Analysis**:
     - Tall bars BELOW price = Magnet for a DROP (Long Squeeze).
     - Tall bars ABOVE price = Magnet for a PUMP (Short Squeeze).

4. **Coinglass Market Overview**
   - **URL**: `https://www.coinglass.com/currencies/<TICKER>` (or `<SYMBOL>` if 1000 prefix is standard)
   - **Action**: Check the 24h OI change and Funding Rates.
   - **Analysis**:
     - High OI + Negative Funding = Strong Short Interest (Potential Short Squeeze).
     - High OI + Positive Funding = Strong Long Interest (Potential Long Squeeze).

5. **Final Synthesis**
   - Combine the **Crowd Sentiment** (L/S Ratio), **Market Structure** (Liquidation Map), and **Technical Trend** (AI Analysis).
   - **Output**:
     - **Trend Prediction**: (Bullish / Bearish / Neutral)
     - **Key Levels**: Support/Resistance based on Liquidation clusters.
     - **Strategy**: Suggest Hold, Buy, or Sell based on the confluence.
