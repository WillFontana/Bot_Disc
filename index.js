const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const client = new Discord.Client();
const configs = require("./config.json");

const prefixo = configs.PREFIX;

const ytdlOptions = {
  filter: "audioonly",
};

const servidores = {
  server: {
    connection: null,
    dispatcher: null,
  },
};

client.on("ready", () => {
  console.log("Vo me adentra no server gostosamente!");
});

client.on("message", async (msg) => {
  //filtro
  if (!msg.guild) return;
  if (!msg.content.startsWith(prefixo)) return;
  if (!msg.member.voice.channel) {
    msg.channel.send(
      "Pera ai, tu quer que eu entre em um canal de voz e nem está em um? Tá achando que sou palhaço é?"
    );
    return;
  }

  // comandos

  // Gadiao (Gabriel)
  if (msg.content === prefixo + "gadiao") {
    msg.channel.send("Muuu, muuu, mas ela é diferente meu!");
  }

  //comando camila
  if (msg.content === prefixo + "camilla") {
    msg.channel.send("KKKKK ela é cuie vei");
  } //comando Matheus
  if (msg.content === prefixo + "matheus") {
    msg.channel.send(
      "Teu monitor é ultrawide? Pq eu vo manda nude aqui... 8======================================D"
    );
  }

  //Soma (.soma [número1] + [número2] = resultado)
  if (msg.content === prefixo + ``) {
    //código - - - -
  }

  //comando Will
  if (msg.content === prefixo + "will") {
    msg.channel.send("AAAAAAAIIIIII WILLLL, MACHUUUUCA");
    servidores.server.connection = await msg.member.voice.channel.join();
    servidores.server.connection.play(
      ytdl("https://www.youtube.com/watch?v=uGFhobnd1Mg", ytdlOptions)
    );
  }

  //entrar em um servidor
  if (msg.content === prefixo + "entre") {
    servidores.server.connection = await msg.member.voice.channel.join();
    msg.channel.send(
      "Posso me adentrar gostoso no canal de voz? Foda-se entrei"
    );
  }

  //Comando de sair
  if (msg.content === prefixo + "xispa") {
    servidores.server.connection = await msg.member.voice.channel.leave();
    msg.channel.send("Calma parça, já to saindo...");
  }

  //comando de dar play em música
  if (msg.content.includes("play" && prefixo + "p")) {
    servidores.server.connection = await msg.member.voice.channel.join();
    msg.channel.send(
      "To adentrando no canal de voz de vocês gostoso, e to trazendo música de origem duvidosa!"
    );
    const { content } = msg;

    const video = content.split(" ")[1];
    try {
      servidores.server.connection.play(ytdl(video, ytdlOptions));
    } catch (error) {
      console.log(error);
    }
  }
});

client.login(configs.TOKEN_DISCORD);
