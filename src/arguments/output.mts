import { defineArgs } from '../utils/define-args.mjs'

export const OutputArgs = defineArgs({
	json: {
		default: false,
		description: 'Output the result as JSON.',
		type: 'boolean',
	},
})
