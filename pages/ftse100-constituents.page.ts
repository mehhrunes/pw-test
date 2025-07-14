import { Page, Locator } from '@playwright/test';

export class FTSE100ConstituentsPage {
    readonly page: Page;

    private readonly acceptCookiesButton: Locator;
    private readonly changePercentColumn: Locator;
    private readonly marketCapColumn: Locator;
    private readonly highestLowestOption: Locator;
    private readonly lowestHighestOption: Locator;
    private readonly negativePercentageCell: Locator;
    private readonly instrumentNames: Locator;
    private readonly instrumentMarketCaps: Locator;
    private readonly paginationLinks: Locator;

    constructor(page: Page) {
        this.page = page;

        this.acceptCookiesButton = page.getByRole('button', { name: 'Accept all cookies' });
        this.changePercentColumn = page.getByText('Change %', { exact: true });
        this.marketCapColumn = page.getByText('Market cap (m)');
        this.highestLowestOption = page.getByRole('listitem').filter({ hasText: 'Highest – lowest' }).locator('div');
        this.lowestHighestOption = page.getByRole('listitem').filter({ hasText: 'Lowest – highest' }).locator('div');
        this.negativePercentageCell = page.locator('td:has-text("-") >> text=/%/');
        this.instrumentNames = page.locator('.instrument-name');
        this.instrumentMarketCaps = page.locator('td.instrument-marketcapitalization');
        this.paginationLinks = page.getByRole('link');
    }

    async goto() {
        await this.page.goto('https://www.londonstockexchange.com/indices/ftse-100/constituents/table');
    }

    async acceptCookies() {
        try {
            await this.acceptCookiesButton.click();
        } catch (error) {
            console.log('Cookie banner not found or already accepted');
        }
    }

    async sortByPercentageHighestToLowest() {
        await this.changePercentColumn.click();
        await this.highestLowestOption.click();
    }

    async sortByPercentageLowestToHighest() {
        await this.changePercentColumn.click();
        await this.lowestHighestOption.click();
        await this.negativePercentageCell.first().waitFor({
            state: 'visible',
            timeout: 10000
        });
    }

    async sortByMarketCapHighestToLowest() {
        await this.marketCapColumn.click();
        await this.highestLowestOption.click();
        await this.page.waitForTimeout(1000);
    }


    async getTop10InstrumentNames() {
        const items = await this.instrumentNames.allTextContents();
        return items.slice(0, 10);
    }

    async processCurrentPageForMarketCap() {
        interface Instrument {
            name: string;
            marketCap: number;
        }

        const names = await this.instrumentNames.allTextContents();
        const marketCaps = await this.instrumentMarketCaps.allTextContents();
        const results: Instrument[] = [];

        for (let i = 0; i < Math.min(names.length, marketCaps.length); i++) {
            const name = names[i].trim();
            const marketCapText = marketCaps[i].trim();
            const marketCapValue = parseFloat(marketCapText.replace(/,/g, ''));

            if (!isNaN(marketCapValue) && marketCapValue > 7) {
                results.push({
                    name,
                    marketCap: marketCapValue
                });
            }
        }

        return results;
    }

    async navigateToPage(pageNum: number) {
        // Create a locator that specifically targets the exact page number
        const pageLink = this.page.getByRole('link', { name: `${pageNum}`, exact: true });
        await pageLink.click();
        await this.page.waitForTimeout(1000);
    }


    async getInstrumentsAboveMarketCap() {
        interface Instrument {
            name: string;
            marketCap: number;
        }

        let allInstrumentsAbove7M: Instrument[] = [];

        const firstPageResults = await this.processCurrentPageForMarketCap();
        allInstrumentsAbove7M = [...allInstrumentsAbove7M, ...firstPageResults];

        for (let pageNum = 2; pageNum <= 5; pageNum++) {
            await this.navigateToPage(pageNum);
            const pageResults = await this.processCurrentPageForMarketCap();
            allInstrumentsAbove7M = [...allInstrumentsAbove7M, ...pageResults];
        }

        return allInstrumentsAbove7M;
    }
}
