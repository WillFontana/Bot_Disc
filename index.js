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
  console.log("To na ativa por aqui!");
});

client.on("message", async (msg) => {
  //filtro
  if (!msg.guild) return;
  if (!msg.content.startsWith(prefixo)) return;
  if (!msg.member.voice.channel) {
    msg.channel.send("Tu não tá na merda de um canal de voz mano...");
    return;
  }

  // comandos
  // Gadiao (Gabriel)
  if (msg.content === prefixo + "gadiao") {
    msg.channel.send("Ah, mas ela é diferente meu!");
  }
  if (msg.content === prefixo + "will") {
    servidores.server.connection.play(
      ytdl("https://www.youtube.com/watch?v=uGFhobnd1Mg", ytdlOptions)
    );
  }
  if (msg.content === prefixo + "entre") {
    servidores.server.connection = await msg.member.voice.channel.join();
  }
  if (msg.content.includes("play")) {
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
