import { test as base, APIRequestContext } from '@playwright/test';
import { FTSE100ConstituentsPage } from '../pages/ftse100-constituents.page';
import { YahooFinanceService } from '../services/yahoo-finance.service';

type LSEFixtures = {
    ftse100Page: FTSE100ConstituentsPage;
    yahooFinance: YahooFinanceService;
};

export const test = base.extend<LSEFixtures>({
    ftse100Page: async ({ page }, use) => {
        const ftse100Page = new FTSE100ConstituentsPage(page);
        await use(ftse100Page);
    },

    yahooFinance: async ({ request }, use) => {
        const yahooFinance = new YahooFinanceService(request);
        await use(yahooFinance);
    }
});

export { expect } from '@playwright/test';
