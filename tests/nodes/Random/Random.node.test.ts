import { Random } from '../../../nodes/Random/Random.node';
import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';

describe('Random Node', () => {
	let randomNode: Random;
	let mockExecuteFunctions: jest.Mocked<IExecuteFunctions>;
	let mockHttpRequest: jest.MockedFunction<any>;

	beforeEach(() => {
		randomNode = new Random();
		
		// Criar mock da função httpRequest
		mockHttpRequest = jest.fn();
		
		// Mock das funções do n8n
		mockExecuteFunctions = {
			getInputData: jest.fn(),
			getNodeParameter: jest.fn(),
			getNode: jest.fn(),
			helpers: {
				httpRequest: mockHttpRequest,
			},
		} as any;

		// Mock padrão do node
		mockExecuteFunctions.getNode.mockReturnValue({
			id: 'test-node-id',
			name: 'Test Random Node',
			type: 'random',
		} as any);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Descrição do Node', () => {
		it('deve ter os metadados corretos do node', () => {
			expect(randomNode.description.displayName).toBe('Random');
			expect(randomNode.description.name).toBe('random');
			expect(randomNode.description.version).toBe(1);
			expect(randomNode.description.group).toEqual(['transform']);
		});

		it('deve ter inputs e outputs corretos', () => {
			expect(randomNode.description.inputs).toEqual(['main']);
			expect(randomNode.description.outputs).toEqual(['main']);
		});

		it('deve ter a operação generate configurada', () => {
			const operationProperty = randomNode.description.properties.find(
				(prop: any) => prop.name === 'operation'
			);
			
			expect(operationProperty).toBeDefined();
			expect(operationProperty?.options).toContainEqual(
				expect.objectContaining({
					name: 'True Random Number Generator',
					value: 'generate',
					description: 'Gera um número verdadeiramente aleatório usando Random.org',
				})
			);
		});

		it('deve ter os parâmetros min e max com as restrições corretas', () => {
			const minProperty = randomNode.description.properties.find(
				(prop: any) => prop.name === 'min'
			);
			const maxProperty = randomNode.description.properties.find(
				(prop: any) => prop.name === 'max'
			);
			
			expect(minProperty).toBeDefined();
			expect(maxProperty).toBeDefined();
			expect(minProperty?.required).toBe(true);
			expect(maxProperty?.required).toBe(true);
			expect(minProperty?.typeOptions?.minValue).toBe(-1000000000);
			expect(minProperty?.typeOptions?.maxValue).toBe(1000000000);
		});
	});

	describe('Função Execute - Casos de Sucesso', () => {
		beforeEach(() => {
			mockExecuteFunctions.getInputData.mockReturnValue([{ json: {} }]);
			mockExecuteFunctions.getNodeParameter
				.mockImplementation((paramName: string, itemIndex: number) => {
					switch (paramName) {
						case 'operation':
							return 'generate';
						case 'min':
							return 1;
						case 'max':
							return 100;
						default:
							return undefined;
					}
				});
		});

		it('deve gerar número aleatório com sucesso', async () => {
			// Mock da resposta da API Random.org
			mockHttpRequest.mockResolvedValue('42\n');

			const result = await randomNode.execute.call(mockExecuteFunctions);

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			expect(result[0][0].json).toEqual(
				expect.objectContaining({
					randomNumber: 42,
					min: 1,
					max: 100,
					source: 'random.org',
				})
			);
			expect(result[0][0].json.timestamp).toBeDefined();
		});

		it('deve processar múltiplos itens de input', async () => {
			mockExecuteFunctions.getInputData.mockReturnValue([
				{ json: {} },
				{ json: {} },
			]);
			
			mockHttpRequest
				.mockResolvedValueOnce('15\n')
				.mockResolvedValueOnce('87\n');

			const result = await randomNode.execute.call(mockExecuteFunctions);

			expect(result[0]).toHaveLength(2);
			expect(result[0][0].json.randomNumber).toBe(15);
			expect(result[0][1].json.randomNumber).toBe(87);
		});

		it('deve trocar min e max se min > max', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockImplementation((paramName: string) => {
					switch (paramName) {
						case 'operation':
							return 'generate';
						case 'min':
							return 100; // Maior que max
						case 'max':
							return 50;  // Menor que min
						default:
							return undefined;
					}
				});

			mockHttpRequest.mockResolvedValue('75\n');

			const result = await randomNode.execute.call(mockExecuteFunctions);

			// Verifica se os valores foram trocados
			expect(result[0][0].json.min).toBe(50);
			expect(result[0][0].json.max).toBe(100);
		});

		it('deve arredondar números decimais para inteiros', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockImplementation((paramName: string) => {
					switch (paramName) {
						case 'operation':
							return 'generate';
						case 'min':
							return 1.7; // Decimal
						case 'max':
							return 10.9; // Decimal
						default:
							return undefined;
					}
				});

			mockHttpRequest.mockResolvedValue('5\n');

			const result = await randomNode.execute.call(mockExecuteFunctions);

			// Deve arredondar para baixo
			expect(result[0][0].json.min).toBe(1);
			expect(result[0][0].json.max).toBe(10);
		});

		it('deve processar resposta da API com espaços em branco', async () => {
			mockHttpRequest.mockResolvedValue('  42  \n\r');

			const result = await randomNode.execute.call(mockExecuteFunctions);

			expect(result[0][0].json.randomNumber).toBe(42);
		});
	});

	describe('Função Execute - Tratamento de Erros', () => {
		beforeEach(() => {
			mockExecuteFunctions.getInputData.mockReturnValue([{ json: {} }]);
		});

		it('deve lançar erro para operação inválida', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockImplementation((paramName: string) => {
					if (paramName === 'operation') return 'invalid';
					return 1;
				});

			await expect(randomNode.execute.call(mockExecuteFunctions))
				.rejects
				.toThrow(NodeOperationError);
		});

		it('deve lançar erro para números não finitos', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockImplementation((paramName: string) => {
					switch (paramName) {
						case 'operation':
							return 'generate';
						case 'min':
							return NaN;
						case 'max':
							return 100;
						default:
							return undefined;
					}
				});

			await expect(randomNode.execute.call(mockExecuteFunctions))
				.rejects
				.toThrow('Os parâmetros "Min" e "Max" devem ser números.');
		});

		it('deve lançar erro para valores fora dos limites do Random.org', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockImplementation((paramName: string) => {
					switch (paramName) {
						case 'operation':
							return 'generate';
						case 'min':
							return -2000000000; // Fora do limite
						case 'max':
							return 100;
						default:
							return undefined;
					}
				});

			await expect(randomNode.execute.call(mockExecuteFunctions))
				.rejects
				.toThrow('Random.org suporta valores entre -1,000,000,000 e 1,000,000,000.');
		});

		it('deve lançar erro para resposta inválida da API', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockImplementation((paramName: string) => {
					switch (paramName) {
						case 'operation':
							return 'generate';
						case 'min':
							return 1;
						case 'max':
							return 100;
						default:
							return undefined;
					}
				});

			mockHttpRequest.mockResolvedValue('invalid_response');

			await expect(randomNode.execute.call(mockExecuteFunctions))
				.rejects
				.toThrow('Resposta inesperada do Random.org.');
		});

		it('deve tratar erros de requisição HTTP', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockImplementation((paramName: string) => {
					switch (paramName) {
						case 'operation':
							return 'generate';
						case 'min':
							return 1;
						case 'max':
							return 100;
						default:
							return undefined;
					}
				});

			const httpError = new Error('Network error');
			mockHttpRequest.mockRejectedValue(httpError);

			await expect(randomNode.execute.call(mockExecuteFunctions))
				.rejects
				.toThrow(NodeOperationError);
		});
	});

	describe('Integração com API', () => {
		beforeEach(() => {
			mockExecuteFunctions.getInputData.mockReturnValue([{ json: {} }]);
			mockExecuteFunctions.getNodeParameter
				.mockImplementation((paramName: string) => {
					switch (paramName) {
						case 'operation':
							return 'generate';
						case 'min':
							return 1;
						case 'max':
							return 100;
						default:
							return undefined;
					}
				});
		});

		it('deve chamar a API do Random.org com parâmetros corretos', async () => {
			mockHttpRequest.mockResolvedValue('42\n');

			await randomNode.execute.call(mockExecuteFunctions);

			expect(mockHttpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://www.random.org/integers/',
				qs: {
					num: 1,
					min: 1,
					max: 100,
					col: 1,
					base: 10,
					format: 'plain',
					rnd: 'new',
				},
				json: false,
				timeout: 10000,
				returnFullResponse: false,
			});
		});
	});

	describe('Casos Extremos', () => {
		beforeEach(() => {
			mockExecuteFunctions.getInputData.mockReturnValue([{ json: {} }]);
		});

		it('deve processar quando min e max são iguais', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockImplementation((paramName: string) => {
					switch (paramName) {
						case 'operation':
							return 'generate';
						case 'min':
							return 50;
						case 'max':
							return 50;
						default:
							return undefined;
					}
				});

			mockHttpRequest.mockResolvedValue('50\n');

			const result = await randomNode.execute.call(mockExecuteFunctions);

			expect(result[0][0].json.randomNumber).toBe(50);
			expect(result[0][0].json.min).toBe(50);
			expect(result[0][0].json.max).toBe(50);
		});

		it('deve processar números negativos', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockImplementation((paramName: string) => {
					switch (paramName) {
						case 'operation':
							return 'generate';
						case 'min':
							return -100;
						case 'max':
							return -50;
						default:
							return undefined;
					}
				});

			mockHttpRequest.mockResolvedValue('-75\n');

			const result = await randomNode.execute.call(mockExecuteFunctions);

			expect(result[0][0].json.randomNumber).toBe(-75);
		});

		it('deve processar valores máximos permitidos', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockImplementation((paramName: string) => {
					switch (paramName) {
						case 'operation':
							return 'generate';
						case 'min':
							return -1000000000;
						case 'max':
							return 1000000000;
						default:
							return undefined;
					}
				});

			mockHttpRequest.mockResolvedValue('0\n');

			const result = await randomNode.execute.call(mockExecuteFunctions);

			expect(result[0][0].json.randomNumber).toBe(0);
			expect(result[0][0].json.min).toBe(-1000000000);
			expect(result[0][0].json.max).toBe(1000000000);
		});
	});
});