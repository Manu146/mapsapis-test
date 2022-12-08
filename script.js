const fetchGData = async (pc) => {
  try {
    let res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?components=country:ES&address=${pc}&key=AIzaSyC6y34nA-ucLQ6RC9_9Xiiw7yF5Fv7wnJU`
    );
    let data = await res.json();
    //console.log(data.results[0].postcode_localities);
    return data.results[0];
  } catch (error) {
    console.log(error);
  }
};

const formReadyCb = () => {
  let elToHid = document.getElementById(
    "provincia_texto_cmcmax-3622feb9-8618-41eb-986c-c1dbb43280a7"
  );
  elToHid.classList.toggle("hidden-field");

  let pcInput = document.createElement("input");
  pcInput.type = "text";
  pcInput.id = "zip-code";
  pcInput.placeholder = "Código Postal";
  elToHid.parentNode.insertBefore(pcInput, elToHid.nextSibling);

  let provinciaEL = document.createElement("input");
  provinciaEL.type = "text";
  provinciaEL.placeholder = "Comunidad A.";
  provinciaEL.disabled = true;

  let provinceOpt = document.createElement("select");
  provinceOpt.id = "poblacion_select";
  provinceOpt.options.add(new Option("Seleccione Poblacion", "default"));
  provinceOpt.addEventListener("change", (e) => {
    elToHid.value = e.target.value;
  });

  let prov2 = document.createElement("input");
  prov2.type = "text";
  prov2.placeholder = "Provincia";
  prov2.disabled = true;

  pcInput.parentNode.insertBefore(provinciaEL, pcInput.nextSibling);
  pcInput.parentNode.insertBefore(prov2, pcInput.nextSibling);
  pcInput.parentNode.insertBefore(provinceOpt, pcInput.nextSibling);

  pcInput.addEventListener("input", (e) => {
    let pc = e.target.value;
    if (!pc || pc.length !== 5) return;
    fetchGData(pc).then((results) => {
      console.log(results.address_components);
      let provincia = results.address_components.find((el) => {
        return el.types[0] === "administrative_area_level_1";
      });

      let provincia2 = results.address_components.find((el) => {
        return el.types[0] === "administrative_area_level_2";
      });

      prov2.value = provincia2.long_name || "No especificado";
      provinciaEL.value = provincia.long_name || "No especificado";

      results.postcode_localities.forEach((result) => {
        provinceOpt.options.add(new Option(result, result));
      });
    });
  });

  createAutocomplete();
};

function initMap() {
  console.log("lib loaded");
}

function createAutocomplete() {
  let autoCompleteInput = document.getElementById(
    "address-3622feb9-8618-41eb-986c-c1dbb43280a7"
  );
  autoCompleteInput.style.width = "40%";
  let autocomplete = new google.maps.places.Autocomplete(autoCompleteInput, {
    types: ["geocode"],
  });
}
