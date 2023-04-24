import { APIInteraction, InteractionResponseType, InteractionType } from 'discord-api-types/v10';
import { isValidRequest, PlatformAlgorithm } from 'discord-verify';

export const config = {
	runtime: 'edge',
	// If the region of the edge function should be static (because of a db for example)
	// regions: ['fra1'],
};

const PUBLIC_KEY = process.env.PUBLIC_KEY as string;

export default async (request: Request) => {
	if (request.method !== 'POST' || request.body == null) {
		return new Response(JSON.stringify({ message: 'Method Not Allowed' }), {
			status: 405,
			headers: {
				'content-type': 'application/json',
			},
		});
	}

	const isValid = await isValidRequest(request, PUBLIC_KEY, PlatformAlgorithm.VercelProd);

	if (!isValid) {
		return new Response(JSON.stringify({ error: 'Invalid Signature' }), {
			status: 401,
		});
	}

	const message = (await new Response(request.body).json()) as APIInteraction;

	if (message.type === InteractionType.Ping) {
		return new Response(JSON.stringify({ type: InteractionResponseType.Pong }), {
			headers: {
				'content-type': 'application/json',
			},
		});
	} else if (message.type === InteractionType.ApplicationCommand) {
		if (message.data.name === 'ping') {
			return new Response(
				JSON.stringify({
					type: InteractionResponseType.ChannelMessageWithSource,
					data: {
						content: 'Pong 🏓',
						flags: 64,
					},
				}),
				{
					headers: {
						'content-type': 'application/json',
					},
				}
			);
		} else {
			return new Response(
				JSON.stringify({
					type: InteractionResponseType.ChannelMessageWithSource,
					data: {
						content: 'Unknown Command',
						flags: 64,
					},
				}),
				{
					headers: {
						'content-type': 'application/json',
					},
				}
			);
		}
	}
};
