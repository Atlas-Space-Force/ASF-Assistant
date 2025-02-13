import { InteractionContextType } from "discord.js";
import { client } from "src/index";

declare module "discord.js" {
	export interface BaseApplicationCommandData {
		execute: (interaction: Interaction, ...args: any[]) => Promise<void | any>;
		guilds?: Array<Snowflake>;
		contexts?: InteractionContextType[]
	}

	export interface ApplicationCommandSubCommandData {
		execute?: (interaction: Interaction, ...args: any[]) => Promise<void | any>;
	}

	export interface ChatInputApplicationCommandData {
		onAutocomplete?: (interaction: Interaction) => Promise<void | any>;
	}

	export interface BaseComponentData {
		regexValidator?: RegExp;
		execute: (interaction: BaseInteraction, ...args: any[]) => Promise<void | any>;
		customId: string;
	}

	export interface ModalComponentData extends Omit<BaseComponentData, "type" | "showModalAndWaitForSubmit"> {
		execute?: (interaction: ModalSubmitInteraction, ...args: any[]) => Promise<void | any>;
	}

	export interface InteractionButtonComponentData {
		execute: (interaction: ButtonInteraction, ...args: any[]) => Promise<void | any>;
	}
}
