const db = require("../db.js");
const User = require("../models/user");
const Company = require('../models/company');
const { createToken } = require("../helpers");


async function commonBeforeAll() {
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM companies");
    await db.query("DELETE FROM company_admins");
    await db.query("DELETE FROM company_users");
    await db.query("DELETE FROM containers");
    await db.query("DELETE FROM counts");
    await db.query("DELETE FROM notes");

    // testOrgIds[0] = (await Organization.add('Org1')).orgId;
    // testOrgIds[1] = (await Organization.add('Org2')).orgId;
    // testOrgIds[2] = (await Organization.add('Org3')).orgId;    

    // testSeasonIds[0] = (await Organization.addSeason('testSeason1', testOrgIds[0])).seasonId;
    // testSeasonIds[1] = (await Organization.addSeason('testSeason2', testOrgIds[0])).seasonId;
    // testSeasonIds[2] = (await Organization.addSeason('testTournament1', testOrgIds[0])).seasonId;

    // const testTeams = await Organization.addTeams([{teamName: 'testTeam1', color: 'red'}, 
    //                                                 {teamName: 'testTeam2', color: 'black'},
    //                                                 {teamName: 'testTeam3', color: 'N/A'},
    //                                                 {teamName: 'testTeam4', color: 'N/A'}], testOrgIds[0]);
    // testTeamIds[0] = testTeams[0].teamId;
    // testTeamIds[1] = testTeams[1].teamId;
    // testTeamIds[2] = testTeams[2].teamId;
    // testTeamIds[3] = testTeams[3].teamId;

    // await Organization.seasonTeams([{teamId: testTeamIds[0]}, 
    //                                 {teamId: testTeamIds[1]},
    //                                 {teamId: testTeamIds[2]}], testSeasonIds[0])

    // const testGames = await Organization.addGames(testSeasonIds[0], [
    //     {team1Id: testTeamIds[0],
    //     team2Id: testTeamIds[1],
    //     gameDate: '2021-12-12',
    //     gameTime: '12:00:00',
    //     gameLocation: 'testLocation',
    //     team1Score: 21,
    //     team2Score: 22,
    //     notes: 'frightening'},
    //     {team1Id: testTeamIds[1],
    //     team2Id: testTeamIds[0],
    //     gameDate: null,
    //     gameTime: null,
    //     gameLocation: '',
    //     team1Score: null,
    //     team2Score: null,
    //     notes: ''},
    //     {team1Id: testTeamIds[1],
    //     team2Id: testTeamIds[2],
    //     gameDate: null,
    //     gameTime: null,
    //     gameLocation: '',
    //     team1Score: null,
    //     team2Score: null,
    //     notes: ''}
    // ]);
    // testGameIds[0] = testGames[0].gameId;
    // testGameIds[1] = testGames[1].gameId;
    // testGameIds[2] = testGames[2].gameId;

    await Company.create('testco');

    await User.create({
        id: 'test1',
        email: "test1@test.com",
        firstName: "Bob",
        lastName: "Testy",
        password: "password1",
        superAdmin: true
    });
    await User.create({
        id: 'test2',
        email: "test2@test.com",
        firstName: "Barb",
        lastName: "Tasty",
        password: "password1",
        superAdmin: false,
        userCompanyCode: 'testco',
        active: true,
        companyAdmin: true,
        emailReceiver: true
    });
    await User.create({
        id: 'test3',
        firstName: "Bulb",
        lastName: "Toasty",
        superAdmin: false,
        userCompanyCode: 'testco'
    });
    await User.create({
        id: 'test4',
        firstName: "Breb",
        lastName: "Touchy",
        superAdmin: false,
        userCompanyCode: 'testco',
        password: 'password1'
    });

    // await User.addUserOrganization("test1@test.com", testOrgIds[0], 3);
    // await User.addUserOrganization("test2@test.com", testOrgIds[0], 1);
    // await User.addUserOrganization("test2@test.com", testOrgIds[1], 2);

};

async function commonBeforeEach() {
    await db.query("BEGIN");
};

async function commonAfterEach() {
    await db.query("ROLLBACK");
};

async function commonAfterAll() {
    await db.end();
};


const bobToken = createToken({id: 'test1',
                                email: "test1@test.com",
                                firstName: "Bob",
                                lastName: "Testy",
                                password: "password1",
                                superAdmin: true});
const barbToken = createToken({id: 'test2',
                                email: "test2@test.com",
                                firstName: "Barb",
                                lastName: "Tasty",
                                password: "password1",
                                superAdmin: false,
                                userCompanyCode: 'testco',
                                adminCompanyCode: 'testco',
                                active: true,
                                emailReceiver: true});


module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    bobToken,
    barbToken
};