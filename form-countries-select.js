<!-- Form countries input -->
function formCountriesInput() {
  async function fetchCountries() {
    const url = "https://restcountries.com/v3.1/all?fields=name,cca2";

    try {
      const response = await fetch(url);
      const countries = await response.json();
      return countries;
    } catch (error) {
      console.error("Error fetching countries", error);
      return [];
    }
  }

  async function fetchUserCountry() {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      return data.country || null;
    } catch (error) {
      console.warn("Could not determine user country:", error);
      return null;
    }
  }

  async function populateCountries() {
    const [countries, userCountryCode] = await Promise.all([
      fetchCountries(),
      fetchUserCountry()
    ]);

    const select = document.getElementById("COUNTRY");
    select.innerHTML = "";

    const blankOption = document.createElement("option");
    blankOption.text = "";
    blankOption.value = "";
    blankOption.disabled = true;
    select.appendChild(blankOption);

    countries.sort((a, b) => a.name.common.localeCompare(b.name.common));

    const grouped = {};

    countries.forEach(country => {
      const firstLetter = country.name.common[0].toUpperCase();
      if (!grouped[firstLetter]) grouped[firstLetter] = [];
      grouped[firstLetter].push(country);
    });

    Object.keys(grouped).sort().forEach(letter => {
      const optgroup = document.createElement("optgroup");
      optgroup.label = letter;

      grouped[letter].forEach(country => {
        const option = document.createElement("option");
        option.text = country.name.common;
        option.value = country.name.common;
        if (userCountryCode && country.cca2 === userCountryCode) {
          option.selected = true;
        }
        optgroup.appendChild(option);
      });

      select.appendChild(optgroup);
    });

    if (!select.value) blankOption.selected = true;
  }

  populateCountries();
}

formCountriesInput();

document.addEventListener("DOMContentLoaded", function () {
  declarationUrlParameters();
  assignFootnoteIds();
  manifestoScrollOpacity();
  formCountriesInput();
});
