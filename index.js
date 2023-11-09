const { Telegraf, Markup } = require("telegraf");
const session = require("telegraf/session");
const Stage = require("telegraf/stage");
const { leave } = Stage;
const {
  LISTA_MENU_SALVATI,
  SALVA_MENU,
  MENU_PRINCIPALE,
  CONSULTA_MENU,
  ELIMINA_MENU,
} = require("./menu");
const { IS_LOCAL, WEBHOOK_DOMAIN, WEBHOOK_PORT } = process.env;
const { salva_menu_scene } = require("./scenes/salva_menu");
const { lista_menu_scene } = require("./scenes/lista_menu");
const { consulta_menu_scene } = require("./scenes/consulta_menu");
const { deletePreference, describeTable } = require("./db_client");
const { elimina_menu_scene } = require("./scenes/elimina_menu");
require("dotenv").config();

const isLocal = process.env.IS_LOCAL || false;

exports.handler = async function (event) {
  const stage = new Stage();
  stage.command("cancel", leave());

  // This is the raw request coming from Telegram
  let body = event.body[0] === '{' ? JSON.parse(event.body) : JSON.parse(Buffer.from(event.body, 'base64'));
  console.log("Received message: " + JSON.stringify(body));

  // Scene registration
  stage.register(
    salva_menu_scene(),
    lista_menu_scene(),
    consulta_menu_scene(),
    elimina_menu_scene()
  );

  const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
  bot.use(session());
  bot.use(stage.middleware());

  /****** START BOT ********/

  bot.start((message) => {
    message.reply(
      "Ciao, sono RiBot e ti aiuterò a scoprire il menu della mensa scolastica!",
      Markup.keyboard(MENU_PRINCIPALE).oneTime().resize().extra()
    );
  });

  bot.hears(SALVA_MENU, (ctx) => ctx.scene.enter("salva_menu"));
  bot.hears(LISTA_MENU_SALVATI, (ctx) => ctx.scene.enter("lista_menu"));
  bot.hears(CONSULTA_MENU, (ctx) => ctx.scene.enter("consulta_menu"));
  bot.hears(ELIMINA_MENU, (ctx) => ctx.scene.enter("elimina_menu"));
  bot.hears("test", async (ctx) => {
    ctx.reply("Do the test");
  });
  bot.on("message", (ctx) =>
    ctx.reply(
      "❗ Non ho capito...\nusa /start per iniziare o /cancel per cancellare il comando corrente."
    )
  );

  // if (isLocal) {
  //   bot.launch();
  // } else {
  //   bot.launch({
  //     webhook: {
  //       domain: process.env.WEBHOOK_DOMAIN,
  //       port: process.env.WEBHOOK_PORT,
  //     },
  //   });
  // }

  // Enable graceful stop
  // process.once("SIGINT", () => bot.stop("SIGINT"));
  // process.once("SIGTERM", () => bot.stop("SIGTERM"));

  // This will trigger the bot
  await bot.handleUpdate(body);
  return {statusCode: 200, body: ''};
};
