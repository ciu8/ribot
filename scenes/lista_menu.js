const { Markup } = require("telegraf");
const Stage = require("telegraf/stage");
const Scene = require("telegraf/scenes/base");
const { doTheCall } = require("../helpers");
const { MENU_PRINCIPALE } = require("../menu");
const { leave } = Stage;

function lista_menu_scene() {
  //lista menu scene
  const listaMenuScene = new Scene("lista_menu");
  listaMenuScene.enter((ctx) => {
    const listaMenuSalvati = [
      { nome: "Greta Dozza", idScuola: "2|302|8", idDieta: "2" },
      { nome: "Pippo Acri", idScuola: "2|1090|7", idDieta: "2" },
    ];
    let toReply = "Ecco i menu salvati:";
    const menuAsMarkup = listaMenuSalvati.map((l) => [
      l.nome + " : " + l.idScuola + " - " + l.idDieta,
    ]);
    menuAsMarkup.push(["Annulla"]);
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
  listaMenuScene.hears(/Annulla/gi, leave());
  listaMenuScene.on("message", async (ctx) => {
    const scelta = ctx.update.message.text.split(" : ");
    const data = scelta[1];
    const dataSplitted = data.split(" - ");
    const menuToReply = await doTheCall(dataSplitted[0], dataSplitted[1]);
    ctx.reply(menuToReply);
  });
  return listaMenuScene;
}

module.exports = {
  lista_menu_scene,
};
