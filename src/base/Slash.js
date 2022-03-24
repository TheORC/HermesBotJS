"use strict";

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = class Slash {

	constructor(client, {
		name = null,
		description = 'No description provided.',
		category = 'Miscellaneous',
		usage = 'No usage provided.',
		isSubcommand = false,
		enabled = true,
    options = []
	}) {
		this.client = client;
		this.conf = { enabled };
		this.commandData = { name, description, category, usage, enabled, options };
		this.slashCommand = new SlashCommandBuilder().setName(name).setDescription(description);
	}

	toJSON(){
		return this.slashCommand.toJSON();
	}
};
