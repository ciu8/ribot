const { Markup } = require("telegraf");
const Stage = require("telegraf/stage");
const Scene = require("telegraf/scenes/base");
const { searchScuola, getDiete, doTheCall } = require("../helpers");
const { MENU_PRINCIPALE, INTRO_MENU_OGGI_MSG, INDIETRO } = require("../menu");
const { leave } = Stage;

function consulta_menu_scene() {
  const NO_SCHOOL_FOUND = "Nessuna scuola trovata";
  // Salva Menu scene
  const consultaMenuScene = new Scene("consulta_menu");
  consultaMenuScene.enter((ctx) => {
    ctx.session.consultaMenuSceneStep = 1;
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
  consultaMenuScene.leave((ctx) =>
    ctx.reply(
      "Menu Principale",
      Markup.keyboard(MENU_PRINCIPALE).oneTime().resize().extra()
    )
  );
  consultaMenuScene.hears(INDIETRO, leave());
  consultaMenuScene.on("message", async (ctx) => {
    switch (ctx.session.consultaMenuSceneStep) {
      case 1: {
        const search = ctx.update.message.text.trim().toLowerCase();
        const scuole = await searchScuola(search);
        if (scuole.length == 0) {
          ctx.reply(NO_SCHOOL_FOUND);
          return ctx.scene.leave();
        }
        const scuoleAsMarkup = scuole.map((s) => [s.label + " ; " + s.value]);
        scuoleAsMarkup.push([INDIETRO]);
        ctx.reply(
          "Scegli la scuola:",
          Markup.keyboard(scuoleAsMarkup).oneTime().resize().extra()
        );
        ctx.session.consultaMenuSceneStep =
          ctx.session.consultaMenuSceneStep + 1;
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
        dieteAsMarkup.push([INDIETRO]);
        ctx.reply(
          `Hai scelto ${scelta[0]}. Inserisci il tipo di dieta:`,
          Markup.keyboard(dieteAsMarkup).oneTime().resize().extra()
        );
        ctx.session.consultaMenuSceneStep =
          ctx.session.consultaMenuSceneStep + 1;
        break;
      }
      case 3: {
        const scelta = ctx.update.message.text.split(" ; ");
        ctx.session.preferenza = {
          ...ctx.session.preferenza,
          idDieta: scelta[1],
          nome_dieta: scelta[0],
        };
        const { idScuola, idDieta } = ctx.session.preferenza;
        const menuToReply = await doTheCall(idScuola, idDieta);
        ctx.reply(INTRO_MENU_OGGI_MSG + menuToReply);
        ctx.scene.leave();
        break;
      }
    }
  });
  return consultaMenuScene;
}

module.exports = {
  consulta_menu_scene,
};
