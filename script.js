const container = document.getElementById("landenlijst");
const url = `https://restcountries.com/v3.1`;
// filters
// zoekveld
let holdTimer;
function ZoekOnInput() {
    clearTimeout(holdTimer);
    holdTimer = setTimeout(() => zoekLand(), 300); // 300ms vertraging
}
function zoekLand() {
    // Haal de invoer op
    const zoekterm = document.getElementById("zoekveld").value.trim().toLowerCase();
    // Geselecteerde regio
    const regio = document.getElementById("regionFilter").value;
    axios.get(url+`/all`)
        .then(response => {
            let landenList = response.data;
            // Filter landen op regio als een regio is geselecteerd
            if (regio) {
                landenList = landenList.filter(land => land.region === regio);
            }
            // Filter landen verder op zoekterm
            if (zoekterm) {
                landenList = landenList.filter(land => {
                    const zoekInCommon = land.name.common.toLowerCase().includes(zoekterm);
                    const zoekInOfficial = land.name.official.toLowerCase().includes(zoekterm);
                    // zoeken in nedelandse taal
                    const zoekInTalen = land.translations.nld.common?.toLowerCase().includes(zoekterm)
                        || land.translations.nld.official?.toLowerCase().includes(zoekterm);
                    return zoekInCommon || zoekInOfficial || zoekInTalen;
                });
            }
            // Toon resultaten
            if (landenList.length === 0) {
                container.innerHTML = "<p class='text-danger text-center'>Geen resultaten gevonden.</p>";
                return;
            }
            renderLandenCards(landenList)
        })
        .catch(error => {
            console.log('error')
            console.error("Fout bij het ophalen van gegevens:", error);
            document.getElementById("pokemon-list").innerHTML =
                `<div class="alert alert-danger" role="alert">
                 Er is een fout opgetreden bij het ophalen van de gegevens.
             </div>`;
        });
}
function renderLandenCards(landenList) {
    // Wis eerdere resultaten
    container.innerHTML ="";
    // console.log(landenList)
    landenList.forEach(land => {
        console.log(land)
        const landName = land.name.official;
        const landFlag = land.flags.svg;
        const landRegion = land.region;
        const landPopulation = land.population.toLocaleString();
        const landCapital = land.capital;
        const landLanguages = land.languages
            ? Object.values(land.languages).join(", ")
            : "Niet beschikbaar";
        const landCurrency = land.currencies
            ? Object.values(land.currencies)
                .map(curr => curr.name)
                .join(", ")
            : "Niet beschikbaar";
        const landLatitude = land.capitalInfo.latlng[0]
        const landLongitude = land.capitalInfo.latlng[1]
        // create card
        const card =

            `<div class="col-lg-4 col-md-6 col-sm-12 d-flex">
                <div class="card shadow-sm w-100">
                    <img src="${landFlag}" id="vlagimg" class="card-img-top" alt="Vlag van ${landName}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${landName}</h5>
                        <p class="card-text">
                            <strong>Regio:</strong> ${landRegion}<br>
                            <strong>Populatie:</strong> ${landPopulation}
                        </p>
                        <button class="btn btn-primary w-100 mt-auto" 
                                onclick="openModal('${landName}', '${landFlag}', '${landCapital}', '${landRegion}', '${landPopulation}', '${landLanguages}', '${landCurrency}', '${landLatitude}', '${landLongitude}')">
                            Details bekijken
                        </button>
                    </div>
                </div>
            </div>`;
        container.insertAdjacentHTML("beforeend", card);
    })
}
function openModal(name, flag, capital, region, population, languages, currency, latitude, longitude) {
    const modalContent =
        `<div class="modal-header">
            <h5 class="modal-title">Land Details</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <!-- Modal Body -->
        <div class="modal-body">
            <h3 class="text-center text-primary fw-bold">${name}</h3>
            <div class="text-center mb-3">
                <img src="${flag}" class="img-fluid rounded shadow-sm" style="max-width: 300px;" alt="Vlag van ${name}">
            </div>
            <div class="row">
                <div class="col-md-6">
                    <p><strong>Hoofdstad:</strong> ${capital}</p>
                    <p><strong>Regio:</strong> ${region}</p>
                    <p><strong>Populatie:</strong> ${population}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Talen:</strong> ${languages}</p>
                    <p><strong>Valuta:</strong> ${currency}</p>
                </div>
            </div>
            <div id="map" class="mt-4" style="height: 300px;"></div>
        </div>`;
    const modalElement = document.querySelector(".modal-content");
    modalElement.innerHTML = modalContent;
    // Toon de modal
    const modal = new bootstrap.Modal(document.getElementById("countryModal"));
    modal.show();
    /// Initialiseer de kaart na rendering
    setTimeout(() => {
        const map = L.map('map').setView([latitude, longitude], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        // Voeg een marker toe
        L.marker([latitude, longitude]).addTo(map)
            .bindPopup(`<strong>${name}</strong><br>Hoofdstad: ${capital}`)
            .openPopup();
    }, 300); // Wacht totdat de modal volledig is gerenderd
}
// verzamel all data
zoekLand();