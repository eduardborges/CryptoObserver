import { InfluxDB } from 'influx';
import * as WebSocket from 'ws';

type TickerData = {
  type: 'ticker';
  trade_id: number;
  sequence: number;
  time: string;
  product_id: 'BTC-EUR' | 'BTC-USD' | 'ETH-EUR' | 'ETH-USD';
  price: string;
  side: 'buy' | 'sell'; // Buy: Taker side | Sell: ?
  last_size: string;
  best_bid: string;
  best_ask: string;
}

const influx = new InfluxDB({
  host: 'influxDB',
  port: 8086,
  database: 'cryptos',
});


const ws = new WebSocket('wss://ws-feed.pro.coinbase.com');

ws.on('open', function open() {
  ws.send(JSON.stringify({
    "type": "subscribe",
    "product_ids": [
      "BTC-EUR",
      "BTC-USD",
      "ETH-EUR",
      "ETH-USD",
    ],
    "channels": ["ticker"]
  }));
});

ws.on('message', async (rawData) => {
  const data: TickerData = JSON.parse(rawData.toString());
  if (data.price) {
    await influx.writeMeasurement(data.product_id, [
      {
        fields: { price: parseFloat(data.price) },
        timestamp: new Date(data.time)
      }
    ]);
  }
});
