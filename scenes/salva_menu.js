const { Markup } = require("telegraf");
const Stage = require("telegraf/stage");
const Scene = require("telegraf/scenes/base");
const { searchScuola, getDiete } = require("../helpers");
const { MENU_PRINCIPALE } = require("../menu");
const { leave } = Stage;

function salva_menu_scene() {
  // Salva Menu scene
  const salvaMenuScene = new Scene("salva_menu");
  salvaMenuScene.enter((ctx) => {
    console.log(ctx.from);
    ctx.session.salvaMenuSceneStep = 1;
    ctx.session.preferenza = {
      telegramId: ctx.from.id,
      nome: "",
      nome_scuola: "",
      idScuola: "",
      nome_dieta: "",
      idDieta: "",
    };
    ctx.reply("Inserisci il nome della scuola: ");
  });
  salvaMenuScene.leave((ctx) =>
    ctx.reply(
      "Menu Principale",
      Markup.keyboard(MENU_PRINCIPALE).oneTime().resize().extra()
    )
  );
  salvaMenuScene.hears(/Conferma/gi, (ctx) => {
    ctx.reply("Menu salvato.");
    return ctx.scene.leave();
  });
  salvaMenuScene.hears(/Annulla/gi, leave());
  salvaMenuScene.on("message", async (ctx) => {
    switch (ctx.session.salvaMenuSceneStep) {
      case 1: {
        const search = ctx.update.message.text.trim().toLowerCase();
        const scuole = await searchScuola(search);
        const scuoleAsMarkup = scuole.map((s) => [s.label + " ; " + s.value]);
        scuoleAsMarkup.push(["Annulla"]);
        ctx.reply(
          "Scegli la scuola:",
          Markup.keyboard(scuoleAsMarkup).oneTime().resize().extra()
        );
        ctx.session.salvaMenuSceneStep = ctx.session.salvaMenuSceneStep + 1;
        break;
      }
      case 2: {
        const scelta = ctx.update.message.text.split(" ; ");
        ctx.session.preferenza = {
          ...ctx.session.preferenza,
          nome_scuola: scelta[0],
          idScuola: scelta[1],
        };
        const diete = await getDiete();
        const dieteAsMarkup = diete.map((d) => [d.label + " ; " + d.value]);
        dieteAsMarkup.push(["Annulla"]);
        ctx.reply(
          `Hai scelto ${scelta[0]}. Inserisci il tipo di dieta:`,
          Markup.keyboard(dieteAsMarkup).oneTime().resize().extra()
        );
        ctx.session.salvaMenuSceneStep = ctx.session.salvaMenuSceneStep + 1;
        break;
      }
      case 3: {
        const scelta = ctx.update.message.text.split(" ; ");
        ctx.session.preferenza = {
          ...ctx.session.preferenza,
          idDieta: scelta[1],
          nome_dieta: scelta[0],
        };
        ctx.reply(`Hai scelto ${scelta[0]}. Inserisci un nome per il menu:`);
        ctx.session.salvaMenuSceneStep = ctx.session.salvaMenuSceneStep + 1;
        break;
      }
      case 4: {
        const scelta = ctx.update.message.text.trim();
        ctx.session.preferenza = {
          ...ctx.session.preferenza,
          nome: scelta,
        };
        ctx.reply(
          `Confermi di voler salvare i dati?`,
          Markup.keyboard([["Conferma"], ["Annulla"]])
            .oneTime()
            .resize()
            .extra()
        );
        break;
      }
    }
  });
  return salvaMenuScene;
}

module.exports = {
  salva_menu_scene,
};
