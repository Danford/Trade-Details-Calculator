const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

const path = require('path');

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
	if (process.env.NODE_ENV !== 'test') {
    		console.log(`Server is running on port ${PORT}`);
	}
});

app.post('/calculate', (req, res) => {
    const {
        accountValue, 
        units,
        entryPrice,
        stopLossPrice,
        stopLossPercent,
        takeProfitPrice,
        takeProfitPercent
    } = req.body;

    let response = {};

    // If units, entryPrice, and stopLossPrice are known, calculate stopLossPercent
    if (units && entryPrice && stopLossPrice && !stopLossPercent) {
        const loss = (entryPrice - stopLossPrice) * units;
        response.stopLossPercent = (loss / accountValue) * 100;
    }

    // If units, entryPrice, and stopLossPercent are known, calculate stopLossPrice
    else if (units && entryPrice && stopLossPercent && !stopLossPrice) {
        const loss = (stopLossPercent / 100) * accountValue;
        response.stopLossPrice = entryPrice - (loss / units);
    }

    // If entryPrice, stopLossPrice, and stopLossPercent are known, calculate units
    else if (entryPrice && stopLossPrice && stopLossPercent && !units) {
        const loss = (stopLossPercent / 100) * accountValue;
        response.units = loss / (entryPrice - stopLossPrice);
    }

    // If units, entryPrice, and takeProfitPrice are known, calculate takeProfitPercent
    if (units && entryPrice && takeProfitPrice && !takeProfitPercent) {
        const profit = (takeProfitPrice - entryPrice) * units;
        response.takeProfitPercent = (profit / accountValue) * 100;
    }

    // If units, entryPrice, and takeProfitPercent are known, calculate takeProfitPrice
    else if (units && entryPrice && takeProfitPercent && !takeProfitPrice) {
        const profit = (takeProfitPercent / 100) * accountValue;
        response.takeProfitPrice = entryPrice + (profit / units);
    }

    // If entryPrice, takeProfitPrice, and takeProfitPercent are known, calculate units
    else if (entryPrice && takeProfitPrice && takeProfitPercent && !units) {
        const profit = (takeProfitPercent / 100) * accountValue;
        response.units = profit / (takeProfitPrice - entryPrice);
    }

    res.json(response);
});

module.exports = app;