const { Markup } = require("telegraf");
const Stage = require("telegraf/stage");
const Scene = require("telegraf/scenes/base");
const { doTheCall } = require("../helpers");
const { MENU_PRINCIPALE, INTRO_MENU_OGGI_MSG, INDIETRO } = require("../menu");
const { getPreferencies } = require("../db_client");
const { leave } = Stage;

function lista_menu_scene() {
  const NO_MENU_FOUND = "Non hai menu salvati";
  const COURTESY_MSG =
    "Seleziona uno dei menu che hai salvato o usa /cancel per tornare al menu principale";
  //lista menu scene
  const listaMenuScene = new Scene("lista_menu");
  listaMenuScene.enter(async (ctx) => {
    const { from } = ctx.update.message;
    const listaMenuSalvati = await getPreferencies(from.id);
    if (listaMenuSalvati.length == 0) {
      ctx.reply(NO_MENU_FOUND);
      return ctx.scene.leave();
    }
    let toReply = "Ecco i menu salvati:";
    const menuAsMarkup = listaMenuSalvati.map((l) => [
      l.Nome.S + " : " + l.IdScuola?.S + " - " + l.IdDieta.S,
    ]);
    menuAsMarkup.push([INDIETRO]);
    ctx.reply(
      toReply,
      Markup.keyboard(menuAsMarkup).oneTime().resize().extra()
    );
  });
  listaMenuScene.leave((ctx) =>
    ctx.reply(
      "Menu Principale",
      Markup.keyboard(MENU_PRINCIPALE).oneTime().resize().extra()
    )
  );
  listaMenuScene.hears(INDIETRO, leave());
  listaMenuScene.on("message", async (ctx) => {
    const scelta = ctx.update.message.text.split(" : ");
    if (scelta.length != 2) {
      ctx.reply(COURTESY_MSG);
    } else {
      const data = scelta[1];
      const dataSplitted = data.split(" - ");
      if (dataSplitted.length != 2) {
        ctx.reply(COURTESY_MSG);
      } else {
        const menuToReply = await doTheCall(dataSplitted[0], dataSplitted[1]);
        ctx.reply(INTRO_MENU_OGGI_MSG + menuToReply);
        return ctx.scene.leave();
      }
    }
  });
  return listaMenuScene;
}

module.exports = {
  lista_menu_scene,
};
