/*
 * Algorithm implemented:
 *
 * 1. Let your sentence be A B C
 * 2. Let each word have synsets
 *    i.e. {A:(a1, a2, a3), B:(b1), C:(c1, c2)}
 * 3. Now form possible synset sets:
 *    (a1, b1, c1), (a1, b1, c2), (a2, b1, c1) ... (a3, b1, c2)
 * 4. Define function F(a, b, c) which returns the distance (score)
 *    between (a, b, c).
 * 5. Call F on each synset set.
 * 6. Pick the set with the maximum score.
*/

/*
* Execute the wsd algorithm
*
* INPUT: The input query
* OUTPUT: The categorized query
*/
function wsd(queryArray, privacyLevel) {
    // Step 1, 2
    // The possible synsets for every term
    var synsets = getQuerySynsets(queryArray);
    // The list to the root of every synset
    var synsetsPathsToRoot = getListToRoot(synsets);

    // Step 3
    var maxBinaryPermutation = 0;
    var possiblesPermutations = 1;
    var synsetMaxBinaryPermutation = [];

    for (var i = 0; i < queryArray.length; ++i) {
        var permutationLength = (synsets.get(i).length - 1).toString(2).length;

        if (LIMITED_PERMUTATIONS && permutationLength > LIMITATION_LENGTH) {
            maxBinaryPermutation += LIMITATION_LENGTH;
            possiblesPermutations *= Math.pow(2, LIMITATION_LENGTH);
            synsetMaxBinaryPermutation.push(LIMITATION_LENGTH);
        } else {
            maxBinaryPermutation += permutationLength;
            possiblesPermutations *= Math.pow(2, permutationLength);

            synsetMaxBinaryPermutation.push(permutationLength);
        }
    }

    var currentPermutation = 0;

    var bestPermutationScore = Number.MAX_SAFE_INTEGER;
    var bestPermutationSet;

    while (currentPermutation < possiblesPermutations) {
        var currentBinaryPermutation = fillWithZeroes(currentPermutation.toString(2), maxBinaryPermutation);
        var currentPermutationSet = getPermutation(synsetMaxBinaryPermutation, currentBinaryPermutation);

        // Step 4
        var currentScore = testPermutation(synsetsPathsToRoot, currentPermutationSet);

        // Step 5, 6
        if (currentScore < bestPermutationScore) {
            bestPermutationScore = currentScore;
            bestPermutationSet = currentPermutationSet;
        }

        currentPermutation++;
    }

    var result = "";

    for (var i = 0; i < bestPermutationSet.length; ++i) {
		// Depth is 0 in privacy level 1
		var depth = 0
		
		parentsLength = synsetsPathsToRoot.get(i)[bestPermutationSet[i]].length - 1;
		if (privacyLevel === 2) {
			depth = Math.floor(parentsLength * 0.1) + 1;
			
		} else if (privacyLevel === 3) {
			depth = Math.floor(parentsLength * 0.2) + 1;
		}
		
        var index = synsetsPathsToRoot.get(i)[bestPermutationSet[i]][depth];

        if (data_map[index] !== undefined) {
            var nodeItem = data_map[index];
            result += nodeItem[WORDNET_DATA_TERM_INDEX].replace("_", " ") + " ";
        } 
    }

    return result ;
}

/*
* Get a list of synsets related with every term of the query array
*
* INPUT: The input query
* OUTPUT: An map of synsets related with every term of the query array
*/
function getQuerySynsets(queryArray) {
    var synsets = new Map();

    for (var i = 0; i < queryArray.length; ++i) {
        synsets.set(i, []);

        // Search in the index map
        if (index_map[queryArray[i]] !== undefined) {
            var nounIndex = index_map[queryArray[i]];
            for (var j = 0; j < nounIndex.length; ++j) {
                if (nounIndex[j].length === INDEX_LENGTH && !isNaN(nounIndex[j])) {
                    var updatedIndex = synsets.get(i);
                    updatedIndex.push(nounIndex[j]);
                    synsets.set(i, updatedIndex);
                }
            }
        } 
    }

    return synsets
}

/*
 * Get a list to the WordNet root item for every synset in the input map
 *
 * INPUT: A map of synsets
 * OUTPUT: A map of lists with every path to the root of every synset
 */
function getListToRoot(synsets) {
    var synsetsPathsToRoot = new Map();

    for (var i = 0; i < synsets.size; ++i) {
        synsetsPathsToRoot.set(i, []);
        for (var j = 0; j < synsets.get(i).length; ++j) {
            synsetsPathsToRoot.get(i).push([]);
        }
    }

    for (var i = 0; i < synsets.size; ++i) {
        for (var j = 0; j < synsets.get(i).length; ++j) {
            var parentNode = getParentNode(synsets.get(i)[j]);
            synsetsPathsToRoot.get(i)[j].push(parentNode);

            while (parentNode !== WORDNET_ROOT) {
                // For avoiding direct hyperonims loops
                var loop = false;
                var parentToTest = getParentNode(parentNode);
                for (var hyper = 0; hyper < synsetsPathsToRoot.get(i)[j].length; ++hyper) {
                    if (synsetsPathsToRoot.get(i)[j][hyper] === parentToTest) {
                        parentToTest = getParentNode(parentNode, parentToTest);
                        loop = true;
                    }
                }

                if (!loop) {
                    parentNode = parentToTest;
                }

                synsetsPathsToRoot.get(i)[j].push(parentNode);

                if (synsetsPathsToRoot.get(i)[j].length == MAX_PARENTS) {
                    parentNode = WORDNET_ROOT;
                    synsetsPathsToRoot.get(i)[j].push(parentNode);
                }
            }
        }
    }

    return synsetsPathsToRoot;
}

/*
 * Util method for the permutations step
 * It fills with zeroes a binary string until getting to n
 *
 * INPUT: A binary string, and a length
 * OUTPUT: A map of lists with every path to the root of every synset
 */
function fillWithZeroes(permutation, n) {
    if (permutation.length < n) {
        for (var i = permutation.length; i < n; ++i) {
            permutation = "0" + permutation;
        }
    }
    return permutation
}

/*
 * It fills with zeroes a binary string until getting to n
 *
 * INPUT: The path to root of every synset, and a binary string
 * OUTPUT: A valid permutation
 */
function getPermutation(synsetMaxBinaryPermutation, binaryPermutation) {
    var offset = 0;
    var result = [];
    for (var i = 0; i < synsetMaxBinaryPermutation.length; ++i) {
        result.push(parseInt(binaryPermutation.substring(offset, offset + synsetMaxBinaryPermutation[i]), 2));
        offset += synsetMaxBinaryPermutation[i];
    }
    return result;
}

/*
 * Get the score of a given permutation
 *
 * INPUT: The path to root of every synset, and permutation
 * OUTPUT: The score
 */
function testPermutation(synsetsPathsToRoot, permutation) {
    var totalScore = 0;

    for (var i = 0; i < permutation.length; ++i) {
        for (var j = i + 1; j < permutation.length; ++j) {
            var synsetA = synsetsPathsToRoot.get(i)[permutation[i]];
            var synsetB = synsetsPathsToRoot.get(j)[permutation[j]];
            totalScore += testPairOfSynsets(synsetA, synsetB);
        }
    }

    if (permutation.length > 2) {
        totalScore /= ((Math.pow(permutation.length - 1, 2) + permutation.length - 1) / 2);
    }

    return totalScore;
}

/*
 * Get the score of a given permutation for a pair of synsets
 *
 * INPUT: A couple of synsets
 * OUTPUT: The score
 */
function testPairOfSynsets(synsetA, synsetB) {
    if (synsetA === undefined || synsetB === undefined) {
        return Number.MAX_SAFE_INTEGER;
    }

    var score = 0;

    var biggerSynset;
    var smallerSynset;
    var loopSize = 0;
    var smallerSize = 0;

    if (synsetA.length > synsetB.length) {
        biggerSynset = synsetA;
        smallerSynset = synsetB;
        loopSize = synsetA.length;
        smallerSize = synsetB.length;
    } else {
        biggerSynset = synsetB;
        smallerSynset = synsetA;
        loopSize = synsetB.length;
        smallerSize = synsetA.length;
    }

    for (var i = 0; i < loopSize; ++i) {
        score += (1 / loopSize) / 2;
        if (i < smallerSize) {
            score += (1 / smallerSize) / 2;
        }

        for (var j = 0; j < smallerSize; ++j) {
            if (biggerSynset[i] === smallerSynset[j]) {
                return score;
            }
        }
    }

    return score;
}

/*
 * Get the parent node of a term in the WordNet hierarchy
 *
 * INPUT: The current node, and a vetoed parent
 * OUTPUT: The parent
 */
function getParentNode(node, veto) {
    //Search in the data map
    if (data_map[node] !== undefined) {
        var nodeItem = data_map[node];
        for (var k = 2; k < nodeItem.length; ++k) {
            if (nodeItem[k].length === INDEX_LENGTH && nodeItem[k] !== veto && !isNaN(nodeItem[k])) {
                return nodeItem[k];
            }
        }
    } 
}