// Function to convert date format from YYYY-MM-DD to DD/MM/YYYY
function convertDateFormat(dateStr) {
  if (!dateStr) {
    throw new Error("No date string provided for conversion.");
  }
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

// JavaScript to handle form submission and fetch API data
document.getElementById("apiForm").addEventListener("submit", function (event) {
  event.preventDefault();

  // Show loading animation and hide response initially
  document.getElementById("loading").style.display = "flex";
  document.getElementById("response").classList.add("hidden");

  const corsProxy = "https://cors-anywhere.herokuapp.com/";
  const apiUrl = "http://mas.trippro.com/resources/v2/Flights/search";
  const proxiedUrl = corsProxy + apiUrl;

  const originalDate = document.getElementById("dateInput").value;
  const newDate = convertDateFormat(originalDate);
  console.log("Formatted Date:", newDate);

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Accept-Encoding", "gzip, deflate");
  myHeaders.append("Accept", "application/json");
  myHeaders.append("M-IPAddress", "172.72.160.223");
  myHeaders.append("SearchAccessToken", "8dcf6e50e54e4d448d88385fd80116a0");

  const raw = JSON.stringify({
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

  const requestOptions = {
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
      return response.json();
    })
    .then((result) => {
      console.log("API Response:", result);

      // Hide loading animation and show response
      document.getElementById("loading").style.display = "none";
      document.getElementById("response").classList.remove("hidden");
      displayFlights(result);
    })
    .catch((error) => {
      console.error("Fetch Error:", error);
      document.getElementById("loading").style.display = "none";
      document.getElementById("response").innerHTML = "Error: " + error.message;
    });
});

// Function to display flights with proper routing
function displayFlights(data) {
  const responseDiv = document.getElementById("response");
  responseDiv.innerHTML = ""; // Clear previous content

  console.log("Data:", data); // Debug the data

  if (data.FlightItinerary && data.FlightItinerary.length > 0) {
    const allItineraries = data.FlightItinerary;

    // Paginate itineraries
    const flightsPerPage = 5;
    const numPages = Math.ceil(allItineraries.length / flightsPerPage);
    let currentPage = 1;

    function renderPage(page) {
      responseDiv.innerHTML = ""; // Clear previous content

      // Get the flights for the current page
      const startIndex = (page - 1) * flightsPerPage;
      const endIndex = startIndex + flightsPerPage;
      const itinerariesToDisplay = allItineraries.slice(startIndex, endIndex);

      itinerariesToDisplay.forEach((itinerary) => {
        const flightSegments = itinerary.Citypairs.flatMap(
          (citypair) => citypair.FlightSegment
        );

        // Sort by departure time to ensure correct order
        flightSegments.sort(
          (a, b) =>
            new Date(a.DepartureDateTime) - new Date(b.DepartureDateTime)
        );

        // Group segments into itineraries
        let itineraryDiv = document.createElement("div");
        itineraryDiv.className = "itinerary-box";

        // Create a container for the flight group
        let flightGroupDiv = document.createElement("div");
        flightGroupDiv.className = "flight-group";

        flightSegments.forEach((segment) => {
          const flightDiv = document.createElement("div");
          flightDiv.className = "flight-box";

          // Create airline logo image path
          const logoPath = `./images/${segment.MarketingAirline}.jpg`;

          flightDiv.innerHTML = `
            <img src="${logoPath}" alt="Airline Logo" class="airline-logo" />
            <div>
              <p><strong>From:</strong> ${segment.DepartureDisplayName}</p>
              <p><strong>To:</strong> ${segment.DisplayName}</p>
              <p><strong>Date:</strong> ${new Date(
                segment.DepartureDateTime
              ).toLocaleDateString()}</p>
              <p><strong>Flight Number:</strong> ${segment.FlightNumber}</p>
              <p><strong>Duration:</strong> ${segment.Duration}</p>
              <p><strong>Price:</strong> $${data.FlightItinerary[0].Fares[0].TravellerBaseFare.toFixed(
                2
              )}</p>
            </div>
          `;

          flightGroupDiv.appendChild(flightDiv);
        });

        itineraryDiv.appendChild(flightGroupDiv);
        responseDiv.appendChild(itineraryDiv);
      });

      // Render pagination buttons
      renderPagination(numPages, page);
    }

    // Render the first page initially
    renderPage(currentPage);

    function renderPagination(numPages, currentPage) {
      let paginationDiv = document.querySelector(".pagination");
      if (paginationDiv) {
        paginationDiv.innerHTML = "";
      } else {
        paginationDiv = document.createElement("div");
        paginationDiv.className = "pagination";
        responseDiv.appendChild(paginationDiv);
      }

      // Render pagination buttons
      for (let i = 1; i <= numPages; i++) {
        const pageButton = document.createElement("button");
        pageButton.textContent = i;
        if (i === currentPage) {
          pageButton.classList.add("active");
        }
        pageButton.addEventListener("click", () => {
          renderPage(i);
        });
        paginationDiv.appendChild(pageButton);
      }
    }
  } else {
    responseDiv.textContent =
      "No flights found or data structure is unexpected.";
  }
}
