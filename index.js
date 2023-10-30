const { Telegraf, Markup } = require("telegraf");
const session = require("telegraf/session");
const Stage = require("telegraf/stage");
const Scene = require("telegraf/scenes/base");
const { leave } = Stage;
const {
  SCUOLE,
  LISTA_MENU_SALVATI,
  SALVA_MENU,
  ALTRE_SCUOLE,
  MENU_PRINCIPALE,
  MENU_SCUOLE,
} = require("./menu");
const { doTheCall, searchScuola, getDiete } = require("./helpers");
const { salva_menu_scene } = require("./scenes/salva_menu");
const { lista_menu_scene } = require("./scenes/lista_menu");
require("dotenv").config();

// Lista Scuole scene
/*const listaScuoleScene = new Scene("lista_scuole");
listaScuoleScene.enter(async (ctx) => {
  ctx.session.currentPage = 0;
  let after = ctx.session.currentPage * 10 - 1;
  const scuole = await getScuole(after);
  let toReply = "Ecco le scuole: \n";
  for (let i = 0; i < scuole.length; i++) {
    toReply += scuole[i].label + ": " + scuole[i].value + "\n";
  }
  ctx.reply(toReply, Markup.keyboard(MENU_SCUOLE).oneTime().resize().extra());
});
listaScuoleScene.hears(ALTRE_SCUOLE, async (ctx) => {
  ctx.session.currentPage = ctx.session.currentPage + 1;
  let after = ctx.session.currentPage * 10 - 1;
  const scuole = await getScuole(after);
  let toReply = "";
  for (let i = 0; i < scuole.length; i++) {
    toReply += scuole[i].label + ": " + scuole[i].value + "\n";
  }
  ctx.reply(toReply, Markup.keyboard(MENU_SCUOLE).oneTime().resize().extra());
});
listaScuoleScene.leave((ctx) =>
  ctx.reply("Ok", Markup.keyboard(MENU_PRINCIPALE).oneTime().resize().extra())
);
listaScuoleScene.hears(/Annulla/gi, leave());*/

// Create scene manager
const stage = new Stage();
stage.command("cancel", leave());

// Scene registration
stage.register(salva_menu_scene(), lista_menu_scene());

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
bot.use(session());
bot.use(stage.middleware());

/****** START BOT ********/

bot.start((message) => {
  console.log(message);
  message.reply(
    "Ciao, sono RiBot e ti aiuterò a scoprire il menu della mensa scolastica!",
    Markup.keyboard(MENU_PRINCIPALE).oneTime().resize().extra()
  );
});

bot.hears(SALVA_MENU, (ctx) => ctx.scene.enter("salva_menu"));

bot.hears("😎 Menu", async (ctx) => {
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
bot.hears(LISTA_MENU_SALVATI, (ctx) => ctx.scene.enter("lista_menu"));

bot.launch();
// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
