const axios = require("axios").default;
const HTMLParser = require("node-html-parser");
var FormData = require("form-data");
const headers = {
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.17 (KHTML, like Gecko)  Chrome/24.0.1312.57 Safari/537.17",
  "Content-Type": "application/x-www-form-urlencoded",
  "Accept-Encoding": "gzip,deflate,sdch",
  "Accept-Language": "en-US,en;q=0.8",
  "Accept-Charset": "ISO-8859-1,utf-8;q=0.7,*;q=0.3",
};

const url = "https://www.riboscuola.it/menu/ricerca-menu.aspx";
const PAGINATION_SCUOLE = 10;
const AFTER = -1;

async function getStateParams() {
  const response = await axios.get(url, { headers: headers });
  const parsed_html = HTMLParser.parse(response.data);
  const viewstate = parsed_html.querySelector("input#__VIEWSTATE").attrs.value;
  const viewstategen = parsed_html.querySelector("input#__VIEWSTATEGENERATOR")
    .attrs.value;
  const event_validation = parsed_html.querySelector("input#__EVENTVALIDATION")
    .attrs.value;

  return {
    viewstate: viewstate,
    viewstategen: viewstategen,
    event_validation: event_validation,
  };
}

async function getTheMenu(scuolaId, dietaId, params, next) {
  console.log("Get The Menu: Scuola %s, Dieta %s, Params %s, Next %s", scuolaId, dietaId, params, next)
  let bodyFormData = new FormData();
  bodyFormData.append("__VIEWSTATE", params.viewstate);
  bodyFormData.append("__VIEWSTATEGENERATOR", params.viewstategen);
  bodyFormData.append("__EVENTTARGET", "");
  bodyFormData.append("__EVENTARGUMENT", "");
  bodyFormData.append("__ASYNCPOST", "true");
  bodyFormData.append("__SCROLLPOSITIONX", 0);
  bodyFormData.append("__SCROLLPOSITIONY", 0);
  bodyFormData.append("__EVENTVALIDATION", params.event_validation);
  bodyFormData.append(
    "Elior_Ribo_Module_182151$m5e0a362ea0b54e8284274914f25d95c4$drpDestination",
    scuolaId
  );
  bodyFormData.append(
    "Elior_Ribo_Module_182151$m5e0a362ea0b54e8284274914f25d95c4$drpDiet",
    dietaId
  );

  if (next) {
    bodyFormData.append(
      "__EVENTTARGET",
      "Elior_Ribo_Module_182151$m5e0a362ea0b54e8284274914f25d95c4$childMenu$btnMoveNext"
    );
    bodyFormData.append(
      "Elior_Ribo_Module_182151$m5e0a362ea0b54e8284274914f25d95c4$ScriptManager",
      "Elior_Ribo_Module_182151$m5e0a362ea0b54e8284274914f25d95c4$UpdatePanel|Elior_Ribo_Module_182151$m5e0a362ea0b54e8284274914f25d95c4$childMenu$btnMoveNext"
    );
    bodyFormData.append(
      "Elior_Ribo_Module_182151$m5e0a362ea0b54e8284274914f25d95c4$hdnDate",
      ""
    );
  } else {
    bodyFormData.append(
      "Elior_Ribo_Module_182151$m5e0a362ea0b54e8284274914f25d95c4$btnSearch",
      "Visualizza"
    );
  }

  const starGlobal = /\*/g;

  const responseMenu = await axios.post(url, bodyFormData);
  const menuHtml = HTMLParser.parse(responseMenu.data);
  const listaPortate = menuHtml.querySelectorAll("ul.lista-portate li");
  let menuToReply = "";
  if (listaPortate.length > 0) {
    listaPortate.map((portata) => {
      const nomePortata = portata.querySelector("label").text.trim();
      const nomePietanza = portata
        .querySelector("div.descr-product")
        .querySelector("strong")
        .text.replace(starGlobal, "")
        .trim();
      menuToReply += nomePortata + ": " + nomePietanza + "\n";
    });
  } else {
    menuToReply = "Nessun menu presente";
  }

  return menuToReply;
}

async function doTheCall(scuolaId, menuId, next) {
  const params = await getStateParams();
  const menu = await getTheMenu(scuolaId, menuId, params, next);
  return menu;
}

async function getScuole(after = AFTER) {
  const response = await axios.get(url, { headers: headers });
  const parsed_html = HTMLParser.parse(response.data);
  const options = parsed_html.querySelectorAll(
    "select#Elior_Ribo_Module_182151_m5e0a362ea0b54e8284274914f25d95c4_drpDestination option"
  );
  const scuole = options
    .filter((o) => o.attrs.value != "")
    .map((o) => {
      return { label: o.text, value: o.attrs.value };
    });

  return scuole.slice(after + 1, PAGINATION_SCUOLE);
}

async function getDiete() {
  const response = await axios.get(url, { headers: headers });
  const parsed_html = HTMLParser.parse(response.data);
  const options = parsed_html.querySelectorAll(
    "select#Elior_Ribo_Module_182151_m5e0a362ea0b54e8284274914f25d95c4_drpDiet option"
  );
  const diete = options
    .filter((o) => o.attrs.value != "")
    .map((o) => {
      return { label: o.text, value: o.attrs.value };
    });

  return diete;
}

async function searchScuola(search) {
  const response = await axios.get(url, { headers: headers });
  const parsed_html = HTMLParser.parse(response.data);
  const options = parsed_html.querySelectorAll(
    "select#Elior_Ribo_Module_182151_m5e0a362ea0b54e8284274914f25d95c4_drpDestination option"
  );
  const scuole = options
    .filter((o) => o.attrs.value != "")
    .filter((o) => o.text.toLowerCase().includes(search))
    .map((o) => {
      return { label: o.text, value: o.attrs.value };
    });

  return scuole;
}

module.exports = {
  getStateParams,
  getTheMenu,
  doTheCall,
  getScuole,
  searchScuola,
  getDiete,
};
