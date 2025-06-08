# Portfolio Performance API Endpoint

**Endpoint:** `/api/portfolio/performance`

**Method:** `GET`

**Description:** Retrieves portfolio performance data and key metrics for the authenticated user.

**Response Body:**

The response should be a JSON object with the following structure:

```json
{
  "performanceData": [
    {
      "date": "YYYY-MM-DD",
      "value": number
    }
    // More data points...
  ],
  "benchmarkData": [
    {
      "date": "YYYY-MM-DD",
      "value": number
    }
    // More data points...
  ],
  "metrics": {
    "totalReturn": number, // Cumulative return percentage
    "maxDrawdown": number, // Maximum drawdown percentage
    "sharpeRatio": number, // Sharpe Ratio
    // Additional metrics can be added here
  }
}
```

**Explanation:**

- `performanceData`: An array of objects representing the portfolio's equity curve over time. Each object should have a `date` string (in 'YYYY-MM-DD' format) and a `value` number representing the portfolio's value on that date.
- `benchmarkData`: An optional array of objects representing a benchmark equity curve for comparison, with the same structure as `performanceData`.
- `metrics`: An object containing key performance indicators for the portfolio.
    - `totalReturn`: The cumulative percentage return over the period covered by the `performanceData`.
    - `maxDrawdown`: The largest percentage drop from a peak to a trough in the portfolio's value.
    - `sharpeRatio`: A measure of risk-adjusted return.

This data is used by the frontend dashboard to display the performance chart and key statistics. 