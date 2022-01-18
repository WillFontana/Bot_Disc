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
  console.log("Iniciando serviços");
});

client.on("message", async (msg) => {
  //filtro
  if (!msg.guild) return;
  if (!msg.content.startsWith(prefixo)) return;

  // Comandos

  //entrar em um servidor
  if (msg.content === prefixo + "entre") {
    if (!msg.member.voice.channel) {
      msg.channel.send("Você precisa estar em um canal de voz");
      return;
    }
    servidores.server.connection = await msg.member.voice.channel.join();
  }

  //Comando de sair
  if (msg.content === prefixo + "sair") {
    msg.member.voice.channel.leave();
    servidores.server.connection = null;
    servidores.server.dispatcher = null;
  }

  //comando de dar play em música
  if (msg.content.includes("play")) {
    if (!msg.member.voice.channel) {
      msg.channel.send("Você precisa estar em um canal de voz");
      return;
    }
    servidores.server.connection = await msg.member.voice.channel.join();
    const { content } = msg;

    const link = content.split(" ")[1];
    if (ytdl.validateURL(link)) {
      servidores.server.dispatcher = servidores.server.connection.play(
        ytdl(link, ytdlOptions)
      );
    } else {
      msg.channel.send("Insira um link válido");
    }
  }

  //Pausar stream
  if (msg.content === prefixo + "pause") {
    servidores.server.dispatcher.pause();
  }

  //Resumir stream
  if (msg.content === prefixo + "resume") {
    servidores.server.dispatcher.resume();
  }
});

client.login(configs.TOKEN_DISCORD);
