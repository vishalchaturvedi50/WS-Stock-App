
/* Define and declare socketUrl */
const socketUrl = "ws://stocks.mnet.website";

/* TBL Body Id */
const tblBlockId = 'tbl-stock';

/* Round off the value recieved upto the desired value */
const priceRoundOfUpto = 4;

/* PRICE TREND attribute which gets attached to <td> */
const priceTrendAttribute = 'pricetrend';

/* CURRENT TIME */
let currentTime = undefined;

/*  */

/* Function to control web socket  */
function webSocketConnectionFn() {
    /* Define socket object */
    let webSocket = new WebSocket(socketUrl);

    /* Once a web socket is open we will send an initial request  */
    webSocket.onopen = function () {
        /* Once the web socket is open send a empty request */
        webSocket.send({});
    };

    /* ONCE WE START RECEIVING MESSAGE */
    webSocket.onmessage = function (ev) {
        currentTime = formatCurrentTimeFn()
        webSocketDataHandlingFn(JSON.parse(ev.data));
    };

    /* IF THE WEB SOCKET IS CLOSED/DISCONNE  */
    webSocket.onclose = function () {
        console.log("on close");
        /* If the web socket get closed then we will reconnect
        Placing the function call in `setTimeOut` function with 0 as time out for JS to finish
        all the process before reconnecting.
        */
        setTimeout(() => {
            webSocketConnectionFn();
        });
    };

    /* IF the web socket encounters an error */
    webSocket.onerror = function (ev) {
        console.log(ev);
    }
};

/* Function to format current time to the required format */
function formatCurrentTimeFn() {
    /* return variable declaration */
    let retVal = ``;
    /* assign locale date string with required format */
    retVal = new Date().toLocaleDateString("en-US", {
        month: 'short', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric'
    });
    /*return the value */
    return retVal;
}

/** 
 * Function to process the data received from the web socket connection
 * @param data - Data received from Web socket [[name,price],[name,price]]
 *
*/
function webSocketDataHandlingFn(data) {

    /* Get the element with help of the id identifier */
    let tbodyIdentifier = document.getElementById(tblBlockId);

    /* for each data received */
    data.forEach(([name, price]) => {

        /* Round off the price  */
        price = parseFloat(price).toFixed(priceRoundOfUpto);

        /* Get the required child element from the tbody */
        let reqChildElem = tbodyIdentifier.children.namedItem(name);

        /* If the reqChild is not found (i.e. null)  */
        if (!reqChildElem) {
            /*   create a new child and append it into the identifier */
            tbodyIdentifier.appendChild(createChildForTbodyFn(name, price));
        }
        else {
            /* ELSE - Modify the previously created element */
            modifyChildForTbodyFn(price, reqChildElem);

        }

    });
}


/***
 * Function to create a first time child element for the table
 * @param name - name of the stock
 * @param price - price of the stock
 */
function createChildForTbodyFn(name, price) {
    /* create node element */
    let node = document.createElement("tr");
    /* set name as the id of the node */
    node.id = name;
    /* create sub node - stock name */
    let stockName = document.createElement("td");
    stockName.innerHTML = `${name}`;
    /* create sub node - stock price */
    let stockPrice = document.createElement("td");
    stockPrice.setAttribute(priceTrendAttribute, "");
    stockPrice.innerHTML = `${price}`;
    /* create sub node - last updated time */
    let lastUpdated = document.createElement("td");
    lastUpdated.innerHTML = currentTime;
    /* Append all the three child element to main node*/
    node.appendChild(stockName);
    node.appendChild(stockPrice);
    node.appendChild(lastUpdated);
    /* Return the node */
    return node;
}

/**
 * Function to modify a preselected child element
 * @param price - current stock price
 * @param reqChildElem - the element which needs modification
 */
function modifyChildForTbodyFn(price, reqChildElem) {
    /* as we know we have stock price at second location hence 
    we can directly select the required children */
    let stockPriceChild = reqChildElem.children.item(1);

    /* Get the previous price */
    let prevPrice = parseInt(stockPriceChild.innerHTML);
    /* Update the stock price <td> with the new required price */
    stockPriceChild.innerHTML = price;
    /* get the new attribute value . we will use attribute selector to style the CSS */
    let attributeVal = prevPrice < price ? "up" : "down";
    /* set the attributeval for priceTrendAttribute */
    stockPriceChild.setAttribute(priceTrendAttribute, attributeVal);
    /* We know that second element is last updated time hence update it with currentime */
    reqChildElem.children.item(2).innerHTML = currentTime;
}

/* IIFE which attach's a function on document onload and calls the webSocketConnectionFn */
(document.onload = function () {
    /* Call web socket connection function */
    webSocketConnectionFn();
})();