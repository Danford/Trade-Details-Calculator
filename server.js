const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

function calculateStopLossPercent(entryPrice, stopLossPrice) {
    return (1 - stopLossPrice / entryPrice) * 100;
}

function calculateStopLossPercentByRisk(units, riskPercent, accountValue) {
    return accountValue * (riskPercent / 100) / units;
}

function calculateStopLossPrice(entryPrice, stopLossPercent) {
    return entryPrice - (entryPrice * (stopLossPercent / 100));
}

function calculateUnits(entryPrice, stopLossPrice, accountValue, riskPercent) {
    const risk = (riskPercent / 100) * accountValue;
    return risk / (entryPrice - stopLossPrice);
}

function calculateTakeProfitPercent(entryPrice, takeProfitPrice) {
    return (takeProfitPrice / entryPrice - 1) * 100;
}

function calculateTakeProfitPrice(entryPrice, takeProfitPercent) {
    return entryPrice + (entryPrice * (takeProfitPercent / 100));
}

function calculateRiskCurrency(entryPrice, stopLossPrice, units) {
    return (entryPrice - stopLossPrice) * units;
}

function calculateRiskCurrencyAlt(accountValue, riskAccountPercent) {
    return accountValue * (riskAccountPercent / 100);
}

function calculateAccountPercentRisk(riskCurrency, accountValue) {
    return (riskCurrency / accountValue) * 100;
}

function updateAllFields(response, fieldToSkip) {
    updateFieldAccountValue(response);
    updateFieldUnits(response);
    updateFieldEntryPrice(response);
    updateFieldStopLossPrice(response);
    updateFieldStopLossPercent(response);
    updateFieldTakeProfitPrice(response);
    updateFieldTakeProfitPercent(response);
    updateFieldRiskPercent(response);
    updateFieldRiskCurrency(response);
}

function updateFieldAccountValue(response) {
    // Recalculate based on new account value
    if (response.entryPrice && response.units) {
        if (response.stopLossPrice) {
            response.riskCurrency = calculateRiskCurrency(response.entryPrice, response.stopLossPrice, response.units);

            if (response.accountValue) {
                response.riskPercent = calculateAccountPercentRisk(response.riskCurrency, response.accountValue)
            }
        }
    }
}

function updateFieldUnits(response) {
    if (response.units && response.entryPrice && response.stopLossPrice) {
        response.riskCurrency = calculateRiskCurrency(response.entryPrice, response.stopLossPrice, response.units);
        
        if (response.accountValue) {
            response.riskPercent = calculateAccountPercentRisk(response.riskCurrency, response.accountValue)
        }
    }
}

function updateFieldEntryPrice(response) {
    if (response.entryPrice)
    {
        if (response.stopLossPercent) {
            response.stopLossPrice = calculateStopLossPrice(response.entryPrice, response.stopLossPercent);
            response.stopLossPercent = calculateStopLossPercent(response.entryPrice, response.stopLossPrice);
        }

        if (response.takeProfitPercent) {
            response.takeProfitPrice = calculateTakeProfitPrice(response.entryPrice, response.takeProfitPercent);
            response.takeProfitPercent = calculateTakeProfitPercent(response.entryPrice, response.takeProfitPrice);
        }
    }
}

function updateFieldStopLossPrice(response) {
    if (response.entryPrice && response.stopLossPrice) {
        response.stopLossPercent = calculateStopLossPercent(response.entryPrice, response.stopLossPrice);
    }
    else if (response.units && response.riskPercent && response.accountValue) {
        response.stopLossPercent = calculateStopLossPercentByRisk(response.units, response.riskPercent, response.accountValue);
    }
}

function updateFieldStopLossPercent(response) {
    if (response.stopLossPercent && response.entryPrice) {
        response.stopLossPrice = calculateStopLossPrice(response.entryPrice, response.stopLossPercent);
    }
}

function updateFieldTakeProfitPrice(response) {
    if (response.takeProfitPrice && response.entryPrice) {
        response.takeProfitPercent = calculateTakeProfitPercent(response.entryPrice, response.takeProfitPrice);
    }
}

function updateFieldTakeProfitPercent(response) {
    if (response.entryPrice && response.takeProfitPercent) {
        response.takeProfitPrice = calculateTakeProfitPrice(response.entryPrice, response.takeProfitPercent);
    }
}

function updateFieldRiskCurrency(response) {
    if (response.riskCurrency && response.accountValue) {
        response.riskPercent = calculateAccountPercentRisk(response.riskCurrency, response.accountValue);
        response.units = calculateUnits(response.entryPrice, response.stopLossPrice, response.accountValue, response.riskPercent);
    }
}

function updateFieldRiskPercent(response) {
    if (response.accountValue && response.riskPercent) {
        response.riskCurrency = calculateRiskCurrencyAlt(response.accountValue, response.riskPercent);
    }
    else if (response.units && response.entryPrice && response.stopLossPrice) {
        response.riskCurrency = calculateRiskCurrency(response.entryPrice, response.stopLossPrice, response.units);
    }
}

const validateNumberField = (value, fieldName, minValue = 0, maxValue = Infinity) => {
    if (value !== undefined && (typeof value !== 'number' || value <= minValue || value > maxValue)) {
        throw new Error(`Invalid ${fieldName}. Must be a positive number between ${minValue} and ${maxValue}.`);
    }
}

const app = express();

app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

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
    try {
        validateNumberField(accountValue, 'account value', 0);
        validateNumberField(units, 'units', 0);
        validateNumberField(riskCurrency, 'risk currency', 0);
        validateNumberField(riskPercent, 'risk percent', 0, 100);
        validateNumberField(entryPrice, 'entry price', 0);
        validateNumberField(stopLossPrice, 'stop loss price', 0);
        validateNumberField(stopLossPercent, 'stop loss percent', 0, 100);
        validateNumberField(takeProfitPrice, 'take profit price', 0);
        validateNumberField(takeProfitPercent, 'take profit percent', 0, 100);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }

    if (stopLossPrice && entryPrice && stopLossPrice >= entryPrice) {
        return res.status(400).json({ error: 'Invalid stop loss. Stop loss must be less than entry price.'});
    }

    if (takeProfitPrice && entryPrice && takeProfitPrice <= entryPrice) {
        return res.status(400).json({ error: 'Invalid take profit price. Take profit price must be greater than entry price.'});
    }

    let response = {};

    response.accountValue = accountValue;
    response.units = units;
    response.riskCurrency = riskCurrency;
    response.riskPercent = riskPercent;
    response.entryPrice = entryPrice;
    response.stopLossPrice = stopLossPrice;
    response.stopLossPercent = stopLossPercent;
    response.takeProfitPrice = takeProfitPrice;
    response.takeProfitPercent = takeProfitPercent;
    
    switch (fieldToUpdate) {
        case 'accountValue':
            updateFieldAccountValue(response);
            break;

        case 'units':
            updateFieldUnits(response);
            break;

        case 'entryPrice':
            updateFieldEntryPrice(response);
            break;

        case 'stopLossPrice':
            updateFieldStopLossPrice(response);
            break;

        case 'stopLossPercent':
            updateFieldStopLossPercent(response);
            break;

        case 'takeProfitPrice':
            updateFieldTakeProfitPrice(response);
            break;

        case 'takeProfitPercent':
            updateFieldTakeProfitPercent(response);
            break;

        case 'riskCurrency':
            updateFieldRiskCurrency(response);
            break;
        
        case 'riskPercent':
            updateFieldRiskPercent(response);
            break;
        default:
            return res.status(400).json({ error: 'Invalid field name' });
    }

    updateAllFields(response, fieldToUpdate);

    res.json(response);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const server = app.listen(PORT, () => {
	if (process.env.NODE_ENV !== 'test') {
    		console.log(`Server is running on port ${PORT}`);
	}
});

module.exports = {
    app,
    server
};
