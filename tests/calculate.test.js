const request = require('supertest');
const app = require('../server');  // Ensure this path points to your Express app setup.

describe('POST /calculate', () => {
    it('should calculate takeProfitPrice when provided entryPrice, takeProfitPercent, accountValue, and units', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                accountValue: 1000,
                units: 10,
                entryPrice: 100,
                takeProfitPercent: 10,
                fieldToUpdate: 'takeProfitPercent'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.takeProfitPrice).toBeCloseTo(110);
    });
    
    it('should calculate both takeProfitPrice and stopLossPrice when provided necessary inputs', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                accountValue: 1000,
                units: 10,
                entryPrice: 100,
                takeProfitPercent: 10,
                stopLossPercent: 5,
                fieldToUpdate: 'stopLossPercent'
            });
    
        expect(response.statusCode).toBe(200);
        expect(response.body.takeProfitPrice).toBeCloseTo(110);
        expect(response.body.stopLossPrice).toBeCloseTo(95);
    });
    
    it('should calculate stopLossPrice when provided entryPrice, stopLossPercent, accountValue, and units', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                accountValue: 1000,
                units: 10,
                entryPrice: 100,
                stopLossPercent: 5,
                fieldToUpdate: 'stopLossPercent'
            });
    
        if (response.statusCode !== 200) {
            console.error('Error:', response.error);
        }

        expect(response.statusCode).toBe(200);
        expect(response.body.stopLossPrice).toBeCloseTo(95);
    });
    
    it('should calculate units for stopLoss when provided entryPrice, stopLossPrice, stopLossPercent, and accountValue', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                accountValue: 1000,
                entryPrice: 100,
                stopLossPrice: 95,
                stopLossPercent: 5,
                fieldToUpdate: 'stopLossPercent'
            });
    
        if (response.statusCode !== 200) {
            console.error('Error:', response.error);
        }

        expect(response.statusCode).toBe(200);
        expect(response.body.units).toBeCloseTo(10);
    });
    

    it('should return 400 when accountValue is not a number', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                accountValue: "invalid",
                units: 10,
                entryPrice: 100,
                takeProfitPercent: 10
            });

        expect(response.statusCode).toBe(400);
    });

    it('should return 400 when entryPrice is not positive', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                accountValue: 1000,
                units: 10,
                entryPrice: -100,
                takeProfitPercent: 10
            });

        expect(response.statusCode).toBe(400);
    });

    it('should return 400 when stopLossPercent is greater than 100', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                accountValue: 1000,
                units: 10,
                entryPrice: 100,
                stopLossPercent: 150
            });
    
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Invalid stop loss percent. Must be between 0 and 100.');
    });
    
    it('should return 400 when takeProfitPercent is less than or equal to 0', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                accountValue: 1000,
                units: 10,
                entryPrice: 100,
                takeProfitPercent: 0
            });
    
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Invalid take profit percent. Must be a positive number.');
    });

    it('should recalculate values when fieldToUpdate is set to accountValue', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                accountValue: 2000,  // Updating accountValue
                units: 10,
                entryPrice: 100,
                takeProfitPercent: 10,
                fieldToUpdate: 'accountValue'
            });
    
        if (response.statusCode !== 200) {
            console.error('Error:', response.error);
        }

        expect(response.statusCode).toBe(200);
        expect(response.body.takeProfitPrice).toBeCloseTo(110);
    });

    it('should recalculate values when fieldToUpdate is set to units', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                accountValue: 1000,
                units: 20,  // Updating units
                entryPrice: 100,
                stopLossPrice: 90,
                takeProfitPrice: 110,
                fieldToUpdate: 'units'
            });
    
        if (response.statusCode !== 200) {
            console.error('Error:', response.error);
        }

        expect(response.statusCode).toBe(200);
        expect(response.body.stopLossPercent).toBeCloseTo(10);
        expect(response.body.takeProfitPercent).toBeCloseTo(10);
    });

    it('should recalculate values when fieldToUpdate is set to entryPrice', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                accountValue: 1000,
                units: 10,
                entryPrice: 100,  // Updating entryPrice
                stopLossPrice: 95,
                takeProfitPrice: 110,
                fieldToUpdate: 'entryPrice'
            });

        if (response.statusCode !== 200) {
            console.error('Error:', response.error);
        }

        expect(response.statusCode).toBe(200);
        expect(response.body.takeProfitPercent).toBeCloseTo(10);
        expect(response.body.units).toBeCloseTo(10);
    });

    it('should recalculate values when fieldToUpdate is set to stopLossPrice', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                accountValue: 1000,
                units: 10,
                entryPrice: 100,
                stopLossPrice: 89,  // Updating stopLossPrice
                stopLossPercent: 11,
                fieldToUpdate: 'stopLossPrice'
            });
    
        if (response.statusCode !== 200) {
            console.error('Error:', response.error);
        }

        expect(response.statusCode).toBe(200);
        expect(response.body.units).toBeCloseTo(10);
    });

    it('should recalculate values when fieldToUpdate is set to takeProfitPrice', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                accountValue: 1000,
                units: 10,
                entryPrice: 100,
                takeProfitPrice: 120,  // Updating takeProfitPrice
                fieldToUpdate: 'takeProfitPrice'
            });
    
        if (response.statusCode !== 200) {
            console.error('Error:', response.error);
        }

        expect(response.statusCode).toBe(200);
        expect(response.body.takeProfitPercent).toBeCloseTo(20); // (20/100)*100
    });

    it('should return an error when fieldToUpdate is set to an unexpected value', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                accountValue: 1000,
                units: 10,
                entryPrice: 100,
                takeProfitPercent: 10,
                fieldToUpdate: 'unexpectedField'
            });
    
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Invalid field name');
    });
    
    it('should return 400 when fieldToUpdate is invalid', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                accountValue: 1000,
                units: 10,
                entryPrice: 100,
                takeProfitPercent: 10,
                fieldToUpdate: 'invalidField'
            });
    
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Invalid field name');
    });
    
    it('should handle invalid input types', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                accountValue: "1000",  // string instead of number
                units: 10,
                entryPrice: 100,
                takeProfitPercent: 10,
                fieldToUpdate: 'takeProfitPrice'
            });
    
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Invalid account value. Must be a positive number.');
    });

    it('should handle extremely large values without overflow', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                accountValue: Number.MAX_SAFE_INTEGER,  // maximum representable value in JS
                units: Number.MAX_SAFE_INTEGER,
                entryPrice: Number.MAX_SAFE_INTEGER,
                takeProfitPercent: 10,
                fieldToUpdate: 'takeProfitPrice'
            });
    
        if (response.statusCode !== 200) {
            console.error('Error:', response.error);
        }

        expect(response.statusCode).toBe(200);  
    });

    it('should handle missing necessary fields', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                units: 10,   // Missing accountValue, entryPrice, and other fields
                fieldToUpdate: 'takeProfitPrice'
            });
    
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBeTruthy();  // Expecting an error message to be returned
    });

    it('should handle zero values', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                accountValue: 0,  // Zero value which may lead to calculations issues
                units: 10,
                entryPrice: 100,
                takeProfitPercent: 10,
                fieldToUpdate: 'takeProfitPrice'
            });
    
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Invalid account value. Must be a positive number.');
    });

    // Test for calculateCurrencyRisk
    it('should correctly calculate currency risk', async () => {
        const response = await request(app)
        .post('/calculate')
        .send({
            accountValue: 1000,
            units: 10,
            entryPrice: 100,
            stopLossPrice: 95,
            fieldToUpdate: 'stopLossPrice'
        });

        expect(response.statusCode).toBe(200);
        expect(response.body.riskCurrency).toBeCloseTo(50);
        expect(response.body.stopLossPercent).toBeCloseTo(5);
    });

    // Test for calculateAccountPercentRisk
    it('should correctly calculate risk percentage of account', async () => {
        const response = await request(app)
        .post('/calculate')
        .send({
            accountValue: 1000,
            units: 10,
            currencyRisk: 50,
            entryPrice: 100,
            stopLossPrice: 95,
            fieldToUpdate: 'units'
        });
        
        expect(response.statusCode).toBe(200);
        expect(response.body.riskPercent).toBeCloseTo(5);
        expect(response.body.stopLossPercent).toBeCloseTo(5);
    });

    // Still need more test cases
});

