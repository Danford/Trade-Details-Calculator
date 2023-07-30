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

function calculateStopLossPercent(entryPrice, stopLossPrice) {
    return entryPrice * (1 - (stopLossPrice / entryPrice));
}

function calculateStopLossPrice(entryPrice, stopLossPercent) {
    return entryPrice - (entryPrice * (stopLossPercent / 100));
}

function calculateUnitsForStopLoss(entryPrice, stopLossPrice, stopLossPercent, accountValue) {
    const loss = (stopLossPercent / 100) * accountValue;
    return loss / (entryPrice - stopLossPrice);
}

function calculateTakeProfitPercent(entryPrice, takeProfitPrice, units, accountValue) {
    return (takeProfitPrice / entryPrice - 1) * 100;
}

function calculateTakeProfitPrice(entryPrice, takeProfitPercent) {
    return entryPrice + (entryPrice * (takeProfitPercent / 100));
}

function calculateRiskCurrency(entryPrice, stopLossPrice, units) {
    return (entryPrice - stopLossPrice) * units;
}

function calculateAccountPercentRisk(riskCurrency, accountValue) {
    return (riskCurrency / accountValue) * 100;
}

app.post('/calculate', (req, res) => {
    let {
        accountValue,
        units,
        riskCurrency,
        riskPercent,
        entryPrice,
        stopLossPrice,
        stopLossPercent,
        takeProfitPrice,
        takeProfitPercent,
        fieldToUpdate
    } = req.body;

    // Validate input fields
    
    if (typeof accountValue !== 'number' || accountValue <= 0) {
        return res.status(400).json({ error: 'Invalid account value. Must be a positive number.' });
    }

    if (units && typeof units !== 'number' || units <= 0) {
        return res.status(400).json({ error: 'Invalid units. Must be a positive number.' });
    }

    if (riskCurrency && typeof riskCurrency !== 'number' || riskCurrency <= 0) {
        return res.status(400).json({ error: 'Invalid riskCurrency. Must be a positive number.' });
    }
    
    if (riskPercent && typeof riskPercent !== 'number' || riskPercent <= 0 || riskPercent > 100) {
        return res.status(400).json({ error: 'Invalid units. Must be a positive number up to 100.' });
    }

    if (entryPrice && typeof entryPrice !== 'number' || entryPrice <= 0) {
        return res.status(400).json({ error: 'Invalid entry price. Must be a positive number.' });
    }

    if (stopLossPrice && typeof stopLossPrice !== 'number') {
        return res.status(400).json({ error: 'Invalid stop loss price. Must be a number.' });
    }

    if (stopLossPercent && typeof stopLossPercent !== 'number' || stopLossPercent < 0 || stopLossPercent > 100) {
        return res.status(400).json({ error: 'Invalid stop loss percent. Must be between 0 and 100.' });
    }

    if (takeProfitPrice && typeof takeProfitPrice !== 'number' || takeProfitPrice <= 0) {
        return res.status(400).json({ error: 'Invalid take profit price. Must be a positive number.' });
    }

    if (takeProfitPercent && typeof takeProfitPercent !== 'number' || takeProfitPercent <= 0) {
        return res.status(400).json({ error: 'Invalid take profit percent. Must be a positive number.' });
    }

    const validFields = [
        'accountValue',
        'units',
        'riskCurrency',
        'riskPercent',
        'entryPrice',
        'stopLossPrice',
        'stopLossPercent',
        'takeProfitPrice',
        'takeProfitPercent',
    ];

    let response = {};
    
    // Calculate stopLossPrice
    if (entryPrice && stopLossPercent && !stopLossPrice) {
        stopLossPrice = calculateStopLossPrice(entryPrice, stopLossPercent);
        response.stopLossPrice = stopLossPrice;
    }

    // Calculate stopLossPercent
    if (entryPrice && stopLossPrice && !stopLossPercent) {
        stopLossPercent = calculateStopLossPercent(entryPrice, stopLossPrice);
        response.stopLossPercent = stopLossPercent;
    }
    
    // Calculate risk currency
    if (units && entryPrice && stopLossPercent && !riskCurrency) {
        riskCurrency = calculateRiskCurrency(entryPrice, stopLossPrice, units);
        response.riskCurrency = riskCurrency;
    }

    // Calculate risk percent
    if (riskCurrency && !riskPercent) {
        riskPercent = calculateAccountPercentRisk(riskCurrency, accountValue);
        response.riskPercent = riskPercent;
    }

    // Calculate takeProfitPrice
    if (entryPrice && takeProfitPercent && !takeProfitPrice) {
        takeProfitPrice = calculateTakeProfitPrice(entryPrice, takeProfitPercent);
        response.takeProfitPrice = takeProfitPrice;
    }

    // Calculate units based on stopLoss
    if (entryPrice && stopLossPrice && stopLossPercent && !units) {
        const loss = (stopLossPercent / 100) * accountValue;
        response.units = loss / (entryPrice - stopLossPrice);
    }

    switch (fieldToUpdate) {
        case 'accountValue':
            // Recalculate based on new account value
            if (entryPrice && stopLossPrice) {
                response.riskCurrency = calculateRiskCurrency(entryPrice, stopLossPrice, units);
                response.riskPercent = calculateAccountPercentRisk(response.riskCurrency, accountValue)
            }
            if (entryPrice && takeProfitPrice) {
                response.riskCurrency = calculateRiskCurrency(entryPrice, stopLossPrice, units);
                response.riskPercent = calculateAccountPercentRisk(response.riskCurrency, accountValue);
            }
            break;

        case 'units':
            if (entryPrice && stopLossPrice) {
                response.riskCurrency = calculateRiskCurrency(entryPrice, stopLossPrice, units);
                response.riskPercent = calculateAccountPercentRisk(response.riskCurrency, accountValue)
            }
            if (entryPrice && takeProfitPrice) {
                response.takeProfitPercent = calculateTakeProfitPercent(entryPrice, takeProfitPrice, units, accountValue);
            }
            break;

        case 'entryPrice':
            if (stopLossPrice && stopLossPercent) {
                response.units = calculateUnitsForStopLoss(entryPrice, stopLossPrice, stopLossPercent, accountValue);
            }
            if (units && takeProfitPrice) {
                response.takeProfitPercent = calculateTakeProfitPercent(entryPrice, takeProfitPrice, units, accountValue);
            }
            break;

        case 'stopLossPrice':
            if (entryPrice && stopLossPercent) {
                response.units = calculateUnitsForStopLoss(entryPrice, stopLossPrice, stopLossPercent, accountValue);
                response.riskCurrency = calculateRiskCurrency(entryPrice, stopLossPrice, response.units);
                response.riskPercent = calculateAccountPercentRisk(response.riskCurrency, accountValue);
            }
            break;

        case 'stopLossPercent':
            if (entryPrice && stopLossPrice) {
                response.units = calculateUnitsForStopLoss(entryPrice, stopLossPrice, stopLossPercent, accountValue);
                response.riskCurrency = calculateRiskCurrency(entryPrice, stopLossPrice, response.units);
                response.riskPercent = calculateAccountPercentRisk(response.riskCurrency, accountValue);
            }
            break;

        case 'takeProfitPrice':
            if (units && entryPrice) {
                response.takeProfitPercent = calculateTakeProfitPercent(entryPrice, takeProfitPrice, units, accountValue);
            }
            break;

        case 'takeProfitPercent':
            if (entryPrice && units) {
                response.takeProfitPrice = calculateTakeProfitPrice(entryPrice, takeProfitPercent, accountValue, units);
            }
            break;
        case 'riskCurrency':
            if (entryPrice && units) {
                response.riskPercent = calculateAccountPercentRisk(riskCurrency, accountValue);
            }
        default:
            return res.status(400).json({ error: 'Invalid field name' });
    }

    res.json(response);
});


module.exports = app;