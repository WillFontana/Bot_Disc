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

  // Comandos

  // Gadiao (Gabriel)
  if (msg.content === prefixo + "gadiao") {
    msg.channel.send("Nossa gastei mo grana atoa mano...");
    servidores.server.connection = await msg.member.voice.channel.join();
    servidores.server.connection.play(
      ytdl("https://www.youtube.com/watch?v=3xq4-jr248s", ytdlOptions)
    );
  }
  //comando Matheus
  if (msg.content === prefixo + "matheus") {
    msg.channel.send(
      "Teu monitor é ultrawide? Pq eu vo manda nude aqui... 8======================================D"
    );
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

  //instagram dos Dev's do projeto (Dev's, coloquem seus instas aqui)
  if (msg.content === prefixo + "insta") {
    msg.channel.send(
      "O Insta dos Dev's responsáveis por esse bot incrível são:"
    );
    msg.channel.send("@leo_forin ; Link: https://www.instagram.com/leo_forin/");
    msg.channel.send(
      "@will_fontana ; Link: https://www.instagram.com/will_fontana/"
    );
  }
  //Comando para calcular idade
  if (msg.content.includes("idade")) {
    const idade = msg.content.split(" ")[1];
    const ano = parseInt(2021 - idade);
    if (ano < 0) {
      let ac = "a.C ";
      parseInt(idade);
      number = 2021;
      ano2 = number - idade;
      msg.channel.send(
        `Tu realmente nasceu em ${ano2 * -1} ${ac} ? Tá de sacanagem irmão`
      );
    } else {
      msg.channel.send(`Pera ai, é serio que você é de ${ano} ?? Credo`);
    }
  }
  // Comando de contas
  if (msg.content.includes("conta")) {
    if (msg.content.includes("+")) {
      let numero1 = msg.content.split(" ")[1];
      let numero2 = msg.content.split("+ ")[1];
      let sum = parseFloat(numero1) + parseFloat(numero2);
      msg.channel.send(sum.toFixed(2));
    }
    if (msg.content.includes("-")) {
      let numero1 = msg.content.split(" ")[1];
      let numero2 = msg.content.split("- ")[1];
      let sum = parseFloat(numero1) - parseFloat(numero2);
      msg.channel.send(sum.toFixed(2));
    }
    if (msg.content.includes("*")) {
      let numero1 = msg.content.split(" ")[1];
      let numero2 = msg.content.split("* ")[1];
      let sum = parseFloat(numero1) * parseFloat(numero2);
      msg.channel.send(sum.toFixed(2));
    }
    if (msg.content.includes("/")) {
      if (msg.content.includes(" / 0")) {
        msg.channel.send(
          "Primeira lei da matemática babaca... Não se pode dividir por zero..."
        );
      } else {
        let numero1 = msg.content.split(" ")[1];
        let numero2 = msg.content.split("/ ")[1];
        let sum = parseFloat(numero1) / parseFloat(numero2);
        msg.channel.send(sum.toFixed(2));
      }
    }
    if (msg.content.includes("raiz")) {
      const numero = msg.content.split(" ")[2];
      const total = Math.sqrt(numero);
      msg.channel.send(total);
    }
  }
  //comando de dar play em música
  if (msg.content.includes("play" && prefixo + "p")) {
    if (!msg.member.voice.channel) {
      msg.channel.send(
        "Pera ai, tu quer que eu entre em um canal de voz e nem está em um? Tá achando que sou palhaço é?"
      );
      return;
    }
    servidores.server.connection = await msg.member.voice.channel.join();
    const { content } = msg;

    const video = content.split(" ")[1];
    try {
      servidores.server.connection.play(ytdl(video, ytdlOptions));
    } catch (error) {
      console.log(error);
      ///////
      //////////////
      /////////
    }
  }
});

client.login(configs.TOKEN_DISCORD);
