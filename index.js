const { Telegraf } = require("telegraf");
const axios = require("axios").default;
const HTMLParser = require("node-html-parser");
var FormData = require("form-data");

const bot = new Telegraf("6796696681:AAHoDnW7JoCdpU4nA2qt60RN3DK1fM7wzsk");

bot.start((message) => {
  return message.reply(
    "Ciao, sono RiBot e ti aiuterò a scoprire il menu della mensa scolastica!"
  );
});

bot.command("menu", (ctx) => {
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
  axios.get(url, { headers: headers }).then((response) => {
    const parsed_html = HTMLParser.parse(response.data);
    const viewstate =
      parsed_html.querySelector("input#__VIEWSTATE").attrs.value;
    const viewstategen = parsed_html.querySelector("input#__VIEWSTATEGENERATOR")
      .attrs.value;
    const event_validation = parsed_html.querySelector(
      "input#__EVENTVALIDATION"
    ).attrs.value;

    let bodyFormData = new FormData();
    bodyFormData.append("__VIEWSTATE", viewstate);
    bodyFormData.append("__VIEWSTATEGENERATOR", viewstategen);
    bodyFormData.append("__EVENTTARGET", "");
    bodyFormData.append("__EVENTARGUMENT", "");
    bodyFormData.append("__ASYNCPOST", "true");
    bodyFormData.append("__SCROLLPOSITIONX", 0);
    bodyFormData.append("__SCROLLPOSITIONY", 0);
    bodyFormData.append("__EVENTVALIDATION", event_validation);
    bodyFormData.append(
      "Elior_Ribo_Module_182151$m5e0a362ea0b54e8284274914f25d95c4$drpDestination",
      "2|302|8"
    );
    bodyFormData.append(
      "Elior_Ribo_Module_182151$m5e0a362ea0b54e8284274914f25d95c4$drpDiet",
      "2"
    );
    bodyFormData.append(
      "Elior_Ribo_Module_182151$m5e0a362ea0b54e8284274914f25d95c4$btnSearch",
      "Visualizza"
    );

    if (process.argv.find((v) => v === "next")) {
      console.log("NEXT");
    }

    const starGlobal = /\*/g;
    axios.post(url, bodyFormData).then((responseMenu) => {
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
      ctx.reply(menuToReply);
    });
  });
});

bot.launch();
