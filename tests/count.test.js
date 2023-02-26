const Count = require('../models/count');
const { BadRequestError } = require('../expressError');
const {
        commonBeforeAll,
        commonBeforeEach,
        commonAfterEach,
        commonAfterAll,
        testContainerIds,
        stamp1,
        stamp2,
        stamp3
    } = require("./testCommonModels");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe('addCount', function() {
    const time = new Date();
    const timestamp = time.getTime();
    test('works', async function() {
        const count = await Count.addCount({containerId: testContainerIds[0], 
                                        cash: 600, time, timestamp, note: null});
        expect(count).toEqual({containerId: testContainerIds[0], 
                                id: expect.any(Number),
                                cash: '600.00',
                                time: expect.any(String),
                                timestamp: timestamp.toString(),
                                note: null});
    });
});

describe('getCounts', function() {
    const start = new Date('26 February 2020 13:00:00').getTime();
    const end = new Date('26 February 2030 13:00:00').getTime();
    test('works', async function() {
        const counts = await Count.getCounts(testContainerIds[0], start, end);
        expect(counts).toEqual([{id: expect.any(Number),
                                containerId: testContainerIds[0],
                                cash: '70.00',
                                time: expect.any(String),
                                timestamp: stamp3.toString(),
                                note: null
                                },
                                {
                                id: expect.any(Number),
                                containerId: testContainerIds[0],
                                cash: '550.00',
                                time: expect.any(String),
                                timestamp: stamp2.toString(),
                                note: null
                                },
                                {
                                id: expect.any(Number),
                                containerId: testContainerIds[0],
                                cash: '500.00',
                                time: expect.any(String),
                                timestamp: stamp1.toString(),
                                note: 'testNote'}])
    });

    test('filters by date', async function() {
        const lateStart = new Date('28 February 2023 13:00:00').getTime();
        const counts = await Count.getCounts(testContainerIds[0], lateStart, end);
        expect(counts).toEqual([{id: expect.any(Number),
                                containerId: testContainerIds[0],
                                cash: '70.00',
                                time: expect.any(String),
                                timestamp: stamp3.toString(),
                                note: null
                                },
                                {
                                id: expect.any(Number),
                                containerId: testContainerIds[0],
                                cash: '550.00',
                                time: expect.any(String),
                                timestamp: stamp2.toString(),
                                note: null
                                }])
    })
});