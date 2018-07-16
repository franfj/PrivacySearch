/*
* Preprocess the input query
*
* INPUT: The input query
* OUTPUT: An array of preprocessed n-grams
*/
function preProcessQuery(query) {
    // 1. Convert query to lowercase
    query = query.trim().toLowerCase();

    // 2. Remove punctuation
    query = removePunctuation(query);

    // 3. Convert query to array
    var queryArray = query.split(" ");

    // 4. Trim query array & Remove stop-words
    queryArray = removeStopWords(queryArray);

    // 5. Lemmatisation
    queryArray = lemmatizeQuery(queryArray);

    // 6. Singularize terms
    queryArray = singularizeQuery(queryArray);

    // 7. Obtain 2-grams
    queryArray = obtainNGrams(queryArray);

    // 8. Remove n-grams not in WordNet
	queryArray = removeNGramsNotInWordNet(queryArray);

    return queryArray;
}

/*
 * Remove punctuation from a query
 *
 * INPUT: A query
 * OUTPUT: The query without any punctuation character
 */
function removePunctuation(query) {
    query = query.replace(/[^\w\s]|/g, "").replace(/\s+/g, " ");
    return query
}

/*
 * Remove n-grams that do not exists in WordNet from a query
 *
 * INPUT: A query array
 * OUTPUT: The query array only with existent n-grams
 */
function removeNGramsNotInWordNet(queryArray) {
    var queriesToRemove = [];

    // First we add to the queriesToRemove array which terms will be removed
    for (var i = 0; i < queryArray.length; ++i) {
        if (index_map[queryArray[i]] === undefined) {
            queriesToRemove.push(i);
        }
    }

    // Then the terms added to the queriesToRemove array are removed
    for (var i = queriesToRemove.length - 1; i >= 0; --i) {
        queryArray.splice(queriesToRemove[i], 1);
    }
    return queryArray;
}

/*
 * Remove stop words from a query
 * The stop words map is stored in js/en_stopwords.js
 *
 * INPUT: A query
 * OUTPUT: The query without stop words
 */
function removeStopWords(queryArray) {
    var queriesToRemove = [];

    // First we add to the queriesToRemove array which terms will be removed
    for (var i = 0; i < queryArray.length; ++i) {
        queryArray[i] = queryArray[i].trim();
        if (en_stopwords[queryArray[i]]) {
            queriesToRemove.push(i);
        }
    }

    // Then the terms added to the queriesToRemove array are removed
    for (var i = queriesToRemove.length - 1; i >= 0; --i) {
        queryArray.splice(queriesToRemove[i], 1);
    }
    return queryArray;
}

/*
 * Lemmatize terms
 * The lemmas maps are stored in js/exc/noun.exc.js, js/exc/verb.exc.js, js/exc/adv.exc.js, js/exc/adj.exc.js
 *
 * INPUT: An array of terms
 * OUTPUT: The array with every term lemmatized
 */
function lemmatizeQuery(queryArray) {
    for (var i = 0; i < queryArray.length; ++i) {
        // Search in the lemmas map
        if (lemm_map[queryArray[i]] !== undefined) {
            queryArray[i] = lemm_map[queryArray[i]][0];
        }
    }

    return queryArray;
}

/*
 * Singularize terms
 *
 * INPUT: An array of terms
 * OUTPUT: The array with every term singularized
 */
function singularizeQuery(queryArray) {
    for (var i = 0; i < queryArray.length; ++i) {
        queryArray[i] = queryArray[i].plural(true).toString();
    }

    return queryArray;
}

/*
 * Get 2-grams (not generalized for n-grams) that exists in WordNet
 *
 * INPUT: An array of terms
 * OUTPUT: The array with 2-grams
 */
function obtainNGrams(queryArray) {
    for (var i = 0; i < queryArray.length - 1; ++i) {
        var nGramToBeTested = queryArray[i] + "_" + queryArray[i + 1];

        // Search in the index map
        if (index_map[nGramToBeTested] !== undefined) {
            queryArray.splice(i, 1);
            queryArray[i] = nGramToBeTested;
        }
    }

    return queryArray;
}