const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const client = new Discord.Client();
const configs = require("./config.json");
const google = require("googleapis");
const fs = require("fs");

const youtube = new google.youtube_v3.Youtube({
  version: "v3",
  auth: configs.GOOGLE_KEY,
});

const prefixo = configs.PREFIX;

const servidores = [];

client.on("guildCreate", (guild) => {
  servidores[guild.id] = {
    connection: null,
    dispatcher: null,
    queue: [],
    playing: false,
  };
  saveServer(guild.id);
});

client.on("ready", () => {
  loadServers();
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
    servidores[msg.guild.id].connection = await msg.member.voice.channel.join();
  }

  //Comando zerar fila
  if (msg.content === prefixo + "zerar") {
    if (servidores[msg.guild.id].connection !== null) {
      let musics = servidores[msg.guild.id].queue;
      musics.splice(1, musics.length);
    }
  }

  //Comando de sair
  if (msg.content === prefixo + "sair") {
    msg.member.voice.channel.leave();
    servidores[msg.guild.id].connection = null;
    servidores[msg.guild.id].dispatcher = null;
    servidores[msg.guild.id].playing = false;
    servidores[msg.guild.id].queue = [];
  }

  //comando de dar play em música
  if (msg.content.includes("play")) {
    if (!msg.member.voice.channel) {
      msg.channel.send("Você precisa estar em um canal de voz");
      return;
    }

    //Bot entra na call
    if (servidores[msg.guild.id].connection === null) {
      servidores[msg.guild.id].connection =
        await msg.member.voice.channel.join();
    }

    //Validando request
    const { content } = msg;

    if (content.length === 0) {
      msg.channel.send("Insira pelo menos um link ou nome");
    }

    const link = content.split(" ");
    link.shift();

    if (ytdl.validateURL(link)) {
      servidores[msg.guild.id].queue.push(link.join(""));
      playMusics(msg);
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

                  servidores[msg.guild.id].queue.push(resultList[idOption].id);
                  playMusics(msg);
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
  }

  //Pausar stream
  if (msg.content === prefixo + "pause") {
    if (servidores[msg.guild.id].connection !== null) {
      servidores[msg.guild.id].dispatcher.pause();
    } else {
      msg.channel.send("Você precisa estar em um canal de voz");
    }
  }

  if (msg.content === prefixo + "skip") {
    if (!servidores[msg.guild.id].queue[1])
      return msg.channel.send("Você não possui mais músicas na fila");
    if (servidores[msg.guild.id].connection !== null) {
      servidores[msg.guild.id].queue.shift();
      servidores[msg.guild.id].playing = false;

      playMusics(msg);
    } else {
      msg.channel.send("Você precisa estar em um canal de voz");
    }
  }

  //Resumir stream
  if (msg.content === prefixo + "resume") {
    if (servidores[msg.guild.id].connection !== null) {
      servidores[msg.guild.id].dispatcher.resume();
    } else {
      msg.channel.send("Você precisa estar em um canal de voz");
    }
  }
});

const playMusics = (msg) => {
  if (servidores[msg.guild.id].playing === false) {
    const playing = servidores[msg.guild.id].queue[0];
    servidores[msg.guild.id].playing = true;

    servidores[msg.guild.id].dispatcher = servidores[
      msg.guild.id
    ].connection.play(ytdl(playing, configs.YTDL));

    servidores[msg.guild.id].dispatcher.on("finish", () => {
      servidores[msg.guild.id].queue.shift();
      servidores[msg.guild.id].playing = false;

      if (servidores[msg.guild.id].queue.length > 0) {
        playMusics(msg);
      } else {
        servidores[msg.guild.id].dispatcher = null;
      }
    });
  }
};

const loadServers = () => {
  fs.readFile("serversList.json", "utf8", (err, data) => {
    if (err) {
      console.log("Ocorreu um erro ao carregar os servidores: ", err);
    } else {
      const objRead = JSON.parse(data);

      objRead.servers.map((item) => {
        servidores[item] = {
          connection: null,
          dispatcher: null,
          queue: [],
          playing: false,
        };
      });
    }
  });
};

const saveServer = (newIdServer) => {
  fs.readFile("serversList.json", "utf8", (err, data) => {
    if (err) {
      console.log("Ocorreu um erro ao salvar o servidor: ", err);
    } else {
      const objRead = JSON.parse(data);
      objRead.servers.push(newIdServer);

      const objWrite = JSON.stringify(objRead);
      fs.writeFile("serversList.json", objWrite, "utf8", () => {});
    }
  });
};

client.login(configs.TOKEN_DISCORD);
