const request = require('supertest');
const { app, server } = require('../server');  // Ensure this path points to your Express app setup.

afterAll(() => {
    server.close();  // Close the server after tests
});

describe('POST /calculate', () => {
    it('should return 400 when accountValue is not a positive number', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                accountValue: "invalid"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Invalid account value. Must be a positive number between 0 and Infinity.');
    });

    it('should return 400 when units is not a positive number', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                units: 0
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Invalid units. Must be a positive number between 0 and Infinity.');
    });

    it('should return 400 when risk currency is not a positive number', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                riskCurrency: 0
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Invalid risk currency. Must be a positive number between 0 and Infinity.');
    });
    
    it('should return 400 when risk percent is greater than 100', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                riskPercent: 101
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Invalid risk percent. Must be a positive number between 0 and 100.');
    });

    it('should return 400 when risk percent is not a positive number', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                riskPercent: 0
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Invalid risk percent. Must be a positive number between 0 and 100.');
    });

    it('should return 400 when entryPrice is not a positive number', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                entryPrice: 0
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Invalid entry price. Must be a positive number between 0 and Infinity.');
    });

    it('should return 400 when stopLossPercent is greater than 100', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                stopLossPercent: 101
            });
    
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Invalid stop loss percent. Must be a positive number between 0 and 100.');
    });

    it('should return 400 when stopLossPercent is not a positive number', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                stopLossPercent: 0
            });
    
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Invalid stop loss percent. Must be a positive number between 0 and 100.');
    });

    it('should return 400 when stopLossPrice is less than or equal to 0', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                stopLossPrice: 0
            });
    
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Invalid stop loss price. Must be a positive number between 0 and Infinity.');
    });
    
    it('should return 400 when takeProfitPercent is greater than 100', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                takeProfitPercent: 101
            });
    
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Invalid take profit percent. Must be a positive number between 0 and 100.');
    });

    it('should return 400 when takeProfitPercent is not a positive number', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                takeProfitPercent: 0
            });
    
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Invalid take profit percent. Must be a positive number between 0 and 100.');
    });

    it('should return 400 when takeProfitPrice is not a positive number', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                takeProfitPrice: 0
            });
    
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Invalid take profit price. Must be a positive number between 0 and Infinity.');
    });

    it('should return 400 when stopLossPrice is equal to or greater than entryPrice', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                entryPrice: 100,
                stopLossPrice: 100,  // Updating stopLossPrice
                fieldToUpdate: 'stopLossPrice'
            });
    
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Invalid stop loss. Stop loss must be less than entry price.');
    });

    it('should return 400 when takeProfitPrice is equal to or less than entryPrice', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                entryPrice: 100,
                takeProfitPrice: 100,  // Updating stopLossPrice
                fieldToUpdate: 'takeProfitPrice'
            });
    
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Invalid take profit price. Take profit price must be greater than entry price.');
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
    
    it('should calculate values when fieldToUpdate is set to accountValue', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                accountValue: 2000,  // Updating accountValue
                units: 10,
                entryPrice: 100,
                stopLossPercent: 10,
                fieldToUpdate: 'accountValue'
            });
    
        expect(response.statusCode).toBe(200);
        expect(response.body.accountValue).toBeCloseTo(2000);
        expect(response.body.units).toBeCloseTo(10);
        expect(response.body.riskCurrency).toBeCloseTo(100);
        expect(response.body.riskPercent).toBeCloseTo(5);
        expect(response.body.entryPrice).toBeCloseTo(100);
        expect(response.body.stopLossPrice).toBeCloseTo(90);
        expect(response.body.stopLossPercent).toBeCloseTo(10);
        expect(response.body.takeProfitPrice).toBeUndefined();
        expect(response.body.takeProfitPercent).toBeUndefined();
    });

    it('should calculate values when fieldToUpdate is set to units', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                accountValue: 1000,
                units: 40,  // Updating units
                entryPrice: 50,
                stopLossPrice: 45,
                takeProfitPercent: 10,
                fieldToUpdate: 'units'
            });
    
        expect(response.statusCode).toBe(200);
        expect(response.body.accountValue).toBeCloseTo(1000);
        expect(response.body.units).toBeCloseTo(40);
        expect(response.body.riskCurrency).toBeCloseTo(200);
        expect(response.body.riskPercent).toBeCloseTo(20);
        expect(response.body.entryPrice).toBeCloseTo(50);
        expect(response.body.stopLossPrice).toBeCloseTo(45);
        expect(response.body.stopLossPercent).toBeCloseTo(10);
        expect(response.body.takeProfitPrice).toBeCloseTo(55);
        expect(response.body.takeProfitPercent).toBeCloseTo(10);
    });

    it('should calculate values with fieldToUpdate set to riskCurrency', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                accountValue: 1000,
                entryPrice: 100,
                stopLossPrice: 50,
                riskCurrency: 1000,  // Updating riskCurrency
                fieldToUpdate: 'riskCurrency'
            });
    
        expect(response.statusCode).toBe(200);
        expect(response.body.accountValue).toBeCloseTo(1000);
        expect(response.body.units).toBeCloseTo(20);
        expect(response.body.riskCurrency).toBeCloseTo(1000);
        expect(response.body.riskPercent).toBeCloseTo(100);
        expect(response.body.entryPrice).toBeCloseTo(100);
        expect(response.body.stopLossPrice).toBeCloseTo(50);
        expect(response.body.stopLossPercent).toBeCloseTo(50);
        expect(response.body.takeProfitPrice).toBeUndefined();
        expect(response.body.takeProfitPercent).toBeUndefined();
    });

    it('should calculate values with fieldToUpdate set to riskPercent', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                accountValue: 1000,
                entryPrice: 100,
                stopLossPrice: 90,
                stopLossPercent: 10,
                riskPercent: 10,  // Updating riskPercent
                fieldToUpdate: 'riskPercent'
            });
    
        expect(response.statusCode).toBe(200);
        expect(response.body.accountValue).toBeCloseTo(1000);
        expect(response.body.units).toBeCloseTo(10);
        expect(response.body.riskCurrency).toBeCloseTo(100);
        expect(response.body.riskPercent).toBeCloseTo(10);
        expect(response.body.entryPrice).toBeCloseTo(100);
        expect(response.body.stopLossPrice).toBeCloseTo(90);
        expect(response.body.stopLossPercent).toBeCloseTo(10);
        expect(response.body.takeProfitPrice).toBeUndefined();
        expect(response.body.takeProfitPercent).toBeUndefined();
        expect(response.body.units).toBeCloseTo(10);
    });
    it('should calculate values with fieldToUpdate set to takeProfitPercent', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                entryPrice: 100,
                takeProfitPercent: 10,  // Updating takeProfitPercent
                fieldToUpdate: 'takeProfitPercent'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.accountValue).toBeUndefined();
        expect(response.body.units).toBeUndefined();
        expect(response.body.riskCurrency).toBeUndefined();
        expect(response.body.riskPercent).toBeUndefined();
        expect(response.body.entryPrice).toBeCloseTo(100);
        expect(response.body.stopLossPrice).toBeUndefined();
        expect(response.body.stopLossPercent).toBeUndefined();
        expect(response.body.takeProfitPrice).toBeCloseTo(110);
        expect(response.body.takeProfitPercent).toBeCloseTo(10);
    });
    
    it('should calculate values with fieldToUpdate set to stopLossPercent', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                entryPrice: 100,
                stopLossPercent: 5,  // Updating stopLossPercent
                fieldToUpdate: 'stopLossPercent'
            });
    
        if (response.statusCode !== 200) {
            console.error('Error:', response.error);
        }

        expect(response.statusCode).toBe(200);
        expect(response.body.accountValue).toBeUndefined();
        expect(response.body.units).toBeUndefined();
        expect(response.body.riskCurrency).toBeUndefined();
        expect(response.body.riskPercent).toBeUndefined();
        expect(response.body.entryPrice).toBeCloseTo(100);
        expect(response.body.stopLossPrice).toBeCloseTo(95);
        expect(response.body.stopLossPercent).toBeCloseTo(5);
        expect(response.body.takeProfitPrice).toBeUndefined();
    });
    
    it('should calculate values with fieldToUpdate set to entryPrice', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                accountValue: 1000,
                units: 10,
                entryPrice: 1000,  // Updating entryPrice
                stopLossPrice: 900,
                stopLossPercent: 10,
                takeProfitPercent: 10,
                fieldToUpdate: 'entryPrice'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.accountValue).toBeCloseTo(1000);
        expect(response.body.units).toBeCloseTo(10);
        expect(response.body.riskCurrency).toBeCloseTo(1000);
        expect(response.body.riskPercent).toBeCloseTo(100);
        expect(response.body.entryPrice).toBeCloseTo(1000);
        expect(response.body.stopLossPercent).toBeCloseTo(10);
        expect(response.body.stopLossPrice).toBeCloseTo(900);
        expect(response.body.takeProfitPrice).toBeCloseTo(1100);
        expect(response.body.takeProfitPercent).toBeCloseTo(10);
    });

    it('should calculate values with fieldToUpdate set to stopLossPrice', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                accountValue: 1000,
                units: 10,
                entryPrice: 100,
                stopLossPrice: 89,  // Updating stopLossPrice
                fieldToUpdate: 'stopLossPrice'
            });
    
        expect(response.statusCode).toBe(200);
        expect(response.body.accountValue).toBeCloseTo(1000);
        expect(response.body.units).toBeCloseTo(10);
        expect(response.body.riskCurrency).toBeCloseTo(110);
        expect(response.body.riskPercent).toBeCloseTo(11);
        expect(response.body.entryPrice).toBeCloseTo(100);
        expect(response.body.stopLossPrice).toBeCloseTo(89);
        expect(response.body.stopLossPercent).toBeCloseTo(10.9999999);
        expect(response.body.takeProfitPrice).toBeUndefined();
        expect(response.body.takeProfitPercent).toBeUndefined();
        expect(response.body.units).toBeCloseTo(10);
    });

    it('should calculate values with fieldToUpdate set to stopLossPercent', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                accountValue: 1000,
                units: 10,
                entryPrice: 100,
                stopLossPrice: 90,  
                stopLossPercent: 11,  // Updating stopLossPercent
                fieldToUpdate: 'stopLossPercent'
            });
    
        expect(response.statusCode).toBe(200);
        expect(response.body.accountValue).toBeCloseTo(1000);
        expect(response.body.units).toBeCloseTo(10);
        expect(response.body.riskCurrency).toBeCloseTo(110);
        expect(response.body.riskPercent).toBeCloseTo(11);
        expect(response.body.entryPrice).toBeCloseTo(100);
        expect(response.body.stopLossPrice).toBeCloseTo(89);
        expect(response.body.stopLossPercent).toBeCloseTo(10.9999999);
        expect(response.body.takeProfitPrice).toBeUndefined();
        expect(response.body.takeProfitPercent).toBeUndefined();
        expect(response.body.stopLossPrice).toBeCloseTo(89);
    });

    it('should calculate values with fieldToUpdate set to takeProfitPrice', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({
                accountValue: 1000,
                units: 10,
                entryPrice: 100,
                takeProfitPrice: 120,  // Updating takeProfitPrice
                riskPercent: 5,
                fieldToUpdate: 'takeProfitPrice'
            });
    
        expect(response.statusCode).toBe(200);
        expect(response.body.accountValue).toBeCloseTo(1000);
        expect(response.body.units).toBeCloseTo(10);
        expect(response.body.riskCurrency).toBeCloseTo(50);
        expect(response.body.riskPercent).toBeCloseTo(5);
        expect(response.body.entryPrice).toBeCloseTo(100);
        expect(response.body.stopLossPrice).toBeCloseTo(95);
        expect(response.body.stopLossPercent).toBeCloseTo(5);
        expect(response.body.takeProfitPrice).toBeCloseTo(120);
        expect(response.body.takeProfitPercent).toBeCloseTo(20);
    });

    it('should calculate values with fieldToUpdate set to stopLossPrice', async () => {
        const response = await request(app)
        .post('/calculate')
        .send({
            accountValue: 1000,
            units: 10,
            entryPrice: 100,
            stopLossPrice: 95,  // Updating stopLossPrice
            fieldToUpdate: 'stopLossPrice'
        });

        expect(response.statusCode).toBe(200);
        expect(response.body.accountValue).toBeCloseTo(1000);
        expect(response.body.units).toBeCloseTo(10);
        expect(response.body.riskCurrency).toBeCloseTo(50);
        expect(response.body.riskPercent).toBeCloseTo(5);
        expect(response.body.entryPrice).toBeCloseTo(100);
        expect(response.body.stopLossPrice).toBeCloseTo(95);
        expect(response.body.stopLossPercent).toBeCloseTo(5);
        expect(response.body.takeProfitPrice).toBeUndefined();
        expect(response.body.takeProfitPercent).toBeUndefined();
    });

    it('should calculate values with fieldToUpdate set to units ', async () => {
        const response = await request(app)
        .post('/calculate')
        .send({
            accountValue: 1000,
            units: 10,  // Updating units
            entryPrice: 100,
            stopLossPrice: 95,
            fieldToUpdate: 'units'
        });
        
        expect(response.statusCode).toBe(200);
        expect(response.body.accountValue).toBeCloseTo(1000);
        expect(response.body.units).toBeCloseTo(10);
        expect(response.body.riskCurrency).toBeCloseTo(50);
        expect(response.body.riskPercent).toBeCloseTo(5);
        expect(response.body.entryPrice).toBeCloseTo(100);
        expect(response.body.stopLossPrice).toBeCloseTo(95);
        expect(response.body.stopLossPercent).toBeCloseTo(5);
        expect(response.body.takeProfitPrice).toBeUndefined();
        expect(response.body.takeProfitPercent).toBeUndefined();
    });
});