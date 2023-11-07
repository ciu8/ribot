const { Telegraf, Markup } = require("telegraf");
const session = require("telegraf/session");
const Stage = require("telegraf/stage");
const { leave } = Stage;
const { LISTA_MENU_SALVATI, SALVA_MENU, MENU_PRINCIPALE } = require("./menu");
const { salva_menu_scene } = require("./scenes/salva_menu");
const { lista_menu_scene } = require("./scenes/lista_menu");
require("dotenv").config();

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
bot.hears(LISTA_MENU_SALVATI, (ctx) => ctx.scene.enter("lista_menu"));
bot.on("message", (ctx) =>
  ctx.reply(
    "❗ Non ho capito...\nusa /start per iniziare o /cancel per cancellare il comando corrente."
  )
);

bot.launch();
// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
