const {
  Client,
  Partials,
  GatewayIntentBits,
  Permissions,
  Collection,
  EmbedBuilder,
  Colors,
  ChannelType,
} = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
  ],
  shards: 'auto',
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Reaction,
    Partials.GuildScheduledEvent,
    Partials.User,
    Partials.ThreadMember,
  ],
});

const { DiscordTogether } = require('../index.js');

const { REST } = require('@discordjs/rest');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Routes } = require('discord-api-types/v10');
const { readdirSync } = require('fs');
const moment = require('moment');

client.commands = new Collection();

const rest = new REST({ version: '10' }).setToken(
  'TOKEN',
);

const log = (l) => {
  console.log(`[${moment().format('DD-MM-YYYY HH:mm:ss')}] ${l}`);
};

//command-handler
const commands = [];
const commandFiles = readdirSync('./src/commands').filter((file) => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`../src/commands/${file}`);
  commands.push(command.data.toJSON());
  client.commands.set(command.data.name, command);
}

client.on('ready', async () => {
  try {
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands,
    });
  } catch (error) {
    console.error(error);
  }
  log(`${client.user.username} is now active!`);
});

//event-handler
const eventFiles = readdirSync('./src/events').filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(`../src/events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.discordTogether = new DiscordTogether(client);

client.login('TOKEN');

client.on('guildCreate', async (guild) => {
  const embed = new EmbedBuilder()
    .setAuthor({ name: 'Play Game', iconURL: client.user.avatarURL() })
    .setDescription(`Hey! <@${guild.ownerId}> thanks for adding me. \`/play\` to start playing the game`)
    .setFooter({ text: 'Play Game', iconURL: client.user.avatarURL() })
    .setColor(Colors.Blurple);
  guild.channels.cache
    .filter((x) => x.type == ChannelType.GuildText)
    .random(1)[0]
    .send({ embeds: [embed] });
});
