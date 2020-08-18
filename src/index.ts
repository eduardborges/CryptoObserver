import { InfluxDB, FieldType } from 'influx';
import { PublicClient } from 'coinbase-pro';
import * as moment from 'moment';

const influx = new InfluxDB({
  host: 'influxDB',
  port: 8086,
  database: 'cryptos',
  schema: [
    {
      measurement: 'BTCUSD',
      fields: {
        price: FieldType.FLOAT,
      },
      tags: []
    },
    {
      measurement: 'ETHUSD',
      fields: {
        price: FieldType.FLOAT,
      },
      tags: []
    }
  ]
});

const coinbaseClient = new PublicClient();

const writePrice = async () => {
  const btceurPromise = coinbaseClient.getProductTicker('BTC-EUR');
  const etheurPromise = coinbaseClient.getProductTicker('ETH-EUR');

  const result = await Promise.all([btceurPromise, etheurPromise]);

  const { price: btcPrice, time: btcTime } = result[0];
  const { price: ethPrice, time: ethTime } = result[1];

  await influx.writePoints([
    {
      measurement: 'BTCEUR',
      fields: { price: parseFloat(btcPrice) },
      timestamp: moment(btcTime).toDate(),
    },
    {
      measurement: 'ETHEUR',
      fields: { price: parseFloat(ethPrice) },
      timestamp: moment(ethTime).toDate(),
    }
  ]);

  console.log('New measurement recorded');
}

setInterval(writePrice, 1000);