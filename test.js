const axios = require('axios');
const assert = require('assert');
// SWAPI endpoint
const swapiUrl = "https://swapi.dev/api";

//TEST DATA:
//NOTE in a real life test, we would have this data in a constants file, a test data JSON, or perhaps provided by Jenkins per test, but for the purpose of this evaluation it's provided here:
const testCharacters = [
    { characterName: "Luke Skywalker", expectedHeight: "172", expectedMass: "77", expectedSpecies: "" },
    { characterName: "Darth Maul", expectedHeight: "175", expectedMass: "80", expectedSpecies: "https://swapi.dev/api/species/22/" },
    { characterName: "Han Solo", expectedHeight: "180", expectedMass: "80", expectedSpecies: "Human" },
    { characterName: "Skywalker", expectedHeight: "180", expectedMass: "80", expectedSpecies: "Human" },
    { characterName: "NotACharacter", expectedHeight: "180", expectedMass: "80", expectedSpecies: "Human" }
// Note this data set provides for some failure conditions: Incorrect Species for Han Solo, more than one results for "Skywalker", and no results for "NotACharacter"
];

const testFilms = [
    { filmTitle: "A New Hope", expectedEpisodeID: 4, expectedDirector: "George Lucas", expectedPlanets: 3 },
    { filmTitle: "The Empire Strikes Back", expectedEpisodeID: 5, expectedDirector: "Irvin Kershner", expectedPlanets: 4 },
    { filmTitle: "Return of the Jedi", expectedEpisodeID: 7, expectedDirector: "Richard Marquand", expectedPlanets: 5 },
    { filmTitle: "The", expectedEpisodeID: 4, expectedDirector: "George Lucas", expectedPlanets: 3 },
    { filmTitle: "The Rise of Skywalker", expectedEpisodeID: 9, expectedDirector: "George Lucas", expectedPlanets: 7 }
// Note this data set provides for some failure conditions: episodeID for Return of the Jedi is incorrect, "The" yields more than one result and "The Rise of Skywalker is not present in the results from this API."
];


// Test Suite
describe('Star Wars API Tests', function () {

//timeout for this suite set to 10000ms as API call wasn't resolving quickly enough for the default timeout
this.timeout(10000);

// Test Case 1: Retrieve a list of all Star Wars characters
it('should retrieve a list of all Star Wars characters', async function () {

    const response = await axios.get(`${swapiUrl}/people`);
    assert.strictEqual(response.status, 200, 'Unexpected status code');

    const peopleCount = response.data.count;

    //Since the response counts the number of returned people with "count", we verify that the value for count is greater than 0.
    assert.ok(peopleCount > 0, `Expected at least one person but ${peopleCount} people were returned`); 
});


// Test Case 2: Retrieve details for a specific Star Wars character
testCharacters.forEach(({ characterName, expectedHeight, expectedMass, expectedSpecies }) => {
    it(`should retrieve details for character "${characterName}"`, async function () {
        const response = await axios.get(`${swapiUrl}/people/?search=${characterName}`);
        assert.strictEqual(response.status, 200, 'Unexpected status code');

        //Handle cases where search yields no results or more than one result. More than one result would probably be a separate test case if the expected result is indeed more than one. But this is not in the current scope.
        const peopleCount = response.data.count;
        if (peopleCount > 1) { 
            assert.fail(`More than one character returned for "${characterName}"`); 
        }
        if (peopleCount == 0) { 
            assert.fail(`No characters returned for "${characterName}"`); 
        }

        //Verifies character's height data
        const returnedHeight = response.data.results[0].height;
        assert.strictEqual(expectedHeight, returnedHeight, `Expected a height of "${expectedHeight}" for ${characterName}, but "${returnedHeight}" was returned`);

        //Verifies character's mass data
        const returnedMass = response.data.results[0].mass;
        assert.strictEqual(expectedMass, returnedMass, `Expected a mass of "${expectedMass}" for ${characterName}, but "${returnedMass}" was returned`);

        //Verifies character's species. Chose this data point because the results were in an array, and sometimes empty, so this was less straight-forward than other checks.
        const returnedSpeciesArray = response.data.results[0].species;
        const returnedSpecies = returnedSpeciesArray.length > 0 ? returnedSpeciesArray[0] : "";
        assert.strictEqual(expectedSpecies, returnedSpecies, `Expected species "${expectedSpecies}" for ${characterName}, but "${returnedSpecies}" was returned`);
    });
});


// Test Case 3: Retrieve a list of all Star Wars films
it('should retrieve a list of all Star Wars films', async function () {
    const response = await axios.get(`${swapiUrl}/films`);
    assert.strictEqual(response.status, 200, 'Unexpected status code');
    
    const filmCount = response.data.count;
    
    //Since the response counts the number of returned films with "count", we verify that the value for count is greater than 0.
    assert.ok(filmCount > 0, `Expected at least one film but ${filmCount} films were returned`); 
});



// Test Case 4: Retrieve details for a specific Star Wars film
testFilms.forEach(({ filmTitle, expectedEpisodeID, expectedDirector, expectedPlanets }) => {
    it(`should retrieve details for the film titled "${filmTitle}"`, async function () {
        const response = await axios.get(`${swapiUrl}/films/?search=${filmTitle}`);
        assert.strictEqual(response.status, 200, 'Unexpected status code');

        //Handle cases where search yields no results or more than one result. More than one result would probably be a separate test case if the expected result is indeed more than one. But this is not in the current scope.
        const filmCount = response.data.count;
        if (filmCount > 1) { 
            assert.fail(`More than one film returned for "${filmTitle}"`); 
        }
        if (filmCount == 0) { 
            assert.fail(`No films returned for "${filmTitle}"`); 
        }

        //Verifies the episodeID for the given film. Note this is an integer and not a string.
        const returnedEpisodeID = response.data.results[0].episode_id;
        assert.strictEqual(expectedEpisodeID, returnedEpisodeID, `Expected episode ID "${expectedEpisodeID}" for ${filmTitle}, but "${returnedEpisodeID}" was returned`);

        //Verifies the director for a given film.
        const returnedDirector = response.data.results[0].director;
        assert.strictEqual(expectedDirector, returnedDirector, `Expected director "${expectedDirector}" for ${filmTitle}, but "${returnedDirector}" was returned`);

        //Verifies the number of planets in a film. Chose this because it is present as an array.
        const returnedPlanets = response.data.results[0].planets.length;
        assert.strictEqual(expectedPlanets, returnedPlanets, `Expected ${expectedPlanets} planets for ${filmTitle}, but ${returnedPlanets} were returned`);
    });
});

})