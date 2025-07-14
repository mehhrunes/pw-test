/**
 * Note: While these scenarios are implemented as "tests" per the requirements, they are fundamentally
 * data extraction/web scraping exercises rather than traditional test automation. They don't:
 * 
 * - Validate business logic and user workflows
 * - Test functional requirements (e.g., "user can successfully sort by market cap")
 * - Verify data integrity and accuracy against expected values
 * - Test edge cases and error scenarios
 * - Ensure UI components behave correctly under various conditions
 * 
 * These scenarios instead focus on extracting and displaying data from the London Stock Exchange website,
 * which is more aligned with web scraping use cases. The assertions used here primarily verify that
 * data was successfully extracted, rather than testing the website's functionality.
 * 
 * For demonstration purposes and to meet the requirements, assertions have been added to verify:
 * - Data extraction was successful (e.g., we got 10 items when expecting top 10)
 * - Critical elements exist before attempting to interact with them
 * - Extracted data meets basic validity criteria (e.g., values > 0)
 */

import { test, expect } from '../fixtures/lse-fixture';
import { writeResultsToJson, clearResultsFolder } from '../utils/file-utils';

clearResultsFolder();

test.describe('FTSE 100 UI Tests', () => {
    test.beforeEach(async ({ ftse100Page }) => {
        await ftse100Page.goto();
        await ftse100Page.acceptCookies();
    });

    test('extracts and displays FTSE 100 top 10 constituents with highest percentage change', async ({ ftse100Page }) => {
        await ftse100Page.sortByPercentageHighestToLowest();

        const top10Items = await ftse100Page.getTop10InstrumentNames();

        expect(top10Items.length).toBe(10);

        const results = {
            title: 'Top 10 instruments with highest percentage change',
            timestamp: new Date().toISOString(),
            instruments: top10Items.map((name, index) => ({
                rank: index + 1,
                name: name
            }))
        };

        const filePath = writeResultsToJson('highest-percentage', results);
        console.log(`Results written to: ${filePath}`);

        console.log(`Top 10 instruments with highest percentage change (${results.instruments.length} found):`);
        results.instruments.forEach(item => {
            console.log(`${item.rank}. ${item.name}`);
        });
    });

    test('extracts and displays FTSE 100 top 10 constituents with lowest percentage change', async ({ ftse100Page }) => {
        await ftse100Page.sortByPercentageLowestToHighest();

        const top10Items = await ftse100Page.getTop10InstrumentNames();

        expect(top10Items.length).toBe(10);

        const results = {
            title: 'Top 10 instruments with lowest percentage change',
            timestamp: new Date().toISOString(),
            instruments: top10Items.map((name, index) => ({
                rank: index + 1,
                name: name
            }))
        };

        const filePath = writeResultsToJson('lowest-percentage', results);
        console.log(`Results written to: ${filePath}`);

        console.log(`Top 10 instruments with lowest percentage change (${results.instruments.length} found):`);
        results.instruments.forEach(item => {
            console.log(`${item.rank}. ${item.name}`);
        });
    });

    test('extracts and displays all FTSE 100 constituents with Market Cap exceeding 7 million', async ({ ftse100Page }) => {
        await ftse100Page.sortByMarketCapHighestToLowest();

        const allInstrumentsAbove7M = await ftse100Page.getInstrumentsAboveMarketCap();

        const results = {
            title: 'Instruments with market cap > 7 million',
            timestamp: new Date().toISOString(),
            count: allInstrumentsAbove7M.length,
            instruments: allInstrumentsAbove7M.map((item, index) => ({
                rank: index + 1,
                name: item.name,
                marketCap: item.marketCap
            }))
        };

        const filePath = writeResultsToJson('market-cap-above-7m', results);
        console.log(`Results written to: ${filePath}`);

        console.log(`Instruments with market cap > 7 million (${results.count} found):`);
        results.instruments.forEach(item => {
            console.log(`${item.rank}. ${item.name} - Market Cap: ${item.marketCap.toLocaleString()}`);
        });

        expect(allInstrumentsAbove7M.length).toBeGreaterThan(0);
    });
});

// Scraping a highchart doesn't sound too good
test('determines and displays the month with lowest FTSE 100 value over past 3 years', async ({ yahooFinance }) => {
    const { lowestPoint, dataPoints } = await yahooFinance.getLowestMonthOverPast3Years();

    const results = {
        title: 'Lowest FTSE-100 value over past 3 years',
        timestamp: new Date().toISOString(),
        lowestPoint: {
            date: lowestPoint.date.toISOString(),
            formattedDate: lowestPoint.date.toLocaleDateString('en-GB', { year: 'numeric', month: 'long' }),
            value: lowestPoint.value
        },
        allDataPoints: dataPoints.map((point, index) => ({
            rank: index + 1,
            date: point.date.toISOString(),
            formattedDate: point.date.toLocaleDateString('en-GB', { year: 'numeric', month: 'long' }),
            value: point.value
        }))
    };

    const filePath = writeResultsToJson('lowest-month-past-3-years', results);
    console.log(`Results written to: ${filePath}`);

    console.log('\n========== RESULTS ==========');
    console.log('Lowest FTSE-100 value over past 3 years:');
    console.log(`Date: ${results.lowestPoint.formattedDate}`);
    console.log(`Value: ${results.lowestPoint.value.toLocaleString()}`);
    console.log('==============================\n');

    console.log('All monthly data points:');
    results.allDataPoints.forEach(point => {
        console.log(`${point.rank}. ${point.formattedDate}: ${point.value.toLocaleString()}`);
    });

    expect(lowestPoint.value).toBeGreaterThan(0);
    expect(dataPoints.length).toBeGreaterThan(36);
});
