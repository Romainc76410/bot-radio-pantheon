require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const play = require('play-dl');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

const RADIO_URL = 'http://link.zeno.fm/0sl7yyooaieuv';
const GUILD_ID = process.env.GUILD_ID;
const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID;

async function connectAndPlay(guild) {
  try {
    const channel = await guild.channels.fetch(VOICE_CHANNEL_ID);
    const connection = joinVoiceChannel({
      channelId: VOICE_CHANNEL_ID,
      guildId: GUILD_ID,
      adapterCreator: guild.voiceAdapterCreator,
    });

    const stream = await play.stream(RADIO_URL);
    const resource = createAudioResource(stream.stream, { inputType: stream.type });
    const player = createAudioPlayer();
    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      player.play(resource); // relance la lecture si arrêtée
    });

    console.log("Bot connecté et radio lancée.");
  } catch (error) {
    console.error("Erreur lors de la connexion ou de la lecture :", error);
  }
}

client.once('ready', () => {
  console.log(`Connecté en tant que ${client.user.tag}`);
  const guild = client.guilds.cache.get(GUILD_ID);
  if (guild) {
    connectAndPlay(guild);
  }
});

client.login(process.env.DISCORD_TOKEN);