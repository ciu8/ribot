const { Telegraf } = require("telegraf");
const axios = require("axios").default;
const HTMLParser = require("node-html-parser");
var FormData = require("form-data");

const bot = new Telegraf("6796696681:AAHoDnW7JoCdpU4nA2qt60RN3DK1fM7wzsk");
const url = "https://www.riboscuola.it/menu/ricerca-menu.aspx";

async function getStateParams() {
  const headers = {
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.17 (KHTML, like Gecko)  Chrome/24.0.1312.57 Safari/537.17",
    "Content-Type": "application/x-www-form-urlencoded",
    "Accept-Encoding": "gzip,deflate,sdch",
    "Accept-Language": "en-US,en;q=0.8",
    "Accept-Charset": "ISO-8859-1,utf-8;q=0.7,*;q=0.3",
  };
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
  listaPortate.map((portata) => {
    const nomePortata = portata.querySelector("label").text.trim();
    const nomePietanza = portata
      .querySelector("div.descr-product")
      .querySelector("strong")
      .text.replace(starGlobal, "")
      .trim();
    menuToReply += nomePortata + ": " + nomePietanza + "\n";
  });
  return menuToReply;
}

async function doTheCall(scuolaId, menuId, next) {
  const params = await getStateParams();
  const menu = await getTheMenu(scuolaId, menuId, params, next);
  return menu;
}

bot.start((message) => {
  return message.reply(
    "Ciao, sono RiBot e ti aiuterò a scoprire il menu della mensa scolastica!"
  );
});

bot.command("menu", async (ctx) => {
  const { args } = ctx;
  if (typeof args != "undefined" && args.length > 0) {
    const menuToReply = await doTheCall(args[0], "2");
    ctx.reply(menuToReply);
  } else {
    const menuToReply = await doTheCall("2|302|8", "2");
    ctx.reply(menuToReply);
    ctx.reply(
      "Per il menu di oggi, specificare un id scuola. Es: /menu 2|302|8"
    );
  }
});

bot.command("domani", async (ctx) => {
  const { args } = ctx;
  if (typeof args != "undefined" && args.length > 0) {
    const menuToReply = await doTheCall(args[0], "2", true);
    ctx.reply(menuToReply);
  } else {
    const menuToReply = await doTheCall("2|302|8", "2", true);
    ctx.reply(menuToReply);
    ctx.reply(
      "Per il menu di domani, specificare un id scuola. Es: /domani 2|302|8"
    );
  }
});

bot.launch();
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))