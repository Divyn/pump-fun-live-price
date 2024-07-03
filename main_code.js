function _1(md){return(
md`# Pump fun visualisation`
)}

function _token(){return(
"ory_at_"
)}

function _url(token){return(
`wss://streaming.bitquery.io/eap?token=${token}`
)}

function _query(){return(
`
  subscription{
    Solana {
      DEXTrades(
        where: {Trade: {Dex: {ProtocolName: {is: "pump"}}}, Transaction: {Result: {Success: true}}}
      ) {
        Instruction {
          Program {
            Method
          }
        }
        Trade {
          Dex {
            ProtocolFamily
            ProtocolName
          }
          Buy {
            Amount
            Account {
              Address
            }
            Currency {
              Name
              Symbol
              MintAddress
              Decimals
              Fungible
              Uri
            }
            Price
          }
          Sell {
            Amount
            Account {
              Address
            }
            Currency {
              Name
              Symbol
              MintAddress
              Decimals
              Fungible
              Uri
            }
            Price
          }
        }
        Transaction {
          Signature
        }
      }
    }
  }
`
)}

function _conn(url){return(
new WebSocket(url)
)}

function _data(Generators,url,query){return(
Generators.observe(notify => {
  const data = [];
  const socket = new WebSocket(url,["graphql-ws"]);
  socket.addEventListener("open", () => {
    console.log("WebSocket connection opened");
    // Send initialization message
    const initMessage = JSON.stringify({ type: "connection_init" });
    socket.send(initMessage);

    // After initialization, send the actual subscription message
    setTimeout(() => {
      const message = JSON.stringify({
        type: "start",
        id: "1",
        payload: {
          query: query
        }
      });
      socket.send(message);
    }, 1000);
  });

  socket.addEventListener("message", message => {
    const parsedMessage = JSON.parse(message.data);
    if (parsedMessage.type === "data") {
      const dexTrades = parsedMessage.payload.data.Solana.DEXTrades;
      
      dexTrades.forEach(trade => {
        const buyPrice = trade.Trade.Buy.Price;
        data.push({
          time: new Date(),
          buyPrice: buyPrice // Storing the buy price
        });
      });
      notify(data);
    }
  });

  socket.addEventListener("close", () => {
    console.log("WebSocket connection closed");
  });

  socket.addEventListener("error", error => {
    console.error("WebSocket Error:", error);
  });

  notify(data);
  return () => socket.close();
})
)}

function _7(Plot,data){return(
Plot.auto(data, {x: "time", y: "buyPrice", mark: "dot"}).plot()
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("token")).define("token", _token);
  main.variable(observer("url")).define("url", ["token"], _url);
  main.variable(observer("query")).define("query", _query);
  main.variable(observer("conn")).define("conn", ["url"], _conn);
  main.variable(observer("data")).define("data", ["Generators","url","query"], _data);
  main.variable(observer()).define(["Plot","data"], _7);
  return main;
}
