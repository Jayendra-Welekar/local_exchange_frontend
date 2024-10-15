import {
    ColorType,
    createChart as createLightWeightChart,
    CrosshairMode,
    ISeriesApi,
    UTCTimestamp,
  } from "lightweight-charts";
  
  export default class ChartManager {
    private candleSeries: ISeriesApi<"Candlestick">;
    private lastUpdateTime: number = 0;
    private chart;
    private currentBar: {
      open: number | null;
      high: number | null;
      low: number | null;
      close: number | null;
    } = {
      open: null,
      high: null,
      low: null,
      close: null,
    };
  
    constructor(
      ref,
      initialData,
      layout: { background: string; color: string }
    ) {
        console.log("initialData", initialData)
      const chart = createLightWeightChart(ref, {
        autoSize: true,
        overlayPriceScales: {
          ticksVisible: true,
          borderVisible: true,
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        rightPriceScale: {
          visible: true,
          ticksVisible: true,
          entireTextOnly: true,
        },
        grid: {
          horzLines: {
            visible: false,
          },
          vertLines: {
            visible: false,
          },
        },
        layout: {
          background: {
            type: ColorType.Solid,
            color: layout.background,
          },
          textColor: "white",
        },
      });
      this.chart = chart;
      this.candleSeries = chart.addCandlestickSeries();
  
      this.candleSeries.setData(
        initialData.map((data) => ({
          ...data,
          time: (data.timestamp / 1000) as UTCTimestamp,
        }))
      );
    }
    public update(updatedPrice) {
      if (!this.lastUpdateTime) {
        this.lastUpdateTime = new Date().getTime();
      }
  
      this.candleSeries.update({
        time: (this.lastUpdateTime / 1000) as UTCTimestamp,
        close: updatedPrice.close,
        low: updatedPrice.low,
        high: updatedPrice.high,
        open: updatedPrice.open,
      });
  
      if (updatedPrice.newCandleInitiated) {
        this.lastUpdateTime = updatedPrice.time;
      }
    }
    public destroy() {
      this.chart.remove();
    }
  }
  