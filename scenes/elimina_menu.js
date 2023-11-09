const { Markup } = require("telegraf");
const Stage = require("telegraf/stage");
const Scene = require("telegraf/scenes/base");
const { MENU_PRINCIPALE, INDIETRO, MENU_ELIMINATO_MSG } = require("../menu");
const { getPreferencies, deletePreference } = require("../db_client");
const { leave } = Stage;

function elimina_menu_scene() {
  const NO_MENU_FOUND = "Non hai menu salvati";
  const COURTESY_MSG =
    "Seleziona il menu da eliminare o usa /cancel per tornare al menu principale";
  //elimina menu scene
  const eliminaMenuScene = new Scene("elimina_menu");
  eliminaMenuScene.enter(async (ctx) => {
    const { from } = ctx.update.message;
    const listaMenuSalvati = await getPreferencies(from.id);
    if (listaMenuSalvati.length == 0) {
      ctx.reply(NO_MENU_FOUND);
      return ctx.scene.leave();
    }
    let toReply = "Seleziona il menu da eliminare:";
    const menuAsMarkup = listaMenuSalvati.map((l) => [
      l.Nome.S + " : " + l.IdScuola?.S + " - " + l.IdDieta.S,
    ]);
    menuAsMarkup.push([INDIETRO]);
    ctx.reply(
      toReply,
      Markup.keyboard(menuAsMarkup).oneTime().resize().extra()
    );
  });
  eliminaMenuScene.leave((ctx) =>
    ctx.reply(
      "Menu Principale",
      Markup.keyboard(MENU_PRINCIPALE).oneTime().resize().extra()
    )
  );
  eliminaMenuScene.hears(INDIETRO, leave());
  eliminaMenuScene.on("message", async (ctx) => {
    const { id } = ctx.update.message.from;
    const scelta = ctx.update.message.text.split(" : ");
    if (scelta.length != 2) {
      ctx.reply(COURTESY_MSG);
    } else {
      const nome = scelta[0];
      if (nome.length == 0) {
        ctx.reply(COURTESY_MSG);
      } else {
        const toDelete = await deletePreference(id.toString(), nome);
        ctx.reply(MENU_ELIMINATO_MSG);
        return ctx.scene.leave();
      }
    }
  });
  return eliminaMenuScene;
}

module.exports = {
  elimina_menu_scene,
};
