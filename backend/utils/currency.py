from typing import Dict

# Simple currency conversion mapping (stale rates for demo/fallback)
EXCHANGe_RATES = {
    "RUB": 1.0,
    "KZT": 5.0, # 1 RUB = 5 KZT
    "USD": 0.011,
    "EUR": 0.010,
}

def convert_currency(amount: float, from_currency: str, to_currency: str = "KZT") -> float:
    """
    Converts amount between currencies. 
    In production, this should fetch live rates from an API.
    """
    if from_currency == to_currency:
        return amount
        
    # Convert to base (RUB)
    if from_currency in EXCHANGe_RATES:
        amount_in_rub = amount / EXCHANGe_RATES[from_currency]
    else:
        return amount # Unknown currency
        
    # Convert from base to target
    if to_currency in EXCHANGe_RATES:
        return amount_in_rub * EXCHANGe_RATES[to_currency]
        
    return amount
