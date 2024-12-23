"use client"
import { useEffect, useState } from "react"
import { Ticker } from "../utils/Types"
import { SignallingManager } from "../utils/SignallingManager"
import { getTicker } from "../utils/HttpClient"
import Image from "next/image"
export default function MarketBar({ symbol: market }: { symbol: string }) {

    const [ticker, setTicker] = useState<Ticker>({"firstPrice": "0",
        "high": "0",
        "lastPrice": "0",
        "low": "0",
        "priceChange": "0",
        "priceChangePercent": "0",
        "quoteVolume": "0",
        "symbol": "0",
        "trades": "0",
        "volume": "0"})
    useEffect(() => {
        getTicker(market).then(data => {
            console.log("Ticker data: ", data)
            setTicker(data)
        })
         SignallingManager.getInstance().registerCallback("ticker", function(data: Partial<Ticker>){
            setTicker(prevTicker => {
                return {
                    firstPrice: data?.firstPrice ?? prevTicker?.firstPrice ?? '',
                    lastPrice: data?.lastPrice ?? prevTicker?.lastPrice ?? '',
                    high: data?.high ?? prevTicker?.high ?? '',
                    low: data?.low ?? prevTicker?.low ?? '',
                    priceChange: data?.priceChange ?? prevTicker?.priceChange ?? '',
                    priceChangePercent: data?.priceChangePercent ?? prevTicker?.priceChangePercent ?? '',
                    quoteVolume: data?.quoteVolume ?? prevTicker?.quoteVolume ?? '',
                    symbol: data?.symbol ?? prevTicker?.symbol ?? '',
                    trades: data?.trades ?? prevTicker?.trades ?? '',
                    volume: data?.volume ?? prevTicker?.volume ?? ''
                }
            })
         }, `TICKER-${market}`)
         SignallingManager.getInstance().sendMessage({"method": "SUBSCRIBE",  "params": [`ticker.${market}`]})

         return ()=>{
            SignallingManager.getInstance().derigisterCallback("ticker", `TICKER-${market}`)
         SignallingManager.getInstance().sendMessage({"method": "UNSUBSCRIBE",  "params": [`ticker.${market}`]})

         }
    }, [market])


    return (
        <div className="w-full h-14 px-3 flex justify-start items-center border-y-[1px] border-slate-800 text-white relative space-x-10 ">
            <div className="flex justify-start items-center text-white ml-8">
            <div className="h-8 w-8 rounded-full overflow-hidden mx-2">
            <Image src={`/images/${market.split('_')[0]}.png`} alt=""  width={100} height={100}/>
            </div>
            {market}
            </div>
            <div className="flex flex-row justify-between items-center space-x-10 ">
                <div className="flex flex-col justify-center items-center">
                
                    <div className={`text-lg ${parseFloat(ticker?.priceChange || "0") > 0 ? "text-green-500" : "text-red-500"}`}>
                        {ticker.lastPrice}
                    </div>
                    <div className="text-md">
                        ${ticker.lastPrice}
                    </div>
                </div>
                <div className="flex flex-col ">
                    <div className="text-xs text-slate-400 font-semibold">
                        24H Change
                    </div>
                    <div className={`text-sm ${parseFloat(ticker?.priceChange || "0") > 0 ? "text-green-500" : "text-red-500"} `}>
                        {parseFloat(ticker?.priceChange || "0").toFixed(2)}   {parseFloat(ticker?.priceChangePercent || "0").toFixed(2)}%
                    </div>
                </div>
                <div className="flex flex-col ">
                    <div className="text-xs text-slate-400 font-semibold">
                        24H High
                    </div>
                    <div className={`text-sm `}>
                        {ticker?.high}
                    </div>
                </div>
                <div className="flex flex-col ">
                    <div className="text-xs text-slate-400 font-semibold">
                        24H Low
                    </div>
                    <div className={`text-sm `}>
                        {ticker?.low}
                    </div>
                </div>
                <div className="flex flex-col ">
                    <div className="text-xs text-slate-400 font-semibold">
                        24H Volume
                    </div>
                    <div className={`text-sm `}>
                        {ticker.volume}
                    </div>
                </div>
            </div>
        </div>
    )

}