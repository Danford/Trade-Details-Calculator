const request = require('supertest');
const app = require('../server');  // Ensure this path points to your Express app setup.

describe('POST /calculate', () => {
    it('should calculate takeProfitPercent given units, entryPrice, and takeProfitPrice', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                accountValue: 1000,
                units: 10,
                entryPrice: 100,
                takeProfitPrice: 110
            });
        
        expect(response.statusCode).toBe(200);
        expect(response.body.takeProfitPercent).toBeCloseTo(10);
    });

    // Add more test cases as needed...
});
