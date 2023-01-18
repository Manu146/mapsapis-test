const fetchGData = async (pc) => {
  try {
    let res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?components=country:ES&address=${pc}&language=es&key=AIzaSyC6y34nA-ucLQ6RC9_9Xiiw7yF5Fv7wnJU`
    );
    let data = await res.json();
    return data.results[0];
  } catch (error) {
    console.log(error);
  }
};

function initMap() {
  console.log("lib loaded");
}

const resetSelectOpts = () => {
  let options = document.querySelectorAll("#localidad_select option");
  if (options.length > 1) {
    options.forEach((opt, i) => {
      if (i === 0) return;
      opt.remove();
    });
  }
};

function createAutocomplete() {
  let autoCompleteInput = document.getElementsByName("address")[0];
  autoCompleteInput.style.width = "40%";
  let searchBox = new google.maps.places.Autocomplete(autoCompleteInput, {
    types: ["geocode"],
  });
  searchBox.addListener("place_changed", () => {
    let places = searchBox.getPlace();
    let zipEl = document.getElementsByName("zip")[0];
    let localidadEl = document.getElementsByName("localidad")[0];
    let selectEl = document.getElementById("localidad_select");
    let provEl = document.getElementsByName("provincia_texto")[0];
    let comAutEl = document.getElementsByName("comunidad_autonoma")[0];

    let addressData = places.address_components;

    console.log(addressData);

    let postalCod =
      addressData.find((el) => el.types[0] === "postal_code")?.long_name || "";
    let comAutonoma =
      addressData.find((el) => {
        return el.types[0] === "administrative_area_level_1";
      })?.long_name || "";
    let provincia =
      addressData.find((el) => {
        return el.types[0] === "administrative_area_level_2";
      })?.long_name || "";
    let localidad =
      addressData.find((el) => {
        return el.types[0] === "locality";
      })?.long_name || "";

    zipEl.value = postalCod;
    localidadEl.value = localidad;
    provEl.value = provincia;
    comAutEl.value = comAutonoma;

    resetSelectOpts();

    selectEl.options.add(new Option(localidad, localidad));
    selectEl.value = localidad;
  });
}

const hideEl = (elName) => {
  if (typeof elName !== "string") return;
  let elToHid = document.getElementsByClassName(`hs-${elName}`);
  elToHid[0].classList.toggle("hidden-field");
};

const formCb = () => {
  hideEl("provincia_texto");
  hideEl("comunidad_autonoma");
  hideEl("localidad");
  hideEl("address");
  addZipCodChkBx();
  initializeZipCodeInput();
  createAutocomplete();
};

const initializeZipCodeInput = () => {
  let zipEl = document.getElementsByName("zip")[0];
  let zipParentEl = zipEl.parentElement.parentElement;
  let hsLocalidadEl = document.getElementsByName("localidad")[0];

  let localidadSelect = document.createElement("select");
  let selectContainer = document.createElement("div");
  let selectLabel = document.createElement("label");

  selectLabel.innerText = "Poblacion";

  selectContainer.appendChild(selectLabel);
  selectContainer.appendChild(localidadSelect);

  selectContainer.classList.add("hs-form-field");
  selectContainer.classList.add("hs-poblacion-select");
  localidadSelect.id = "localidad_select";
  localidadSelect.classList.add("hs-input");

  selectContainer.id = "localidad-container";

  //Agregar select localidades

  zipParentEl.parentNode.insertBefore(selectContainer, zipParentEl.nextSibling);

  localidadSelect.id = "localidad_select";
  localidadSelect.options.add(new Option("Seleccione Poblacion", "default"));
  localidadSelect.addEventListener("change", (e) => {
    hsLocalidadEl.value = e.target.value;
  });

  zipEl.addEventListener("input", (e) => {
    let pc = e.target.value;
    let provEl = document.getElementsByName("provincia_texto")[0];
    let comAutEl = document.getElementsByName("comunidad_autonoma")[0];
    if (!pc || pc.length !== 5) return;
    fetchGData(pc).then((results) => {
      console.log(results.address_components);

      //Level 1 Comunidad Autonoma
      //Level 2 Provincia
      let comAutonoma = results.address_components.find((el) => {
        return el.types[0] === "administrative_area_level_1";
      });

      let provincia = results.address_components.find((el) => {
        return el.types[0] === "administrative_area_level_2";
      });

      comAutEl.value = comAutonoma.long_name || "No especificado";
      provEl.value = provincia.long_name || "No especificado";

      let options = document.querySelectorAll("#localidad_select option");
      if (options.length > 1) {
        options.forEach((opt, i) => {
          if (i === 0) return;
          opt.remove();
        });
      }

      let localidad = results.address_components.find((el) => {
        return el.types[0] === "locality";
      });

      if (localidad) {
        localidadSelect.options.add(
          new Option(localidad.long_name, localidad.long_name)
        );
      } else if (results.postcode_localities) {
        results.postcode_localities.forEach((result) => {
          localidadSelect.options.add(new Option(result, result));
        });
      }
    });
  });
};

function addZipCodChkBx() {
  let zipContainer =
    document.getElementsByName("zip")[0].parentElement.parentElement;

  let chkBoxContainer = document.createElement("div");
  let chkBox = document.createElement("input");
  let label = document.createElement("label");
  label.innerText = "No conozco mi codigo postal";
  chkBox.type = "checkbox";
  chkBoxContainer.classList.add("hs-form-field");
  chkBoxContainer.classList.add("chkbox-container");
  chkBoxContainer.appendChild(chkBox);
  chkBoxContainer.appendChild(label);

  zipContainer.parentNode.insertBefore(chkBoxContainer, zipContainer);

  chkBox.addEventListener("change", () => {
    hideEl("zip");
    hideEl("poblacion-select");
    hideEl("address");
  });
}

function loadStyleSheet() {
  let link = document.createElement("link");
  link.type = "text/css";
  link.rel = "stylesheet";
  link.href = "https://optimamayores.com/formStyle.css";
  document.getElementsByTagName("head")[0].appendChild(link);
}

loadStyleSheet();
