// Wait for the DOM to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', () => {
    // Get references to various DOM elements
    const addressURL = document.getElementById('address');
    const convert = document.getElementById('convert');
    const result = document.getElementById('result');

    // API URL to predict fraudulent Ether Address
    const apiURL = "https://sensic-sentinel-mlapi.onrender.com/?AddressEther=";
    
    let predictColor;
    let Predict, urlPrediction;

    // Fetch and display Fear & Greed Index
    fetch("https://api.alternative.me/fng/")
        .then(response => response.json())
        .then(data => {
            const feargreedindex = data.data[0].value;
            const feargreedclasses = data.data[0].value_classification;
            feargreed.innerHTML = `Fear & Greed Index: ${feargreedindex}`;
            feargreedclass.innerHTML = `Class: ${feargreedclasses}`;
        })
        .catch(error => {
            console.error("Request failed:", error);
            feargreed.innerHTML = 'Fear & Greed Index extraction failed';
        });

    // Trigger "Scan" button click on Enter key press
    addressURL.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            convert.click();
        }
    });

    // Main event listener for the "Scan" button
    convert.addEventListener('click', () => {
        // Show loading spinner
        convert.innerHTML = '';
        const loading = document.querySelector('.loading-spinner');
        loading.style.display = 'block';

        // Determine if input is an Ethereum address or URL
        let address, URL;
        if (addressURL.value.length === 42 && !addressURL.value.includes(".")) {
            address = addressURL.value;
        } else if (addressURL.value.includes(".")) {
            URL = addressURL.value;
        }

        // Handle Ethereum address scanning
        if (address) {
            addressorurl.innerHTML = 'Safety Score by Address';
            
            // Fetch data from multiple APIs
            Promise.all([
                fetch(apiURL + address),
                fetch('https://talhahossainkhan.github.io/sensicapi/addresses-darklist.json'),
                fetch(`https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=WY5W2MXQZBTUJZET6TQSNS5XXMU1NBBKH1`),
                fetch(`https://eth.blockscout.com/api/v2/addresses/${address}/counters`)
            ])
            .then(([response1, response2, response3, response4]) => {
                // Check if all responses are ok
                if (!response1.ok) throw new Error('Failed to fetch data from the first API');
                if (!response2.ok) throw new Error('Failed to fetch data from the second API');
                if (!response3.ok) throw new Error('Failed to fetch data from the third API');
                if (!response4.ok) throw new Error('Failed to fetch data from the fourth API');
                return Promise.all([response1.json(), response2.json(), response3.json(), response4.json()]);
            })
            .then(([data, darklistData, etherscanData, transdata]) => {
                // Process and display the fetched data
                Predict = data.Prediction;
                const totalTransactions = transdata.transactions_count;
                const FirstTrans = data.FirstTransaction;
                const LastTrans = data.LastTransaction;

                // Set result based on prediction
                if (Predict === 1) {
                    // Not secure
                    result.innerHTML = 'Not Secure';
                    percentage.innerHTML = '11%';
                    para.innerHTML = 'Our algorithm detected fraudulent activity from the address. We recommend not transacting with this address';
                    result.style.color = '#c92424';
                    percentage.style.color = '#c92424';
                    predictColor = `#c92424`;
                } else {
                    // Secure
                    result.innerHTML = 'Secure';
                    percentage.innerHTML = '89%';
                    para.innerHTML = 'Our algorithm detected no fraudulent activity from the address';
                    result.style.color = '#66df66';
                    percentage.style.color = '#66df66';
                    predictColor = `#66df66`;
                }

                // Update metrics
                metric2.innerHTML = `${totalTransactions}`;
                metric3.innerHTML = `${FirstTrans}`;
                metric4.innerHTML = `${LastTrans}`;

                // Check if address is in blacklist
                const isInBlacklist = darklistData.some(item => item.address === address);
                if (isInBlacklist) {
                    metric5.innerHTML = "The Address is flagged in the blacklist";
                    metric5.style.color = '#c92424';
                } else {
                    metric5.innerHTML = "The Address is not flagged in the blacklist";
                    metric5.style.color = '#66df66';
                }

                // Display Ether balance
                const totalEther = (etherscanData.result / 10 ** 18).toPrecision(3);
                metric1.innerHTML = `${totalEther} ETH`;

                // Update UI
                loading.style.display = 'none';

                // Update circular progress
                updateCircular1Progress(predictColor, Predict);
            })
            .catch(error => {
                console.error("Request failed:", error);
                Error.innerHTML = 'Extraction Failed';
                Error.style.color = '#c92424';
                errorbox.style.display = 'block';
            });
        }

        // Handle URL scanning
        if (URL) {
            addressorurl.innerHTML = 'Safety Score by URL';
            
            // Fetch URL data and prediction
            const fetchURLData = fetch('https://talhahossainkhan.github.io/sensicapi/data.json').then(response => response.json());
            const fetchURLPrediction = fetch(`https://sensic-url-api.onrender.com/?URL=${URL}`).then(response => response.json());

            Promise.all([fetchURLData, fetchURLPrediction])
                .then(([urlData, urlPredictionData]) => {
                    // Check if URL is flagged in blacklist
                    const isFlaggedInBlacklist = urlData.data.some(item => item.node.name === URL);
                    urlPrediction = urlPredictionData.Prediction;

                    // Update UI based on blacklist status
                    if (isFlaggedInBlacklist) {
                        metric5.innerHTML = 'The URL is flagged in the blacklist';
                        metric5.style.color = '#c92424';
                    } else {
                        metric5.innerHTML = 'The URL is not flagged in the blacklist';
                        metric5.style.color = '#66df66';
                    }

                    // Set result based on URL prediction
                    if (urlPrediction === 1) {
                        // Secure
                        result.innerHTML = 'Secure';
                        percentage.innerHTML = '71%';
                        para.innerHTML = 'Our algorithm detected no fraudulent activity from the URL link.';
                        result.style.color = '#66df66';
                        percentage.style.color = '#66df66';
                        predictColor = `#66df66`;
                    } else {
                        // Not secure
                        result.innerHTML = 'Not Secure';
                        percentage.innerHTML = '29%';
                        para.innerHTML = 'Our algorithm detected fraudulent activity from the URL link. We recommend not using this URL for making transactions';
                        result.style.color = '#c92424';
                        percentage.style.color = '#c92424';
                        predictColor = `#c92424`;
                    }

                    // Update UI
                    loading.style.display = 'none';

                    // Update circular progress
                    updateCircular2Progress(predictColor, urlPrediction);
                })
                .catch(error => {
                    console.error("Request failed:", error);
                    Error.innerHTML = 'Extraction Failed';
                    Error.style.color = '#c92424';
                    errorbox.style.display = 'block';
                });
        }
    });

    // Function to update circular progress for Ethereum addresses
    function updateCircular1Progress(color, prediction) {
        let progressStartValue = 0;
        let progressEndValue = (prediction === 1) ? 11 : 89;
        const speed = 35;
        const circularProgress = document.querySelector(".circular-progress");
        const progressValue = document.querySelector(".progress-value");

        let progress = setInterval(() => {
            progressStartValue++;
            progressValue.textContent = `${progressStartValue}%`;
            circularProgress.style.background = `conic-gradient(${color} ${progressStartValue * 3.6}deg, #ededed 0deg)`;
            if (progressStartValue === progressEndValue) {
                clearInterval(progress);
            }
        }, speed);
    }

    // Function to update circular progress for URLs
    function updateCircular2Progress(color, prediction) {
        let progressStartValue = 0;
        let progressEndValue = (prediction === 1) ? 71 : 29;
        const speed = 35;
        const circularProgress = document.querySelector(".circular-progress");
        const progressValue = document.querySelector(".progress-value");

        let progress = setInterval(() => {
            progressStartValue++;
            progressValue.textContent = `${progressStartValue}%`;
            circularProgress.style.background = `conic-gradient(${color} ${progressStartValue * 3.6}deg, #ededed 0deg)`;
            if (progressStartValue === progressEndValue) {
                clearInterval(progress);
            }
        }, speed);
    }
});