"""Backtest di DCA spot su BTC/ETH e varianti "smart DCA".

Dati: Coin Metrics community data (prezzo giornaliero USD, MVRV), scaricati da
https://github.com/coinmetrics/data (csv/btc.csv, csv/eth.csv).

Regole comuni
- Ogni lunedì si versano BASE euro/dollari sul conto (cash, rendimento 0%).
- La strategia decide quanto comprare: min(cash, BASE * moltiplicatore).
- Commissione + spread: FEE per ogni compravendita.
- Nessuna tassa nel calcolo (in Italia 33% sulle plusvalenze crypto dal 2026).

Uso: python research/dca_backtest.py <cartella_dati>
"""
import sys
from dataclasses import dataclass

import numpy as np
import pandas as pd

BASE = 50.0
FEE = 0.005


def load(data_dir):
    px = {}
    for a in ("btc", "eth"):
        d = pd.read_csv(f"{data_dir}/{a}.csv", usecols=["time", "PriceUSD", "CapMVRVCur"],
                        parse_dates=["time"]).dropna(subset=["PriceUSD"]).set_index("time")
        d["mayer"] = d.PriceUSD / d.PriceUSD.rolling(200).mean()
        px[a] = d
    return px


# --- regole di moltiplicazione -------------------------------------------------
def plain(row):
    return 1.0


def mayer(row):
    m = row.mayer
    if np.isnan(m):
        return 1.0
    return 2.0 if m < 0.8 else 1.5 if m < 1.0 else 1.0 if m < 1.5 else 0.5 if m < 2.4 else 0.0


def mvrv(row):
    v = row.CapMVRVCur
    if np.isnan(v):
        return 1.0
    return 2.0 if v < 1.0 else 1.5 if v < 1.5 else 1.0 if v < 2.5 else 0.5 if v < 3.5 else 0.0


RULES = {"DCA semplice": (plain, False), "DCA Mayer": (mayer, False),
         "DCA MVRV": (mvrv, False), "DCA Mayer + take profit": (mayer, True)}


@dataclass
class Result:
    invested: float
    final: float
    irr: float
    max_dd: float        # drawdown massimo del valore del conto dal picco
    worst_vs_inv: float  # peggior rapporto valore/versato - 1


def irr_weekly(flows):
    """IRR annualizzato da flussi settimanali (negativi = versamenti)."""
    flows = np.asarray(flows, float)
    lo, hi = -0.99, 1.0
    t = np.arange(len(flows)) / 52.0
    f = lambda r: np.sum(flows / (1 + r) ** t)
    if f(lo) * f(hi) > 0:
        return float("nan")
    for _ in range(200):
        mid = (lo + hi) / 2
        if f(lo) * f(mid) <= 0:
            hi = mid
        else:
            lo = mid
    return mid


def simulate(px, weights, rule, take_profit, start, end, lump=None):
    assets = list(weights)
    idx = px[assets[0]].loc[start:end].index
    for a in assets[1:]:
        idx = idx.intersection(px[a].loc[start:end].index)
    price = {a: px[a].PriceUSD.reindex(idx).to_numpy() for a in assets}
    mult = {a: np.array([rule(r) for r in px[a].reindex(idx).itertuples()]) for a in assets}
    may = {a: px[a].mayer.reindex(idx).to_numpy() for a in assets}
    monday = idx.weekday == 0
    cash, coins, invested = 0.0, {a: 0.0 for a in assets}, 0.0
    flows, values, invs = [], np.empty(len(idx)), np.empty(len(idx))
    for i in range(len(idx)):
        if lump is not None and i == 0:
            cash, invested = lump, lump
            flows.append(-lump)
            for a in assets:
                amt = lump * weights[a]
                coins[a] += amt * (1 - FEE) / price[a][0]
                cash -= amt
        elif monday[i]:
            if lump is None:
                cash += BASE
                invested += BASE
                flows.append(-BASE)
            else:
                flows.append(0.0)
            for a in assets:
                p = price[a][i]
                if take_profit and may[a][i] > 2.4 and coins[a] > 0:
                    sold = coins[a] * 0.05
                    coins[a] -= sold
                    cash += sold * p * (1 - FEE)
                if lump is None:
                    amt = min(cash, BASE * weights[a] * mult[a][i])
                    if amt > 0:
                        coins[a] += amt * (1 - FEE) / p
                        cash -= amt
        values[i] = cash + sum(coins[a] * price[a][i] for a in assets)
        invs[i] = invested
    live = values > 0
    peak = np.maximum.accumulate(values[live])
    dd = (values[live] / peak - 1).min()
    worst = (values / np.maximum(invs, 1e-9) - 1)[invs > 0].min()
    flows[-1] += values[-1]
    return Result(invested, values[-1], irr_weekly(flows), dd, worst)


def fmt(r):
    return (f"versato {r.invested:8.0f}  finale {r.final:9.0f}  x{r.final / r.invested:5.2f}  "
            f"IRR {r.irr * 100:6.1f}%  maxDD {r.max_dd * 100:6.1f}%  peggio vs versato {r.worst_vs_inv * 100:6.1f}%")


def main(data_dir):
    px = load(data_dir)
    end = min(px[a].index.max() for a in px)
    print(f"Dati fino al {end.date()}  (fee {FEE * 100:.1f}%, versamento {BASE:.0f}/settimana)\n")

    portfolios = {"BTC": {"btc": 1.0}, "ETH": {"eth": 1.0}, "50/50 BTC-ETH": {"btc": 0.5, "eth": 0.5}}
    periods = [("2016-01-01", "Da gen 2016"), ("2017-12-17", "Dal picco dic 2017"),
               ("2021-11-10", "Dal picco nov 2021"), ("2025-10-06", "Dal picco ott 2025")]

    print("=== Periodi fissi fino a fine dati ===")
    for pname, w in portfolios.items():
        for start, label in periods:
            print(f"\n[{pname}] {label}")
            for rname, (rule, tp) in RULES.items():
                print(f"  {rname:26s} {fmt(simulate(px, w, rule, tp, start, end))}")

    print("\n=== Finestre mobili (partenza ogni mese) ===")
    for pname, w in portfolios.items():
        first = "2014-01-01" if pname == "BTC" else "2016-06-01"
        for years in (3, 5):
            starts = pd.date_range(first, end - pd.DateOffset(years=years), freq="MS")
            for rname, (rule, tp) in RULES.items():
                rs = [simulate(px, w, rule, tp, s, s + pd.DateOffset(years=years)) for s in starts]
                irrs = np.array([r.irr for r in rs])
                dds = np.array([r.max_dd for r in rs])
                loss = np.mean([r.final < r.invested for r in rs])
                print(f"[{pname}] {years}a {rname:26s} n={len(rs):3d}  IRR mediano {np.nanmedian(irrs) * 100:6.1f}%  "
                      f"IRR 10° perc {np.nanpercentile(irrs, 10) * 100:6.1f}%  % finestre in perdita {loss * 100:5.1f}%  "
                      f"maxDD mediano {np.median(dds) * 100:6.1f}%  maxDD peggiore {dds.min() * 100:6.1f}%")

    print("\n=== Lump sum 5000 (confronto) ===")
    for pname, w in portfolios.items():
        for start, label in periods:
            r = simulate(px, w, plain, False, start, end, lump=5000.0)
            print(f"[{pname}] {label:22s} {fmt(r)}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "data")
