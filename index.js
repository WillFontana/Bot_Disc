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

client.on("message", async msg => {
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
          fields: "items(id(videoId), snippet(title, channelTitle))",
          type: "video",
        },
        function (err, result) {
          if (err) console.log(err);

          if (result) {
            const resultList = [];

            //Constroi menssagem embed
            for (let i in result.data.items) {
              const mountItem = {
                videoTitle: result.data.items[i].snippet.title,
                channelName: result.data.items[i].snippet.channelTitle,
                id:
                  "https://www.youtube.com/watch?v=" +
                  result.data.items[i].id.videoId,
              };
              resultList.push(mountItem);
            }
            const embed = new Discord.MessageEmbed()
              .setColor([255, 153, 51])
              .setAuthor("FireBot")
              .setDescription("Escolha de 1 a 5");

            //Cria os campos de cada resultado
            for (let i in resultList) {
              embed.addField(
                `${parseInt(i) + 1}: ${resultList[i].videoTitle}`,
                resultList[i].channelName
              );
            }
            msg.channel.send(embed).then((embedMessage) => {
              const reacts = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];

              //reações para cada emoji
              for (let i = 0; i < reacts.length; i++) {
                embedMessage.react(reacts[i]);
              }

              const filter = (reaction, user) => {
                return (
                  reacts.includes(reaction.emoji.name) &&
                  user.id === msg.author.id
                );
              };
              embedMessage
                .awaitReactions(filter, {
                  max: 1,
                  time: 20000,
                  errors: ["time"],
                })
                .then((collected) => {
                  const reaction = collected.first();
                  const idOption = reacts.indexOf(reaction.emoji.name);

                  const newEmbed = new Discord.MessageEmbed().setDescription(
                    `Opção escolhida: ${resultList[idOption].videoTitle} de ${resultList[idOption].channelName}`
                  );
                  msg.channel.send(newEmbed);

                  servidores.server.queue.push(resultList[idOption].id);
                  playMusics();
                })
                .catch((error) => {
                  msg.reply("Opção inválida");
                  console.log(error);
                });
            });
          }
        }
      );
    }
    if (msg.content.includes("rcubica")) {
      const numero = msg.content.split(" ")[2];
      const total = Math.cbrt(numero);
      msg.channel.send(total.toFixed(2).replace(".", ","));
    }
    if (msg.content.includes("potencia")) {
      const numero = msg.content.split(" ")[2];
      const numero2 = msg.content.split(" ")[3];
      const total = Math.pow(numero, numero2);
      msg.channel.send(total.toFixed(2).replace(".", ","));
    }
    if (msg.content.includes("seno")) {
      const numero = msg.content.split(" ")[2];
      const total = Math.sin(numero);
      msg.channel.send(total.toFixed(2).replace(".", ","));
    }
  }

  //Pausar stream
  if (msg.content === prefixo + "pause") {
    if (servidores.server.connection !== null) {
      servidores.server.dispatcher.pause();
    } else {
      msg.channel.send("Você precisa estar em um canal de voz");
    }
  }

  //Resumir stream
  if (msg.content === prefixo + "resume") {
    if (servidores.server.connection !== null) {
      servidores.server.dispatcher.resume();
    } else {
      msg.channel.send("Você precisa estar em um canal de voz");
    }
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
