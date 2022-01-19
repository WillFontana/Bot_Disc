const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const client = new Discord.Client();
const configs = require("./config.json");
const google = require("googleapis");

const youtube = new google.youtube_v3.Youtube({
  version: "v3",
  auth: configs.GOOGLE_KEY,
});

const prefixo = configs.PREFIX;

const servidores = {
  server: {
    connection: null,
    dispatcher: null,
    queue: [],
    playing: false,
  },
};

client.on("ready", () => {
  console.log("Iniciado");
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

  //Comando zerar fila
  if (msg.content === prefixo + "zerar") {
    if (servidores.server.connection !== null) {
      let musics = servidores.server.queue;
      console.log("musics:", musics);
      console.log("musics[0]:", musics[0]);
      musics.map((item) => {
        if (typeof item !== Array) musics.pop();
      });
    }
    console.log("Servidores:", servidores.server.queue);
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

    //Bot entra na call
    if (servidores.server.connection === null) {
      servidores.server.connection = await msg.member.voice.channel.join();
    }

    //Validando request
    const { content } = msg;

    if (content.length === 0) {
      msg.channel.send("Insira pelo menos um link ou nome");
    }

    const link = content.split(" ");
    link.shift();

    if (ytdl.validateURL(link)) {
      servidores.server.queue.push(link);
      playMusics();
    } else {
      const search = content.split(" ");
      search.shift();
      youtube.search.list(
        {
          q: search.join(" "),
          part: "snippet",
          fields: "items(id(videoId), snippet(title))",
          type: "video",
        },
        function (err, result) {
          if (err) console.log(err);

          if (result) {
            const videoId = `https://www.youtube.com/watch?v=${result.data.items[0].id.videoId}`;
            servidores.server.queue.push(videoId);
            console.log("Adicionado id: ", videoId);
            playMusics();
          }
        }
      );
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

const playMusics = () => {
  if (servidores.server.playing === false) {
    const playing = servidores.server.queue[0];
    servidores.server.playing = true;

    servidores.server.dispatcher = servidores.server.connection.play(
      ytdl(playing, configs.YTDL)
    );

    servidores.server.dispatcher.on("finish", () => {
      servidores.server.queue.shift();
      servidores.server.playing = false;

      if (servidores.server.queue.length > 0) {
        playMusics();
      } else {
        servidores.server.dispatcher = null;
      }
    });
  }
};

client.login(configs.TOKEN_DISCORD);
