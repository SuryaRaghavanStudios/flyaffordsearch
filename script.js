function convertDateFormat(dateStr) {
  // Check if the input is valid
  if (!dateStr) {
    throw new Error("No date string provided for conversion.");
  }

  // Split the date string by '-'
  const [year, month, day] = dateStr.split("-");

  // Ensure day and month are two digits
  const dayFormatted = day.padStart(2, "0");
  const monthFormatted = month.padStart(2, "0");

  // Return the date in DD/MM/YYYY format
  return `${dayFormatted}/${monthFormatted}/${year}`;
}

// JavaScript to handle form submission and fetch API data
document.getElementById("apiForm").addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent form from submitting the traditional way

  // CORS Anywhere proxy URL
  const corsProxy = "https://cors-anywhere.herokuapp.com/"; // Change if needed
  const apiUrl = "http://mas.trippro.com/resources/v2/Flights/search";
  const proxiedUrl = corsProxy + apiUrl;

  const originalDate = document.getElementById("dateInput").value;
  const newDate = convertDateFormat(originalDate);
  console.log(newDate);

  // Set up the headers
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Accept-Encoding", "gzip, deflate");
  myHeaders.append("Accept", "application/json");
  myHeaders.append("M-IPAddress", "172.72.160.223");
  myHeaders.append("SearchAccessToken", "8dcf6e50e54e4d448d88385fd80116a0");

  // Prepare the request body
  var raw = JSON.stringify({
    OtherInfo: { RequestedIP: "192.168.11.239", TransactionId: "123456" },
    CurrencyInfo: { CurrencyCode: "USD" },
    PaxDetails: {
      NoOfAdults: { count: "1" },
      NoOfInfants: { count: "0", age: "0" },
      NoOfChildren: { count: "0", age: "0" },
    },
    OriginDestination: [
      {
        DepartureTime: newDate,
        DepartureLocationCode: document.getElementById("Origin").value,
        ArrivalLocationCode: document.getElementById("Destination").value,
        CabinClass: "E",
      },
    ],
    Incremental: "false",
  });

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch(proxiedUrl, requestOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json(); // Parse JSON response
    })
    .then((result) => {
      // Print result to the console for debugging
      console.log("API Response:", result);

      // Display result on the webpage
      document.getElementById("response").textContent = JSON.stringify(
        result,
        null,
        2
      );
    })
    .catch((error) => {
      // Print error to the console
      console.error("Fetch Error:", error);

      // Display error on the webpage
      document.getElementById("response").textContent =
        "Error: " + error.message;
    });
});
