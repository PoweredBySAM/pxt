 const LEDPatterns = [
        {
            name: 'heart',
            array: () => [
                [0, 1, 0, 1, 0],
                [1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1],
                [0, 1, 1, 1, 0],
                [0, 0, 1, 0, 0],
            ],
        },
        {
            name: 'small heart',
            array: () => [
                [0, 0, 0, 0, 0],
                [0, 1, 0, 1, 0],
                [0, 1, 1, 1, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 0, 0, 0],
            ],
        },
        {
            name: 'yes',
            array: () => [
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 1],
                [0, 0, 0, 1, 0],
                [1, 0, 1, 0, 0],
                [0, 1, 0, 0, 0],
            ],
        },
        {
            name: 'no',
            array: () => [
                [1, 0, 0, 0, 1],
                [0, 1, 0, 1, 0],
                [0, 0, 1, 0, 0],
                [0, 1, 0, 1, 0],
                [1, 0, 0, 0, 1],
            ],
        },
        {
            name: 'happy',
            array: () => [
                [0, 0, 0, 0, 0],
                [0, 1, 0, 1, 0],
                [0, 0, 0, 0, 0],
                [1, 0, 0, 0, 1],
                [0, 1, 1, 1, 0],
            ],
        },
        {
            name: 'sad',
            array: () => [
                [0, 0, 0, 0, 0],
                [0, 1, 0, 1, 0],
                [0, 0, 0, 0, 0],
                [0, 1, 1, 1, 0],
                [1, 0, 0, 0, 1],
            ],
        },
        {
            name: 'confused',
            array: () => [
                [0, 0, 0, 0, 0],
                [0, 1, 0, 1, 0],
                [0, 0, 0, 0, 0],
                [0, 1, 0, 1, 0],
                [1, 0, 1, 0, 1],
            ],
        },
        {
            name: 'angry',
            array: () => [
                [1, 0, 0, 0, 1],
                [0, 1, 0, 1, 0],
                [0, 0, 0, 0, 0],
                [1, 1, 1, 1, 1],
                [1, 0, 1, 0, 1],
            ]
        },
        {
            name: 'asleep',
            array: () => [
                [0, 0, 0, 0, 0],
                [1, 1, 0, 1, 1],
                [0, 0, 0, 0, 0],
                [0, 1, 1, 1, 0],
                [0, 0, 0, 0, 0],
            ]
        },
        {
            name: 'surprised',
            array: () => [
                [0, 1, 0, 1, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 1, 0, 1, 0],
                [0, 0, 1, 0, 0],
            ],
        },
        {
            name: 'silly',
            array: () => [
                [1, 0, 0, 0, 1],
                [0, 0, 0, 0, 0],
                [1, 1, 1, 1, 1],
                [0, 0, 0, 1, 1],
                [0, 0, 0, 1, 1],
            ],
        },
        {
            name: 'fabulous',
            array: () => [
                [1, 1, 1, 1, 1],
                [1, 1, 0, 1, 1],
                [0, 0, 0, 0, 0],
                [0, 1, 0, 1, 0],
                [0, 1, 1, 1, 0],
            ],
        },
        {
            name: 'meh',
            array: () => [
                [1, 1, 0, 1, 1],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 1, 0],
                [0, 0, 1, 0, 0],
                [0, 1, 0, 0, 0],
            ],
        },
        {
            name: 't-shirt',
            array: () => [
                [1, 1, 0, 1, 1],
                [1, 1, 1, 1, 1],
                [0, 1, 1, 1, 0],
                [0, 1, 1, 1, 0],
                [0, 1, 1, 1, 0],
            ],
        },
        {
            name: 'roller skate',
            array: () => [
                [0, 0, 0, 1, 1],
                [0, 0, 0, 1, 1],
                [1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1],
                [0, 1, 0, 1, 0],
            ],
        },
        {
            name: 'duck',
            array: () => [
                [0, 1, 1, 0, 0],
                [1, 1, 1, 0, 0],
                [0, 1, 1, 1, 1],
                [0, 1, 1, 1, 0],
                [0, 0, 0, 0, 0],
            ],
        },
        {
            name: 'house',
            array: () => [
                [0, 0, 1, 0, 0],
                [0, 1, 1, 1, 0],
                [1, 1, 1, 1, 1],
                [0, 1, 1, 1, 0],
                [0, 1, 0, 1, 0],
            ],
        },
        {
            name: 'tortoise',
            array: () => [
                [0, 0, 0, 0, 0],
                [0, 1, 1, 1, 0],
                [1, 1, 1, 1, 1],
                [0, 1, 0, 1, 0],
                [0, 0, 0, 0, 0],
            ],
        },
        {
            name: 'butterfly',
            array: () => [
                [1, 1, 0, 1, 1],
                [1, 1, 1, 1, 1],
                [0, 0, 1, 0, 0],
                [1, 1, 1, 1, 1],
                [1, 1, 0, 1, 1],
            ]
        },
        {
            name: 'stick figure',
            array: () => [
                [0, 0, 1, 0, 0],
                [1, 1, 1, 1, 1],
                [0, 0, 1, 0, 0],
                [0, 1, 0, 1, 0],
                [1, 0, 0, 0, 1],
            ],
        },
        {
            name: 'ghost',
            array: () => [
                [0, 1, 1, 1, 0],
                [1, 0, 1, 0, 1],
                [1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1],
                [1, 0, 1, 0, 1],
            ],
        },
        {
            name: 'sword',
            array: () => [
                [0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 1, 1, 1, 0],
                [0, 0, 1, 0, 0],
            ],
        },
        {
            name: 'giraffe',
            array: () => [
                [1, 1, 0, 0, 0],
                [0, 1, 0, 0, 0],
                [0, 1, 0, 0, 0],
                [0, 1, 1, 1, 0],
                [0, 1, 0, 1, 0],
            ],
        },
        {
            name: 'skull',
            array: () => [
                [0, 1, 1, 1, 0],
                [1, 0, 1, 0, 1],
                [1, 1, 1, 1, 1],
                [0, 1, 1, 1, 0],
                [0, 1, 1, 1, 0],
            ],
        },
        {
            name: 'umbrella',
            array: () => [
                [0, 1, 1, 1, 0],
                [1, 1, 1, 1, 1],
                [0, 0, 1, 0, 0],
                [1, 0, 1, 0, 0],
                [1, 1, 1, 0, 0],
            ],
        },
        {
            name: 'snake',
            array: () => [
                [1, 1, 0, 0, 0],
                [1, 1, 0, 1, 1],
                [0, 1, 0, 1, 0],
                [0, 1, 1, 1, 0],
                [0, 0, 0, 0, 0],
            ],
        },
        {
            name: 'rabbit',
            array: () => [
                [1, 0, 1, 0, 0],
                [1, 0, 1, 0, 0],
                [1, 1, 1, 1, 0],
                [1, 1, 0, 1, 0],
                [1, 1, 1, 1, 0],
            ],
        },
        {
            name: 'cow',
            array: () => [
                [1, 0, 0, 0, 1],
                [1, 0, 0, 0, 1],
                [1, 1, 1, 1, 1],
                [0, 1, 1, 1, 0],
                [0, 0, 1, 0, 0],
            ],
        },
        {
            name: 'quarter note',
            array: () => [
                [0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0],
                [1, 1, 1, 0, 0],
                [1, 1, 1, 0, 0],
            ],
        },
        {
            name: 'eighth note',
            array: () => [
                [0, 0, 1, 0, 0],
                [0, 0, 1, 1, 0],
                [0, 0, 1, 0, 1],
                [1, 1, 1, 0, 0],
                [1, 1, 1, 0, 0],
            ],
        },
        {
            name: 'pitch fork',
            array: () => [
                [1, 0, 1, 0, 1],
                [1, 0, 1, 0, 1],
                [1, 1, 1, 1, 1],
                [0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0],
            ],
        },
        {
            name: 'target',
            array: () => [
                [0, 0, 1, 0, 0],
                [0, 1, 0, 1, 0],
                [1, 1, 0, 1, 1],
                [0, 1, 0, 1, 0],
                [0, 0, 1, 0, 0],
            ],
        },
        {
            name: 'triangle',
            array: () => [
                [0, 0, 0, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 1, 0, 1, 0],
                [1, 1, 1, 1, 1],
                [0, 0, 0, 0, 0],
            ],
        },
        {
            name: 'left triangle',
            array: () => [
                [1, 0, 0, 0, 0],
                [1, 1, 0, 0, 0],
                [1, 0, 1, 0, 0],
                [1, 0, 0, 1, 0],
                [1, 1, 1, 1, 1],
            ],
        },
        {
            name: 'chessboard',
            array: () => [
                [0, 1, 0, 1, 0],
                [1, 0, 1, 0, 1],
                [0, 1, 0, 1, 0],
                [1, 0, 1, 0, 1],
                [0, 1, 0, 1, 0],
            ]
        },
        {
            name: 'diamond',
            array: () => [
                [0, 0, 1, 0, 0],
                [0, 1, 0, 1, 0],
                [1, 0, 0, 0, 1],
                [0, 1, 0, 1, 0],
                [0, 0, 1, 0, 0],
            ]
        },
        {
            name: 'small diamond',
            array: () => [
                [0, 0, 0, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 1, 0, 1, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 0, 0, 0],
            ],
        },
        {
            name: 'square',
            array: () => [
                [1, 1, 1, 1, 1],
                [1, 0, 0, 0, 1],
                [1, 0, 0, 0, 1],
                [1, 0, 0, 0, 1],
                [1, 1, 1, 1, 1],
            ],
        },
        {
            name: 'small square',
            array: () => [
                [0, 0, 0, 0, 0],
                [0, 1, 1, 1, 0],
                [0, 1, 0, 1, 0],
                [0, 1, 1, 1, 0],
                [0, 0, 0, 0, 0],
            ],
        },
        {
            name: 'scissors',
            array: () => [
                [1, 1, 0, 0, 1],
                [1, 1, 0, 1, 0],
                [0, 0, 1, 0, 0],
                [1, 1, 0, 1, 0],
                [1, 1, 0, 0, 1],
            ],
        },
    ];
 export default LEDPatterns;
