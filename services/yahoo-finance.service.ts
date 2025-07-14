import { APIRequestContext } from '@playwright/test';

export interface FinancialDataPoint {
    date: Date;
    value: number;
}

export class YahooFinanceService {
    private request: APIRequestContext;

    constructor(request: APIRequestContext) {
        this.request = request;
    }

    async getLowestMonthOverPast3Years() {
        const symbol = '%5EFTSE'; // ^FTSE URL-encoded

        const endDate = Math.floor(Date.now() / 1000);
        const startDate = Math.floor(new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).getTime() / 1000);

        const interval = '1mo';

        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${startDate}&period2=${endDate}&interval=${interval}`;

        console.log(`Fetching FTSE-100 data from Yahoo Finance: ${url}`);

        const response = await this.request.get(url);
        const data = await response.json();

        const timestamps = data.chart.result[0].timestamp;
        const closePrices = data.chart.result[0].indicators.quote[0].close;

        const dataPoints: FinancialDataPoint[] = timestamps.map((timestamp: number, index: number) => ({
            date: new Date(timestamp * 1000),
            value: closePrices[index]
        })).filter((point: FinancialDataPoint) => point.value !== null);

        console.log(`Retrieved ${dataPoints.length} monthly data points`);

        const lowestPoint = dataPoints.reduce((lowest, current) =>
            current.value < lowest.value ? current : lowest, dataPoints[0]);

        return {
            lowestPoint,
            dataPoints
        };
    }
}
