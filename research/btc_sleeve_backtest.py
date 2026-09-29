"""Quota fissa di BTC (o BTC/ETH) + liquidità remunerata, ribilanciata ogni trimestre.

Versamento settimanale BASE, diviso secondo i pesi obiettivo. La liquidità rende
CASH_YIELD annuo (proxy di un monetario / BTP breve). Commissione FEE sulle
compravendite crypto. Nessuna tassa nel calcolo.

Uso: python research/btc_sleeve_backtest.py <cartella_dati>
"""
import sys

import numpy as np
import pandas as pd

from dca_backtest import BASE, FEE, irr_weekly, load

CASH_YIELD = 0.025


def simulate(px, crypto_w, start, end, lump=None):
    """crypto_w: dict asset -> peso sul portafoglio totale; il resto è liquidità."""
    assets = list(crypto_w)
    idx = px[assets[0]].loc[start:end].index
    for a in assets[1:]:
        idx = idx.intersection(px[a].loc[start:end].index)
    price = {a: px[a].PriceUSD.reindex(idx).to_numpy() for a in assets}
    daily = (1 + CASH_YIELD) ** (1 / 365) - 1
    cash, coins, invested = 0.0, {a: 0.0 for a in assets}, 0.0
    flows, values, invs = [], np.empty(len(idx)), np.empty(len(idx))
    last_q = None
    for i, day in enumerate(idx):
        cash *= 1 + daily
        new_money = 0.0
        if lump is not None and i == 0:
            new_money = lump
        if day.weekday() == 0:
            if lump is None:
                new_money += BASE
            flows.append(-new_money)
        elif new_money:
            flows.append(-new_money)
        if new_money:
            cash += new_money
            invested += new_money
            for a, w in crypto_w.items():
                amt = new_money * w
                coins[a] += amt * (1 - FEE) / price[a][i]
                cash -= amt
        q = (day.year, (day.month - 1) // 3)
        if last_q is not None and q != last_q:
            total = cash + sum(coins[a] * price[a][i] for a in assets)
            for a, w in crypto_w.items():
                diff = total * w - coins[a] * price[a][i]
                coins[a] += diff * (1 - FEE) / price[a][i] if diff > 0 else diff / price[a][i]
                cash -= diff if diff > 0 else diff * (1 - FEE)
        last_q = q
        values[i] = cash + sum(coins[a] * price[a][i] for a in assets)
        invs[i] = invested
    live = values > 0
    peak = np.maximum.accumulate(values[live])
    dd = (values[live] / peak - 1).min()
    flows[-1] += values[-1]
    return invested, values[-1], irr_weekly(flows), dd


def main(data_dir):
    px = load(data_dir)
    end = min(px[a].index.max() for a in px)
    print(f"Dati fino al {end.date()}  liquidità {CASH_YIELD * 100:.1f}%/anno, fee {FEE * 100:.1f}%\n")
    mixes = {"10% BTC": {"btc": .10}, "20% BTC": {"btc": .20}, "30% BTC": {"btc": .30},
             "20% BTC/ETH 50-50": {"btc": .10, "eth": .10}}
    for first, label in (("2016-06-01", "tutte le partenze 2016+"), ("2019-01-01", "solo partenze 2019+")):
        print(f"=== Finestre mobili, {label} ===")
        for years in (3, 5):
            starts = pd.date_range(first, end - pd.DateOffset(years=years), freq="MS")
            for name, w in mixes.items():
                rs = [simulate(px, w, s, s + pd.DateOffset(years=years)) for s in starts]
                irr = np.array([r[2] for r in rs])
                dd = np.array([r[3] for r in rs])
                loss = np.mean([r[1] < r[0] for r in rs])
                print(f"{years}a {name:20s} n={len(rs):3d} IRR mediano {np.nanmedian(irr) * 100:5.1f}%  "
                      f"IRR 10° perc {np.nanpercentile(irr, 10) * 100:5.1f}%  in perdita {loss * 100:4.1f}%  "
                      f"maxDD mediano {np.median(dd) * 100:6.1f}%  maxDD peggiore {dd.min() * 100:6.1f}%")
        print()
    print("=== Lump sum 5000 dal picco ===")
    for start in ("2017-12-17", "2021-11-10", "2025-10-06"):
        for name, w in mixes.items():
            inv, fin, irr, dd = simulate(px, w, start, end, lump=5000.0)
            print(f"{start} {name:20s} finale {fin:8.0f}  IRR {irr * 100:6.1f}%  maxDD {dd * 100:6.1f}%")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "data")
