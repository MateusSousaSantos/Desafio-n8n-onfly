import 'jest';

global.console = {
	...console,
	// Uncomment to silence console during tests
	// log: jest.fn(),
	// debug: jest.fn(),
	// info: jest.fn(),
	// warn: jest.fn(),
	// error: jest.fn(),
};

beforeEach(() => {
	jest.clearAllMocks();
});