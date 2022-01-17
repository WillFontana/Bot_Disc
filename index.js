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
    servidores.server.connection = await msg.member.voice.channel.join();
  }

  //Comando de sair
  if (msg.content === prefixo + "sair") {
    servidores.server.connection = await msg.member.voice.channel.leave();
  }

  //comando de dar play em música
  if (msg.content.includes("play" && prefixo + "p")) {
    if (!msg.member.voice.channel) {
      msg.channel.send("Você precisa estar em um canal de voz");
      return;
    }
    servidores.server.connection = await msg.member.voice.channel.join();
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
