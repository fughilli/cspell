import { suggestionCollector, SuggestionResult, SuggestionCollectorOptions } from './suggest';
import { suggest, genCompoundableSuggestions } from './suggestAStar';
import { CompoundWordsMethod } from './walker';
import { readTrie } from './dictionaries.test.helper';

function getTrie() {
    return readTrie('@cspell/dict-en_us/cspell-ext.json');
}

const timeout = 10000;

interface ExpectedSuggestion extends Partial<SuggestionResult> {
    word: string;
}

describe('Validate English Suggestions', () => {
    interface WordSuggestionsTest {
        word: string;
        expected: ExpectedSuggestion[];
    }

    // cspell:ignore emplode ballence catagory cateogry
    test.each`
        word          | expected
        ${'hello'}    | ${sr({ word: 'hello', cost: 0 })}
        ${'apple'}    | ${sr({ word: 'apple', cost: 0 }, { word: 'apples', cost: 100 })}
        ${'emplode'}  | ${sr('implode')}
        ${'dont'}     | ${sr("don't")}
        ${'ballence'} | ${sr('balance')}
        ${'catagory'} | ${sr('category')}
        ${'cateogry'} | ${sr({ word: 'category', cost: 75 })}
    `('suggestions for $word', async ({ word, expected }: WordSuggestionsTest) => {
        const trie = await getTrie();
        const x = suggest(trie.root, word);
        expect(x).toEqual(expect.arrayContaining(expected.map((e) => expect.objectContaining(e))));
    });

    test(
        'Tests suggestions "joyful"',
        async () => {
            const trie = await getTrie();
            const collector = suggestionCollector('joyful', opts(8, undefined, 1));
            collector.collect(genCompoundableSuggestions(trie.root, collector.word, CompoundWordsMethod.NONE));
            const results = collector.suggestions;
            const suggestions = results.map((s) => s.word);
            expect(suggestions).toEqual(expect.arrayContaining(['joyful']));
            expect(suggestions[0]).toBe('joyful');
        },
        timeout
    );

    // test(
    //     'Tests suggestions "joyfull"',
    //     async () => {
    //         const trie = await getTrie();
    //         // cspell:ignore joyfull
    //         const collector = suggestionCollector('joyfull', opts(8));
    //         collector.collect(
    //             genCompoundableSuggestions(trie.root, collector.word, CompoundWordsMethod.SEPARATE_WORDS)
    //         );
    //         const results = collector.suggestions;
    //         const suggestions = results.map((s) => s.word);
    //         expect(suggestions).toEqual(expect.arrayContaining(['joyful']));
    //         expect(suggestions[0]).toBe('joyfully');
    //         expect(suggestions[1]).toBe('joyful');
    //         expect(suggestions).toHaveLength(collector.maxNumSuggestions);
    //     },
    //     timeout
    // );

    // test(
    //     'Tests compound SEPARATE_WORDS suggestions',
    //     async () => {
    //         const trie = await getTrie();
    //         // cspell:ignore onetwothreefour
    //         const collector = suggestionCollector('onetwothreefour', opts(8, undefined, 3.3));
    //         collector.collect(
    //             genCompoundableSuggestions(trie.root, collector.word, CompoundWordsMethod.SEPARATE_WORDS)
    //         );
    //         const results = collector.suggestions;
    //         const suggestions = results.map((s) => s.word);
    //         expect(suggestions).toEqual(expect.arrayContaining(['one two three four']));
    //         expect(suggestions[0]).toBe('one two three four');
    //         expect(suggestions).toHaveLength(collector.maxNumSuggestions);
    //     },
    //     timeout
    // );

    // test(
    //     'Tests compound JOIN_WORDS suggestions',
    //     async () => {
    //         const trie = await getTrie();
    //         // cspell:ignore onetwothrefour
    //         const collector = suggestionCollector('onetwothreefour', opts(8, undefined, 3));
    //         collector.collect(genCompoundableSuggestions(trie.root, collector.word, CompoundWordsMethod.JOIN_WORDS));
    //         const results = collector.suggestions;
    //         const suggestions = results.map((s) => s.word);
    //         expect(suggestions).toEqual(expect.arrayContaining(['one+two+three+four']));
    //         expect(suggestions).toHaveLength(collector.maxNumSuggestions);
    //     },
    //     timeout
    // );

    // test(
    //     'Tests compound suggestions',
    //     async () => {
    //         const trie = await getTrie();
    //         // cspell:ignore onetwothrefour
    //         const collector = suggestionCollector('onetwothreefour', opts(8, undefined, 3));
    //         collector.collect(genCompoundableSuggestions(trie.root, collector.word, CompoundWordsMethod.JOIN_WORDS));
    //         const results = collector.suggestions;
    //         const suggestions = results.map((s) => s.word);
    //         expect(suggestions).toEqual(expect.arrayContaining(['one+two+three+four']));
    //         expect(suggestions).toHaveLength(collector.maxNumSuggestions);
    //     },
    //     timeout
    // );

    // // Takes a long time.
    // test(
    //     'Tests long compound suggestions `testscomputesuggestions`',
    //     async () => {
    //         const trie = await getTrie();
    //         // cspell:ignore testscomputesuggestions
    //         const collector = suggestionCollector('testscomputesuggestions', opts(2, undefined, 3, true));
    //         collector.collect(
    //             genCompoundableSuggestions(trie.root, collector.word, CompoundWordsMethod.SEPARATE_WORDS)
    //         );
    //         const results = collector.suggestions;
    //         const suggestions = results.map((s) => s.word);
    //         expect(suggestions).toHaveLength(collector.maxNumSuggestions);
    //         expect(suggestions).toEqual(['tests compute suggestions', 'test compute suggestions']);
    //         expect(suggestions[0]).toBe('tests compute suggestions');
    //     },
    //     timeout
    // );

    // // Takes a long time.
    // test(
    //     'Tests long compound suggestions `testscompundsuggestions`',
    //     async () => {
    //         const trie = await getTrie();
    //         // cspell:ignore testscompundsuggestions
    //         const collector = suggestionCollector('testscompundsuggestions', opts(1, undefined, 3));
    //         collector.collect(
    //             genCompoundableSuggestions(trie.root, collector.word, CompoundWordsMethod.SEPARATE_WORDS)
    //         );
    //         const results = collector.suggestions;
    //         const suggestions = results.map((s) => s.word);
    //         expect(suggestions).toHaveLength(collector.maxNumSuggestions);
    //         expect(suggestions).toEqual(expect.arrayContaining(['tests compound suggestions']));
    //         expect(suggestions[0]).toBe('tests compound suggestions');
    //     },
    //     timeout
    // );
});

function opts(
    numSuggestions: number,
    filter?: SuggestionCollectorOptions['filter'],
    changeLimit?: number,
    includeTies?: boolean,
    ignoreCase?: boolean
): SuggestionCollectorOptions {
    return {
        numSuggestions,
        filter,
        changeLimit,
        includeTies,
        ignoreCase,
    };
}

function sr(...sugs: (string | ExpectedSuggestion)[]): ExpectedSuggestion[] {
    return sugs.map((s) => {
        if (typeof s === 'string') return { word: s };
        return s;
    });
}