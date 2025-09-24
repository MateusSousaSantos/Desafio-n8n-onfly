import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class Random implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Random',
		name: 'random',
		icon: 'file:random.svg',
		group: ['transform'],
		version: 1,
		description: 'Gera um número aleatório verdadeiro',
		defaults: {
			name: 'Random',
			color: '#ecececff',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Operação',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'True Random Number Generator',
						value: 'generate',
						description: 'Gera um número verdadeiramente aleatório usando Random.org',
					},
				],
				default: 'generate',
			},
			{
				displayName: 'Min',
				name: 'min',
				type: 'number',
				description: 'Valor mínimo (inclusivo). Aceita valores de -1,000,000,000 a 1,000,000,000.',
				default: 1,
				required: true,
				typeOptions: {
					minValue: -1000000000,
					maxValue: 1000000000,
				},
				displayOptions: {
					show: {
						operation: ['generate'],
					},
				},
			},
			{
				displayName: 'Max',
				name: 'max',
				type: 'number',
				description: 'Valor máximo (inclusivo)',
				default: 60,
				required: true,
				displayOptions: {
					show: {
						operation: ['generate'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				if (operation !== 'generate') {
					throw new NodeOperationError(this.getNode(), 'Operação inválida.', {
						itemIndex: i,
					});
				}

				// Lê parâmetros por item
				let min = this.getNodeParameter('min', i) as number;
				let max = this.getNodeParameter('max', i) as number;

				// Validações simples e saneamento
				if (!Number.isFinite(min) || !Number.isFinite(max)) {
					throw new NodeOperationError(
						this.getNode(),
						'Os parâmetros "Min" e "Max" devem ser números.',
						{ itemIndex: i },
					);
				}

				// Arredonda para inteiros (Random.org para este endpoint é inteiro)
				min = Math.floor(min);
				max = Math.floor(max);

				// Se invertidos, troca
				if (min > max) {
					[min, max] = [max, min];
				}

				// Monta a chamada ao Random.org
				// Doc: GET https://www.random.org/integers/?num=1&min=1&max=60&col=1&base=10&format=plain&rnd=new
				const options = {
					method: 'GET' as const,
					url: 'https://www.random.org/integers/',
					qs: {
						num: 1,
						min,
						max,
						col: 1,
						base: 10,
						format: 'plain',
						rnd: 'new',
					},
					json: false,
					timeout: 10000,
					returnFullResponse: false,
				};

				if (min < -1000000000 || max > 1000000000) {
					throw new NodeOperationError(
						this.getNode(),
						'Random.org suporta valores entre -1,000,000,000 e 1,000,000,000.',
						{ itemIndex: i },
					);
				}
				const response = (await this.helpers.httpRequest(options)) as string;

				// Faz o parse do número retornado
				const value = parseInt(String(response).trim(), 10);

				if (!Number.isInteger(value)) {
					throw new NodeOperationError(this.getNode(), 'Resposta inesperada do Random.org.', {
						itemIndex: i,
					});
				}

				// Emite o item de saída
				returnData.push({
					json: {
						randomNumber: value,
						min,
						max,
						source: 'random.org',
					},
				});
			} catch (error) {
				// Converte para erro de operação por item para não derrubar o fluxo todo
				if (error instanceof NodeOperationError) {
					throw error;
				}
				throw new NodeOperationError(this.getNode(), (error as Error).message, {
					itemIndex: i,
				});
			}
		}

		return [returnData];
	}
}
